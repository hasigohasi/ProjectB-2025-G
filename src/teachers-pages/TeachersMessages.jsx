// src/TeacherMessageForm.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import "../styles/TeachersMessageForm.css";

const TeacherMessageForm = () => {
  const [tab, setTab] = useState("send");
  const [teacher, setTeacher] = useState({ uid: null, email: "", firstName: "", lastName: "" });
  const [students, setStudents] = useState([]);
  const [sendTarget, setSendTarget] = useState("");
  const [sendContent, setSendContent] = useState("");
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [replyText, setReplyText] = useState({});

  // 教師情報取得
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        const [lastName, firstName] = (user.displayName || "先生").split(" ");
        setTeacher({
          uid: user.uid,
          email: user.email,
          firstName: firstName || "",
          lastName: lastName || "",
        });
      }
    });
    return unsub;
  }, []);

  // 生徒一覧取得
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "students"), (snap) => {
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // 送信メッセージ取得
  useEffect(() => {
    if (!teacher.uid) return;
    const q = query(collection(db, "messages"), where("senderId", "==", teacher.uid));
    const unsub = onSnapshot(q, (snap) => {
      setSent(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [teacher.uid]);

  // 受信メッセージ取得
  useEffect(() => {
    if (!teacher.uid) return;
    const q = query(collection(db, "messages"), where("recipientId", "==", teacher.uid));
    const unsub = onSnapshot(q, (snap) => {
      setReceived(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [teacher.uid]);

  // メッセージ送信
  const handleSend = async () => {
    if (!sendTarget || !sendContent) {
      alert("送信先と内容を入力してください");
      return;
    }
    try {
      await addDoc(collection(db, "messages"), {
        senderId: teacher.uid,
        senderName: `${teacher.lastName} ${teacher.firstName}`,
        senderEmail: teacher.email,
        recipientId: sendTarget,
        content: sendContent,
        replies: [],
        createdAt: serverTimestamp(),
      });
      setSendContent("");
      setSendTarget("");
    } catch (err) {
      console.error("送信エラー:", err);
    }
  };

  // 返信（senderTypeで教師/生徒を判別）
  const handleReply = async (msg, senderType) => {
    const reply = replyText[msg.id];
    if (!reply) return;

    const docRef = doc(db, "messages", msg.id);
    await updateDoc(docRef, {
      replies: [...(msg.replies || []), { text: reply, senderType, timestamp: new Date() }],
    });
    setReplyText((prev) => ({ ...prev, [msg.id]: "" }));
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1, padding: 20 }}>
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

        {/* 送信タブ */}
        {tab === "send" && (
          <div>
            <h3>生徒へメッセージ送信</h3>
            <div style={{ marginBottom: 10 }}>
              <select
                value={sendTarget}
                onChange={(e) => setSendTarget(e.target.value)}
                style={{ marginRight: 5, height: 28 }}
              >
                <option value="">生徒を選択</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.lastName} {s.firstName}（{s.email}）
                  </option>
                ))}
              </select>
              <input
                placeholder="内容"
                value={sendContent}
                onChange={(e) => setSendContent(e.target.value)}
                style={{ width: 200, height: 24, marginRight: 5 }}
              />
              <button onClick={handleSend} style={{ height: 28 }}>
                送信
              </button>
            </div>
          </div>
        )}

        {/* 送信済みタブ */}
        {tab === "history" && (
          <div>
            <h3>送信済みメッセージ</h3>
            {sent.length === 0 && <p>まだ送信がありません。</p>}

            {sent.map((msg) => (
              <div key={msg.id} className="message-card bubble-container">

                {/* 教師の送信メッセージ → 右 */}
                <div className="bubble bubble-right-teacher">
                  <strong>先生</strong><br />
                  {msg.content}
                </div>

                {/* 返信一覧 */}
                {msg.replies?.map((r, idx) => (
                  <div
                    key={idx}
                    className={
                      r.senderType === "teacher"
                        ? "bubble bubble-right-teacher"   // 教師 → 右に青
                        : "bubble bubble-left-student"    // 生徒 → 左にグレー
                    }
                  >
                    <strong>{r.senderType === "teacher" ? "教師" : "生徒"}:</strong> {r.text}
                  </div>
                ))}

                {/* 返信フォーム */}
                <div className="reply-box">
                  <input
                    placeholder="返信を入力"
                    className="reply-input"
                    value={replyText[msg.id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))
                    }
                    style={{ width: 150, height: 20 }}
                  />
                  <button
                    className="reply-btn"
                    onClick={() => handleReply(msg, "teacher")}
                  >
                    返信
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 受信タブ */}
        {tab === "received" && (
          <div>
            <h3>受信メッセージ</h3>
            {received.length === 0 && <p>受信メッセージはありません。</p>}
            {received.map((msg) => (
              <div key={msg.id} className="message-card bubble-container">

                {/* 生徒のメッセージ → 左 */}
                <div className="bubble bubble-left-student">
                  <strong>{msg.senderName}</strong><br />
                  {msg.content}
                </div>

                {/* 返信一覧 */}
                {msg.replies?.map((r, idx) => (
                  <div
                    key={idx}
                    className={
                      r.senderType === "teacher"
                        ? "bubble bubble-right-teacher"   // 教師 → 右に青
                        : "bubble bubble-left-student"    // 生徒 → 左にグレー
                    }
                  >
                    <strong>{r.senderType === "teacher" ? "教師" : "生徒"}:</strong>
                    {r.text}
                  </div>
                ))}
                {/* 返信フォーム */}
                <div className="reply-box">
                  <input
                    placeholder="返信を入力"
                    className="reply-input"
                    value={replyText[msg.id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))
                    }
                    style={{ width: 150, height: 20 }}
                  />
                  <button
                    className="reply-btn"
                    onClick={() => handleReply(msg, "teacher")}
                  >
                    返信
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMessageForm;
