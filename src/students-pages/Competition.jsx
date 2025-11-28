// src/students-pages/StudentCompetitionResult.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  Timestamp
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const StudentCompetitionResult = () => {
  const auth = getAuth();

  const [uid, setUid] = useState(null);
  const [club, setClub] = useState("");
  const [grade, setGrade] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");

  // ▼ ログイン済みユーザー取得
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
      else setUid(null);
    });
    return () => unsub();
  }, [auth]);

  // ▼ students/{uid} を取得して氏名・部活動を自動入力
  useEffect(() => {
    if (!uid) return;

    const fetchStudentData = async () => {
      try {
        const ref = doc(db, "students", uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();

          // 氏名自動入力
          const fullName = `${data.lastName || ""} ${data.firstName || ""}`.trim();
          setName(fullName);

          // 部活動自動入力（未登録なら空）
          setClub(data.club || "");
        }
      } catch (e) {
        console.error("studentsの読み込みエラー:", e);
      }
    };

    fetchStudentData();
  }, [uid]);

  // ▼ 大会結果の保存処理
  const handleSave = async () => {
    if (!grade || !result) {
      alert("学年・結果を入力してください。");
      return;
    }

    if (!club) {
      alert("部活動を入力してください。");
      return;
    }

    try {
      setStatus("保存中…");

      // ▼ 初回部活動入力の場合のみ students に保存
      if (uid) {
        const studentRef = doc(db, "students", uid);
        const snap = await getDoc(studentRef);

        if (snap.exists() && !snap.data().club) {
          await setDoc(studentRef, { club }, { merge: true });
          console.log("部活動をstudentsに保存しました");
        }
      }

      // ▼ resultsコレクションへ保存
      await addDoc(collection(db, "results"), {
        name,
        club,
        grade,
        result,
        timestamp: Timestamp.now(),
      });

      setGrade("");
      setResult("");
      setStatus("✅ 保存しました！");
    } catch (error) {
      console.error("保存エラー:", error);
      setStatus("❌ 保存に失敗しました。");
    }
  };

  return (
    <div style={{ flex: 1, padding: "30px 40px", backgroundColor: "#f8f9fa" }}>
      <h2 style={{ fontSize: "22px", marginBottom: "15px" }}>大会結果</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "380px",
          backgroundColor: "#fff",
          padding: "18px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <label>
          氏名（自動）：
          <input
            type="text"
            value={name}
            readOnly
            style={{
              width: "95%",
              padding: "10px",
              fontSize: "15px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor: "#eee"
            }}
          />
        </label>

        <label>
          部活動名：
          <input
            type="text"
            placeholder="例：サッカー部"
            value={club}
            onChange={(e) => setClub(e.target.value)}
            style={{
              width: "95%",
              padding: "10px",
              fontSize: "15px",
              borderRadius: "5px",
              border: "1px solid #ccc"
            }}
          />
        </label>

        <label>
          学年：
          <input
            type="text"
            placeholder="例：2年"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            style={{
              width: "95%",
              padding: "10px",
              fontSize: "15px",
              borderRadius: "5px",
              border: "1px solid #ccc"
            }}
          />
        </label>

        <label>
          結果：
          <textarea
            placeholder="例：県大会 出場／準優勝 など"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            rows={3}
            style={{
              width: "95%",
              padding: "10px",
              fontSize: "15px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              resize: "none"
            }}
          />
        </label>

        <button
          onClick={handleSave}
          style={{
            padding: "10px",
            fontSize: "15px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "5px"
          }}
        >
          保存
        </button>

        {status && <p style={{ marginTop: "5px", fontWeight: "bold" }}>{status}</p>}
      </div>
    </div>
  );
};

export default StudentCompetitionResult;
