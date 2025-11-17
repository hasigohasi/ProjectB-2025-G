// src/Contacts.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import Sidebar from "../components/Layout";

const Contacts = () => {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});

  const userId = auth.currentUser?.uid; // ★ この先生の UID

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "messages"), (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(msg => msg.recipientId === userId); 
        // ★ 追加：この先生宛のメッセージだけ表示

      setMessages(msgs);
    });

    return unsubscribe;
  }, [userId]);

  const handleReply = async (id) => {
    const reply = replyText[id];
    if (!reply) return;

    const docRef = doc(db, "messages", id);
    const msg = messages.find(m => m.id === id);

    await updateDoc(docRef, {
      replies: [
        ...(msg.replies || []),
        { text: reply, sender: "teacher", timestamp: new Date() }
      ]
    });

    setReplyText(prev => ({ ...prev, [id]: "" }));
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, padding: 10 }}>
        <h2>連絡一覧</h2>

        {messages.length === 0 ? (
          <p>何もありません。</p>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              style={{
                border: "1px solid gray",
                padding: 8,
                marginBottom: 8,
                fontSize: 12,
                backgroundColor: "#f5f5f5"
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
                  style={{ width: 200, height: 20 }}
                />
                <button
                  onClick={() => handleReply(msg.id)}
                  style={{ marginLeft: 5, height: 24 }}
                >
                  返信
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Contacts;
