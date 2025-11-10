// src/StudentMessageForm.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { collection, addDoc, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";

const StudentMessageForm = () => {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [content, setContent] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [reacted, setReacted] = useState({}); // リアクション押したか管理

  const userId = auth.currentUser?.uid;

  // メッセージ取得
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "messages"), (snapshot) => {
      const allMsgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(msg => msg.senderId === userId || msg.recipientType === "student");

      // 同じ名前・学年・内容は1つだけにする
      const uniqueMsgs = [];
      const seen = new Set();
      allMsgs.forEach(m => {
        const key = `${m.senderName}_${m.grade}_${m.content}`;
        if (!seen.has(key)) {
          uniqueMsgs.push(m);
          seen.add(key);
        }
      });

      setMessages(uniqueMsgs);
    });

    return unsubscribe;
  }, [userId]);

  // 送信
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !grade || !content) return;

    try {
      await addDoc(collection(db, "messages"), {
        senderId: userId,
        senderName: name,
        grade,
        content,
        recipientType: "teacher",
        replies: [], // 返信履歴
        createdAt: serverTimestamp(), // 単独フィールドなのでOK
      });

      setContent("");
      setSendStatus("送信完了");
    } catch (err) {
      console.error(err);
      setSendStatus("送信失敗");
    }
  };

  // 返信（教師からの返信を生徒が再度返信可能）
  const handleReply = async (id) => {
    const reply = replyText[id];
    if (!reply) return;

    const docRef = doc(db, "messages", id);
    const msg = messages.find(m => m.id === id);

    await updateDoc(docRef, {
      replies: [...(msg.replies || []), { text: reply, sender: "student", timestamp: new Date() }] // serverTimestamp() → new Date()
    });

    setReplyText(prev => ({ ...prev, [id]: "" }));
  };

  // ありがとうリアクション
  const handleReact = async (id) => {
    if (reacted[id]) return;

    const docRef = doc(db, "messages", id);
    const msg = messages.find(m => m.id === id);

    await updateDoc(docRef, {
      replies: [...(msg.replies || []), { text: "ありがとうございます", sender: "student", timestamp: new Date() }] // serverTimestamp() → new Date()
    });

    setReacted(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div style={{ padding: 10 }}>
      <h2>教師にメッセージ</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 15 }}>
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
      {messages.map(msg => (
        <div
          key={msg.id}
          style={{
            border: "1px solid gray",
            padding: 6,
            marginBottom: 6,
            fontSize: 12,
            backgroundColor: "#f9f9f9"
          }}
        >
          <p><strong>{msg.senderName}</strong> (学年: {msg.grade})</p>
          <p>内容: {msg.content}</p>

          <div style={{ marginTop: 5 }}>
            {msg.replies?.map((r, idx) => (
              <p key={idx} style={{ margin: 2 }}>
                <strong>{r.sender === "teacher" ? "教師" : "生徒"}:</strong> {r.text}
              </p>
            ))}
          </div>

          <div style={{ marginTop: 5 }}>
            <input
              placeholder="返信を入力"
              value={replyText[msg.id] || ""}
              onChange={(e) => setReplyText(prev => ({ ...prev, [msg.id]: e.target.value }))}
              style={{ width: 150, height: 20 }}
            />
            <button onClick={() => handleReply(msg.id)} style={{ marginLeft: 5, height: 24 }}>返信</button>
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
