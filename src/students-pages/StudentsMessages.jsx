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
} from "firebase/firestore";

const StudentMessageForm = () => {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [content, setContent] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [reacted, setReacted] = useState({});

  const [teachers, setTeachers] = useState([]); // 教師一覧
  const [recipientId, setRecipientId] = useState(""); // 送り先教師UID

  const userId = auth.currentUser?.uid;

  // 🔹 教師一覧を teachers コレクションから取得
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teachers"), (snap) => {
      const teacherList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeachers(teacherList);
    });
    return unsub;
  }, []);

  // 🔹 メッセージ取得（自分が送ったメッセージのみ）
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "messages"), (snapshot) => {
      const allMsgs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg) => msg.senderId === userId);

      setMessages(allMsgs);
    });

    return unsubscribe;
  }, [userId]);

  // 🔹 メッセージ送信（教師宛）
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !grade || !content || !recipientId) {
      alert("送りたい先生を選択してください");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        senderId: userId,
        senderName: name,
        grade,
        content,
        recipientId, // ← どの先生宛か
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

  // 🔹 生徒の返信
  const handleReply = async (id) => {
    const reply = replyText[id];
    if (!reply) return;

    const docRef = doc(db, "messages", id);
    const msg = messages.find((m) => m.id === id);

    await updateDoc(docRef, {
      replies: [
        ...(msg.replies || []),
        { text: reply, sender: "student", timestamp: new Date() },
      ],
    });

    setReplyText((prev) => ({ ...prev, [id]: "" }));
  };

  // 🔹 ありがとうございますリアクション
  const handleReact = async (id) => {
    if (reacted[id]) return;

    const docRef = doc(db, "messages", id);
    const msg = messages.find((m) => m.id === id);

    await updateDoc(docRef, {
      replies: [
        ...(msg.replies || []),
        { text: "ありがとうございます", sender: "student", timestamp: new Date() },
      ],
    });

    setReacted((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div style={{ padding: 10 }}>
      <h2>教師にメッセージ</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 15 }}>

        {/* 🔽 先生選択プルダウン（教師コレクションから取得） */}
        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          style={{ marginRight: 5, height: 28 }}
        >
          <option value="">送りたい先生を選択</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.lastName} {t.firstName}（{t.email}）
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: 5, width: 100, height: 24 }}
        />

        <input
          type="text"
          placeholder="学年"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          style={{ marginRight: 5, width: 60, height: 24 }}
        />

        <input
          placeholder="内容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ width: 200, height: 24, marginRight: 5 }}
        />

        <button type="submit" style={{ height: 28 }}>送信</button>
        {sendStatus && <span style={{ marginLeft: 5 }}>{sendStatus}</span>}
      </form>

      <h3>送信済みメッセージ</h3>
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
                <strong>{r.sender === "teacher" ? "教師" : "生徒"}:</strong>{" "}
                {r.text}
              </p>
            ))}
          </div>

          <div style={{ marginTop: 5 }}>
            <input
              placeholder="返信を入力"
              value={replyText[msg.id] || ""}
              onChange={(e) =>
                setReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))
              }
              style={{ width: 150, height: 20 }}
            />
            <button
              onClick={() => handleReply(msg.id)}
              style={{ marginLeft: 5, height: 24 }}
            >
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
  );
};

export default StudentMessageForm;
