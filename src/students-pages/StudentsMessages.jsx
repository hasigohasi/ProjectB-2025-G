// src/StudentMessageForm.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
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
  getDoc,
  setDoc,
} from "firebase/firestore";
import "../styles/StudentsMessageForm.css";

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
  const [gradeOptions] = useState(["1年", "2年", "3年"]);
  const [isFirstGradeSelection, setIsFirstGradeSelection] = useState(false);

  // --- 生徒情報（ユーザー認証と Firestore から取得） ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Firestore から学生データを取得
          const studentRef = doc(db, "students", user.uid);
          const studentSnap = await getDoc(studentRef);

          if (studentSnap.exists()) {
            const data = studentSnap.data();
            const fullName = data.lastName && data.firstName 
              ? `${data.lastName} ${data.firstName}` 
              : user.displayName || "";
            
            console.log("📚 Firestore から取得した学生データ:", data);
            console.log("📚 構成された名前:", fullName);
            
            setStudentInfo({
              uid: user.uid,
              name: fullName,
              grade: data.grade || "",
            });
            // 既に学年が保存されている場合
            if (data.grade) {
              setIsFirstGradeSelection(true);
            }
          } else {
            // ドキュメントが存在しない場合
            setStudentInfo({
              uid: user.uid,
              name: user.displayName || "",
              grade: "",
            });
          }
        } catch (error) {
          console.log("学生データ取得エラー:", error);
          setStudentInfo((prev) => ({
            ...prev,
            uid: user.uid,
            name: user.displayName || prev.name,
          }));
        }
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
      where("senderId", "==", studentInfo.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const messagesList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // 新着順（降順）にソート
      messagesList.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setMessages(messagesList);
    });
    return () => unsub();
  }, [studentInfo.uid]);

  // --- 受信メッセージ（教師から）---
  useEffect(() => {
    if (!studentInfo.uid) return;

    const getMyId = async () => {
      const studentsSnap = await getDocs(
        query(collection(db, "students"), where("uid", "==", studentInfo.uid))
      );
      const myDocId = studentsSnap.docs[0]?.id;

      console.log("🔍 受信確認 - 自分のUID:", studentInfo.uid);
      console.log("🔍 受信確認 - 自分のDocID:", myDocId);

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
        // 新着順（降順）にソート
        filtered.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
        console.log("✅ 自分宛のメッセージ:", filtered);
        setReceivedMessages(filtered);
      });
      return unsub;
    };

    getMyId();
  }, [studentInfo.uid]);

  // --- 学年が選択されたときの処理 ---
  const handleGradeChange = async (e) => {
    const selectedGrade = e.target.value;
    setStudentInfo((prev) => ({ ...prev, grade: selectedGrade }));

    // 初回選択時に Firestore に保存
    if (!isFirstGradeSelection && selectedGrade && studentInfo.uid) {
      try {
        const studentRef = doc(db, "students", studentInfo.uid);
        await setDoc(
          studentRef,
          {
            grade: selectedGrade,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        console.log("✅ 学年を保存しました:", selectedGrade);
        console.log("📝 保存先:", studentInfo.uid);
        setIsFirstGradeSelection(true);
      } catch (error) {
        console.error("学年保存エラー:", error);
      }
    }
  };

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
    console.log("📤 選択した教師:", teachers.find((t) => t.uid === recipientId));

    try {
      await addDoc(collection(db, "messages"), messageData);
      setContent("");
      setSendStatus("送信完了");
      setTimeout(() => setSendStatus(""), 2000);
    } catch (err) {
      console.error(err);
      setSendStatus("送信失敗");
    }
  };

  // --- 生徒側の返信（教師 UID に送る、送信済みタブでのみ使用） ---
  const handleReply = async (id) => {
    const reply = replyText[id];
    if (!reply) return;

    const original = messages.find((m) => m.id === id);
    if (!original) return;

    const docRef = doc(db, "messages", id);
    await updateDoc(docRef, {
      replies: [
        ...(original.replies || []),
        { 
          text: reply, 
          sender: "student",
          senderName: studentInfo.name,
          timestamp: new Date() 
        },
      ],
    });

    setReplyText((prev) => ({ ...prev, [id]: "" }));
  };

  // --- 生徒側の受信メッセージへの返信 ---
  const handleReceivedReply = async (id) => {
    const reply = replyText[id];
    if (!reply) return;

    const original = receivedMessages.find((m) => m.id === id);
    if (!original) return;

    const docRef = doc(db, "messages", id);
    await updateDoc(docRef, {
      replies: [
        ...(original.replies || []),
        { 
          text: reply, 
          sender: "student",
          senderName: studentInfo.name,
          timestamp: new Date() 
        },
      ],
    });

    setReplyText((prev) => ({ ...prev, [id]: "" }));
  };

  // --- 「ありがとうございます」（送信済みタブでのみ使用） ---
  const handleReact = async (id) => {
    if (reacted[id]) return;

    const original = messages.find((m) => m.id === id);
    if (!original) return;

    const docRef = doc(db, "messages", id);
    await updateDoc(docRef, {
      replies: [
        ...(original.replies || []),
        { 
          text: "ありがとうございます", 
          sender: "student",
          senderName: studentInfo.name,
          timestamp: new Date() 
        },
      ],
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

            <select
              value={studentInfo.grade}
              onChange={handleGradeChange}
              style={{ marginRight: 5, height: 28 }}
            >
              <option value="">学年を選択</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>

            <input
              placeholder="内容"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: 200, marginRight: 5 }}
            />

            <button type="submit" disabled={!studentInfo.uid || !studentInfo.grade}>
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
              <p style={{ margin: "4px 0", padding: "6px", backgroundColor: "#fff", borderLeft: "3px solid #007bff" }}>
                内容: {msg.content}
              </p>

              {msg.replies?.map((r, idx) => (
                <div key={idx} style={{ margin: "6px 0", padding: "6px", backgroundColor: "#fff", borderLeft: "3px solid #999" }}>
                  <p style={{ margin: "2px 0" }}>
                    <strong>{r.senderName || (r.sender === "teacher" ? "教師" : "生徒")}:</strong>
                  </p>
                  <p style={{ margin: "2px 0" }}>{r.text}</p>
                </div>
              ))}

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
                <strong>{msg.senderName}</strong>
              </p>
              <p style={{ margin: "4px 0", padding: "6px", backgroundColor: "#fff", borderLeft: "3px solid #007bff" }}>
                内容: {msg.content}
              </p>

              {msg.replies?.map((r, idx) => (
                <div key={idx} style={{ margin: "6px 0", padding: "6px", backgroundColor: "#fff", borderLeft: "3px solid #999" }}>
                  <p style={{ margin: "2px 0" }}>
                    <strong>{r.senderName || (r.sender === "teacher" ? "教師" : "生徒")}:</strong>
                  </p>
                  <p style={{ margin: "2px 0" }}>{r.text}</p>
                </div>
              ))}

              <div style={{ marginTop: 5 }}>
                <input
                  placeholder="返信を入力"
                  value={replyText[msg.id] || ""}
                  onChange={(e) =>
                    setReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))
                  }
                  style={{ width: 150 }}
                />
                <button onClick={() => handleReceivedReply(msg.id)} style={{ marginLeft: 5 }}>
                  返信
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
