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
  const [grade, setGrade] = useState("");       // ★ DB保存される学年
  const [gradeSelect, setGradeSelect] = useState(""); // ★ プルダウン選択値
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
        setClub(data.club || "");

        if (data.grade) {
          setGrade(data.grade);
          setGradeSelect(data.grade); 
        }
      }
    };

    fetchStudentData();
  }, [user]);

  // ▼ "その他" を選んだら gradeText に入力
  const handleGradeChange = (value) => {
    setGradeSelect(value);
    if (value !== "その他") {
      setGrade(value);
    } else {
      setGrade(""); // その他なら別テキスト欄で入力
    }
  };

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

    if (!grade) {
      alert("学年を入力してください");
      return;
    }

    // --- ❶ 初回のみ 学年 と 部活 を DB に保存 ---
    const studentRef = doc(db, "students", user.uid);
    const snap = await getDoc(studentRef);

    if (snap.exists()) {
      const data = snap.data();
      const updateData = {};

      if (!data.club) updateData.club = club;
      if (!data.grade) updateData.grade = grade; // ★ 学年保存

      if (Object.keys(updateData).length > 0) {
        await setDoc(studentRef, updateData, { merge: true });
        alert("生徒情報（部活・学年）を保存しました！");
      }
    }

    // --- ❷ 練習記録の保存 ---
    await addDoc(collection(db, "practices"), {
      name: `${lastName} ${firstName}`,
      club: club,
      grade:grade,
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

        {/* ▼ 学年（プルダウン → その他なら入力欄） */}
        <label>学年</label><br />
        <select
          value={gradeSelect}
          onChange={(e) => handleGradeChange(e.target.value)}
          required
        >
          <option value="">選択してください</option>
          <option value="1年">1年</option>
          <option value="2年">2年</option>
          <option value="3年">3年</option>
        </select>
        <br /><br />

        {gradeSelect === "その他" && (
          <>
            <input
              type="text"
              placeholder="学年を入力（例：4年 / B組 など）"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            /><br /><br />
          </>
        )}

        {/* ▼ 部活動 */}
        <label>所属部活動</label><br />
        <input
          type="text"
          value={club}
          onChange={(e) => setClub(e.target.value)}
          placeholder="例：サッカー部"
          required
        /><br /><br />

        {/* ▼ 練習内容 */}
        <label>練習内容</label><br />
        <textarea
          value={practiceText}
          onChange={(e) => setPracticeText(e.target.value)}
          placeholder="今日の練習内容を入力"
          required
        /><br /><br />

        {/* ▼ 振り返り */}
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
