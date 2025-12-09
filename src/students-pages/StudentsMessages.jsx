// src/StudentMessageForm.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const StudentMessageForm = () => {
  const [tab, setTab] = useState("send");
  const [studentInfo, setStudentInfo] = useState({ uid: null, name: "", grade: "" });
  const [content, setContent] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [reacted, setReacted] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [recipientId, setRecipientId] = useState("");

  const [receivedMessages, setReceivedMessages] = useState([]);

  // --- 生徒情報 ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setStudentInfo((prev) => ({
          ...prev,
          uid: user.uid,
          name: user.displayName || prev.name,
        }));
      }
    });
    return unsubscribe;
  }, []);

  // --- 教師一覧 ---
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const ref = collection(db, "teachers");
        const snap = await getDocs(ref);
        if (snap.empty) {
          setTeachers([]);
          return;
        }
        const list = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            uid: data.uid || d.id,
            ...data,
          };
        });
        console.log("👨‍🏫 取得した教師データ:", list);
        setTeachers(list);
      } catch (error) {
        console.log("教師データ取得エラー:", error);
        setTeachers([]);
      }
    };
    loadTeachers();
  }, []);

  // --- 自分の送信 ---
  useEffect(() => {
    if (!studentInfo.uid) return;
    const q = query(
      collection(db, "messages"),
      where("senderId", "==", studentInfo.uid),
      
    );
    const unsub = onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    return () => unsub();
  }, [studentInfo.uid]);

  // 🔵 受信メッセージ（教師から）- 修正版
  useEffect(() => {
    if (!studentInfo.uid) return;
    
    // 自分のドキュメントIDも取得
    const getMyId = async () => {
      const studentsSnap = await getDocs(
        query(collection(db, "students"), where("uid", "==", studentInfo.uid))
      );
      const myDocId = studentsSnap.docs[0]?.id;
      
      console.log("🔍 受信確認 - 自分のUID:", studentInfo.uid);
      console.log("🔍 受信確認 - 自分のDocID:", myDocId);
      
      // uid または id どちらで送られても受信できるようにする
      const q = query(
        collection(db, "messages"),
        where("senderType", "==", "teacher")
      );
      
      const unsub = onSnapshot(q, (snap) => {
        const allTeacherMessages = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("📬 教師からの全メッセージ:", allTeacherMessages);
        
        const filtered = allTeacherMessages.filter((msg) => 
          msg.recipientId === studentInfo.uid || msg.recipientId === myDocId
        );
        console.log("✅ 自分宛のメッセージ:", filtered);
        setReceivedMessages(filtered);
      });
      return unsub;
    };
    
    getMyId();
  }, [studentInfo.uid]);

  // --- 生徒 → 教師 送信 ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !recipientId) {
      alert("送りたい先生を選択してください");
      return;
    }
    
    const messageData = {
      senderId: studentInfo.uid,
      senderName: studentInfo.name,
      grade: studentInfo.grade,
      content: content,
      recipientId: recipientId,
      senderType: "student",
      replies: [],
      createdAt: serverTimestamp(),
    };
    
    console.log("📤 送信するデータ:", messageData);
    console.log("📤 recipientId (教師のUID):", recipientId);
    console.log("📤 選択した教師:", teachers.find(t => t.uid === recipientId));
    
    try {
      await addDoc(collection(db, "messages"), messageData);
      setContent("");
      setSendStatus("送信完了");
    } catch (err) {
      console.error(err);
      setSendStatus("送信失敗");
    }
  };

  // --- 生徒側の返信（教師 UID に送る） ---
  const handleReply = async (id) => {
    const reply = replyText[id];
    if (!reply) return;

    const original = [...messages, ...receivedMessages].find((m) => m.id === id);
    if (!original) return;

    const teacherUid = original.senderType === "teacher"
      ? original.senderId
      : original.recipientId;

    await addDoc(collection(db, "messages"), {
      senderId: studentInfo.uid,
      senderName: studentInfo.name,
      grade: studentInfo.grade,
      content: reply,
      recipientId: teacherUid,
      replies: [],
      createdAt: serverTimestamp(),
      senderType: "student",
    });

    setReplyText((prev) => ({ ...prev, [id]: "" }));
  };

  // --- 「ありがとうございます」 ---
  const handleReact = async (id) => {
    if (reacted[id]) return;

    const original = [...messages, ...receivedMessages].find((m) => m.id === id);
    if (!original) return;

    const teacherUid = original.senderType === "teacher"
      ? original.senderId
      : original.recipientId;

    await addDoc(collection(db, "messages"), {
      senderId: studentInfo.uid,
      senderName: studentInfo.name,
      grade: studentInfo.grade,
      content: "ありがとうございます",
      recipientId: teacherUid,
      replies: [],
      createdAt: serverTimestamp(),
      senderType: "student",
    });

    setReacted((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div style={{ padding: 10 }}>
      {/* タブ */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setTab("send")}
          style={{
            marginRight: 8,
            background: tab === "send" ? "#007bff" : undefined,
            color: tab === "send" ? "#fff" : undefined,
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        >
          送信
        </button>
        <button
          onClick={() => setTab("history")}
          style={{
            marginRight: 8,
            background: tab === "history" ? "#007bff" : undefined,
            color: tab === "history" ? "#fff" : undefined,
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        >
          送信済み
        </button>
        <button
          onClick={() => setTab("received")}
          style={{
            background: tab === "received" ? "#007bff" : undefined,
            color: tab === "received" ? "#fff" : undefined,
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        >
          受信
        </button>
      </div>

      {/* 送信 */}
      {tab === "send" && (
        <div>
          <h2>教師にメッセージ</h2>
          <form onSubmit={handleSubmit} style={{ marginBottom: 15 }}>
            <select
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              style={{ marginRight: 5, height: 28 }}
            >
              <option value="">送りたい先生を選択</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.uid || t.id}>
                  {t.lastName} {t.firstName}（{t.email}）
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="名前"
              value={studentInfo.name}
              onChange={(e) =>
                setStudentInfo((prev) => ({ ...prev, name: e.target.value }))
              }
              style={{ marginRight: 5, width: 100 }}
            />

            <input
              type="text"
              placeholder="学年"
              value={studentInfo.grade}
              onChange={(e) =>
                setStudentInfo((prev) => ({ ...prev, grade: e.target.value }))
              }
              style={{ marginRight: 5, width: 60 }}
            />

            <input
              placeholder="内容"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: 200, marginRight: 5 }}
            />

            <button type="submit" disabled={!studentInfo.uid}>
              送信
            </button>

            {sendStatus && <span style={{ marginLeft: 5 }}>{sendStatus}</span>}
          </form>
        </div>
      )}

      {/* 送信済み */}
      {tab === "history" && (
        <div>
          <h3>送信済みメッセージ</h3>
          {messages.length === 0 && <p>まだ送信がありません。</p>}
          {messages.map((msg) => (
            <div key={msg.id} style={{ border: "1px solid gray", padding: 6, marginBottom: 6 }}>
              <p>
                <strong>{msg.senderName}</strong> (学年: {msg.grade})
              </p>
              <p>内容: {msg.content}</p>

              <div style={{ marginTop: 5 }}>
                <input
                  placeholder="返信を入力"
                  value={replyText[msg.id] || ""}
                  onChange={(e) =>
                    setReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))
                  }
                  style={{ width: 150 }}
                />
                <button onClick={() => handleReply(msg.id)} style={{ marginLeft: 5 }}>
                  返信
                </button>
                <button
                  onClick={() => handleReact(msg.id)}
                  disabled={reacted[msg.id]}
                  style={{ marginLeft: 5 }}
                >
                  ありがとうございます
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 受信 */}
      {tab === "received" && (
        <div>
          <h3>受信メッセージ</h3>
          {receivedMessages.length === 0 && <p>まだメッセージは届いていません。</p>}
          {receivedMessages.map((msg) => (
            <div key={msg.id} style={{ border: "1px solid gray", padding: 6, marginBottom: 6 }}>
              <p>
                <strong>{msg.senderName}</strong> (学年: {msg.grade})
              </p>
              <p>内容: {msg.content}</p>

              <div style={{ marginTop: 5 }}>
                <input
                  placeholder="返信を入力"
                  value={replyText[msg.id] || ""}
                  onChange={(e) =>
                    setReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))
                  }
                  style={{ width: 150 }}
                />
                <button onClick={() => handleReply(msg.id)} style={{ marginLeft: 5 }}>
                  返信
                </button>
                <button
                  onClick={() => handleReact(msg.id)}
                  disabled={reacted[msg.id]}
                  style={{ marginLeft: 5 }}
                >
                  ありがとうございます
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMessageForm;
