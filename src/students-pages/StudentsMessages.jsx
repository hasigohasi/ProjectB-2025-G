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

  // 受信メッセージ用
  const [receivedMessages, setReceivedMessages] = useState([]);

  // 🔹 ログイン中の生徒情報を取得
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

  // 🔹 教師一覧を取得
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const ref = collection(db, "teachers");
        const snap = await getDocs(ref);
        if (snap.empty) {
          setTeachers([]);
          return;
        }
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTeachers(list);
      } catch (error) {
        console.log("教師データ取得エラー:", error);
        setTeachers([]);
      }
    };
    loadTeachers();
  }, []);

  // 🔹 自分の送信メッセージを取得
  useEffect(() => {
    if (!studentInfo.uid) return;
    const q = query(
      collection(db, "messages"),
      where("senderId", "==", studentInfo.uid)
    );
    const unsub = onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    return () => unsub();
  }, [studentInfo.uid]);

  // 🔹 受信メッセージを取得
  useEffect(() => {
    if (!studentInfo.uid) return;
    const q = query(
      collection(db, "messages"),
      where("recipientId", "==", studentInfo.uid)
    );
    const unsub = onSnapshot(q, (snap) =>
      setReceivedMessages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    return () => unsub();
  }, [studentInfo.uid]);

  // 🔹 メッセージ送信
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !recipientId) {
      alert("送りたい先生を選択してください");
      return;
    }
    try {
      await addDoc(collection(db, "messages"), {
        senderId: studentInfo.uid,
        senderName: studentInfo.name,
        grade: studentInfo.grade,
        content,
        recipientId,
        replies: [],
        createdAt: serverTimestamp(),
      });
      setContent("");
      setSendStatus("送信完了");
    } catch (err) {
      console.error(err);
      setSendStatus("送信失敗");
    }
  };

  // 🔹 返信（senderType を統一）
  const handleReply = async (id) => {
    const reply = replyText[id];
    if (!reply) return;

    const docRef = doc(db, "messages", id);
    const msg = [...messages, ...receivedMessages].find((m) => m.id === id);

    await updateDoc(docRef, {
      replies: [...(msg.replies || []), { text: reply, senderType: "student", timestamp: new Date() }],
    });

    setReplyText((prev) => ({ ...prev, [id]: "" }));
  };

  // 🔹 「ありがとうございます」リアクション
  const handleReact = async (id) => {
    if (reacted[id]) return;
    const docRef = doc(db, "messages", id);
    const msg = [...messages, ...receivedMessages].find((m) => m.id === id);

    await updateDoc(docRef, {
      replies: [...(msg.replies || []), { text: "ありがとうございます", senderType: "student", timestamp: new Date() }],
    });

    setReacted((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div style={{ padding: 10 }}>
      {/* タブメニュー */}
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
            cursor: "pointer",
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
            cursor: "pointer",
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
            cursor: "pointer",
          }}
        >
          受信
        </button>
      </div>

      {/* ------------------ 送信タブ ------------------ */}
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
              {teachers.length === 0 ? (
                <option disabled>（教師データがありません）</option>
              ) : (
                teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.lastName} {t.firstName}（{t.email}）
                  </option>
                ))
              )}
            </select>
            <input
              type="text"
              placeholder="名前"
              value={studentInfo.name}
              onChange={(e) => setStudentInfo((prev) => ({ ...prev, name: e.target.value }))}
              style={{ marginRight: 5, width: 100, height: 24 }}
            />
            <input
              type="text"
              placeholder="学年"
              value={studentInfo.grade}
              onChange={(e) => setStudentInfo((prev) => ({ ...prev, grade: e.target.value }))}
              style={{ marginRight: 5, width: 60, height: 24 }}
            />
            <input
              placeholder="内容"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: 200, height: 24, marginRight: 5 }}
            />
            <button type="submit" style={{ height: 28 }} disabled={!studentInfo.uid}>
              送信
            </button>
            {sendStatus && <span style={{ marginLeft: 5 }}>{sendStatus}</span>}
          </form>
        </div>
      )}

      {/* ------------------ 送信済みタブ ------------------ */}
      {tab === "history" && (
        <div>
          <h3>送信済みメッセージ</h3>
          {messages.length === 0 && <p>まだ送信がありません。</p>}
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                border: "1px solid gray",
                padding: 6,
                marginBottom: 6,
                fontSize: 12,
                backgroundColor: "#f9f9f9",
              }}
            >
              <p>
                <strong>{msg.senderName}</strong> (学年: {msg.grade})
              </p>
              <p>内容: {msg.content}</p>
              <div style={{ marginTop: 5 }}>
                {msg.replies?.map((r, idx) => (
                  <p key={idx} style={{ margin: 2 }}>
                    <strong>{r.senderType === "teacher" ? "教師" : "生徒"}:</strong> {r.text}
                  </p>
                ))}
              </div>
              <div style={{ marginTop: 5 }}>
                <input
                  placeholder="返信を入力"
                  value={replyText[msg.id] || ""}
                  onChange={(e) => setReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                  style={{ width: 150, height: 20 }}
                />
                <button onClick={() => handleReply(msg.id)} style={{ marginLeft: 5, height: 24 }}>
                  返信
                </button>
                <button
                  onClick={() => handleReact(msg.id)}
                  disabled={reacted[msg.id]}
                  style={{ marginLeft: 5, height: 24 }}
                >
                  ありがとうございます
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------ 受信タブ ------------------ */}
      {tab === "received" && (
        <div>
          <h3>受信メッセージ</h3>
          {receivedMessages.length === 0 && <p>まだメッセージは届いていません。</p>}
          {receivedMessages.map((msg) => (
            <div
              key={msg.id}
              style={{
                border: "1px solid gray",
                padding: 6,
                marginBottom: 6,
                fontSize: 12,
                backgroundColor: "#f9f9f9",
              }}
            >
              <p>
                <strong>{msg.senderName}</strong> (学年: {msg.grade})
              </p>
              <p>内容: {msg.content}</p>
              <div style={{ marginTop: 5 }}>
                {msg.replies?.map((r, idx) => (
                  <p key={idx} style={{ margin: 2 }}>
                    <strong>{r.senderType === "teacher" ? "教師" : "生徒"}:</strong> {r.text}
                  </p>
                ))}
              </div>
              <div style={{ marginTop: 5 }}>
                <input
                  placeholder="返信を入力"
                  value={replyText[msg.id] || ""}
                  onChange={(e) => setReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                  style={{ width: 150, height: 20 }}
                />
                <button onClick={() => handleReply(msg.id)} style={{ marginLeft: 5, height: 24 }}>
                  返信
                </button>
                <button
                  onClick={() => handleReact(msg.id)}
                  disabled={reacted[msg.id]}
                  style={{ marginLeft: 5, height: 24 }}
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
