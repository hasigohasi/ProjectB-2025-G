// src/students-pages/Practice.jsx

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

function Practice() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [club, setClub] = useState("");
  const [practiceText, setPracticeText] = useState("");
  const [reviewText, setReviewText] = useState("");

  // ▼ Firestore から生徒情報を読み込む
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;

      const ref = doc(db, "students", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setClub(data.club || ""); // ← ここが空なら最初の入力後に保存される
      }
    };

    fetchStudentData();
  }, [user]);

  // ▼ 練習内容を保存
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!practiceText) {
      alert("練習内容を入力してください");
      return;
    }

    if (!club) {
      alert("部活動を入力してください");
      return;
    }

    // --- ❶ 初回の部活動入力があれば students に保存 ---
    const studentRef = doc(db, "students", user.uid);
    const snap = await getDoc(studentRef);

    if (snap.exists() && !snap.data().club) {
      await setDoc(
        studentRef,
        {
          club: club,
        },
        { merge: true }
      );
      alert("部活動情報を保存しました！");
    }

    // --- ❷ 練習記録の保存 ---
    await addDoc(collection(db, "practices"), {
    name: `${lastName} ${firstName}`, 
    club: club,
    content: practiceText,           
    reflection: reviewText,           
    createdAt: Timestamp.now(),
    });

    alert("練習記録を保存しました！");
    setPracticeText("");
    setReviewText("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>練習記録（生徒用）</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <p>氏名：{lastName} {firstName}</p>

        <label>所属部活動</label><br />
        <input
          type="text"
          value={club}
          onChange={(e) => setClub(e.target.value)}
          placeholder="例：サッカー部"
          required
        /><br /><br />

        <label>練習内容</label><br />
        <textarea
          value={practiceText}
          onChange={(e) => setPracticeText(e.target.value)}
          placeholder="今日の練習内容を入力"
          required
        /><br /><br />

        <label>振り返り</label><br />
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="振り返りを入力（任意）"
        /><br /><br />

        <button type="submit">保存する</button>
      </form>
    </div>
  );
}

export default Practice;
