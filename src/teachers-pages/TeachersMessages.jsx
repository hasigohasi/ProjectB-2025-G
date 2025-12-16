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
  getDoc,
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

  // 教師情報（Firestore から取得）
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Firestore から教師データを取得
          const teacherRef = doc(db, "teachers", user.uid);
          const teacherSnap = await getDoc(teacherRef);

          if (teacherSnap.exists()) {
            const data = teacherSnap.data();
            setTeacher({
              uid: user.uid,
              email: user.email,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
            });
            console.log(" Firestore から取得した教師データ:", data);
          } else {
            // ドキュメントが存在しない場合は displayName から分割
            const [lastName, firstName] = (user.displayName || "先生").split(" ");
            setTeacher({
              uid: user.uid,
              email: user.email,
              firstName: firstName || "",
              lastName: lastName || "",
            });
          }
          console.log(" ログイン中の教師UID:", user.uid);
        } catch (error) {
          console.log("教師データ取得エラー:", error);
          const [lastName, firstName] = (user.displayName || "先生").split(" ");
          setTeacher({
            uid: user.uid,
            email: user.email,
            firstName: firstName || "",
            lastName: lastName || "",
          });
        }
      }
    });
    return unsub;
  }, []);

  //  生徒一覧を取得
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "students"), (snap) => {
      const studentList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log(" 取得した生徒データ:", studentList);
      setStudents(studentList);
    });
    return unsub;
  }, []);

  //  教師 → 生徒の送信済みメッセージ
  useEffect(() => {
    if (!teacher.uid) return;
    const q = query(collection(db, "messages"), where("senderId", "==", teacher.uid));
    const unsub = onSnapshot(q, (snap) => {
      const sentList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // 新着順（降順）にソート
      sentList.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      console.log(" 送信済みメッセージ:", sentList);
      setSent(sentList);
    });
    return unsub;
  }, [teacher.uid]);

  //  生徒 → 教師の受信メッセージ（デバッグ強化版）
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;

      console.log(" 教師のUID:", user.uid);

      // まず全メッセージを取得してみる
      const allMessagesQuery = query(collection(db, "messages"));

      const unsubAll = onSnapshot(allMessagesQuery, (snap) => {
        const allMessages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.log(" 全メッセージ:", allMessages);

        // 自分宛のメッセージをフィルタリング
        const forMe = allMessages.filter(
          (msg) => msg.recipientId === user.uid && msg.senderType === "student"
        );
        // 新着順（降順）にソート
        forMe.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
        console.log(" 自分宛の生徒からのメッセージ:", forMe);

        setReceived(forMe);
      });

      return unsubAll;
    });

    return unsubAuth;
  }, []);

  //  教師 → 生徒 送信
  const handleSend = async () => {
    if (!sendTarget || !sendContent) {
      alert("送信先と内容を入力してください");
      return;
    }

    console.log(" 教師が送信するデータ:");
    console.log("  senderId (教師UID):", teacher.uid);
    console.log("  recipientId (生徒UID/ID):", sendTarget);
    console.log("  content:", sendContent);

    try {
      await addDoc(collection(db, "messages"), {
        senderId: teacher.uid,
        senderName: `${teacher.lastName} ${teacher.firstName}`,
        senderEmail: teacher.email,
        recipientId: sendTarget,
        content: sendContent,
        senderType: "teacher",
        replies: [],
        createdAt: serverTimestamp(),
      });
      setSendContent("");
      setSendTarget("");
      console.log(" 送信成功");
    } catch (err) {
      console.error(" 送信エラー:", err);
    }
  };

  //  返信（送信済みタブでのみ使用）
  const handleReply = async (msg) => {
    const reply = replyText[msg.id];
    if (!reply) return;

    const docRef = doc(db, "messages", msg.id);
    await updateDoc(docRef, {
      replies: [
        ...(msg.replies || []),
        { 
          text: reply, 
          sender: "teacher",
          senderName: `${teacher.lastName} ${teacher.firstName}`,
          timestamp: new Date() 
        },
      ],
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

        {/* 送信 */}
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
                  <option key={s.id} value={s.uid || s.id}>
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

        {/* 送信済み */}
        {tab === "history" && (
          <div>
            <h3>送信済みメッセージ</h3>
            {sent.length === 0 && <p>まだ送信がありません。</p>}

            {sent.map((msg) => (
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
                  <strong>{teacher.lastName} {teacher.firstName}</strong>
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
                    style={{ width: 150, height: 20 }}
                  />
                  <button onClick={() => handleReply(msg)} style={{ marginLeft: 5, height: 24 }}>
                    返信
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
            {received.length === 0 && <p>受信メッセージはありません。</p>}

            {received.map((msg) => (
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
                  <strong>{msg.senderName}</strong>（学年: {msg.grade || "-"}）
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
                    style={{ width: 150, height: 20 }}
                  />
                  <button onClick={() => handleReply(msg)} style={{ marginLeft: 5, height: 24 }}>
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
