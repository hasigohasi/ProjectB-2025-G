// 練習記録入力・振り返り
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, serverTimestamp, orderBy, query } from "firebase/firestore";

function Practice() {
  const [name, setName] = useState("");
  const [club, setClub] = useState("");
  const [content, setContent] = useState("");
  const [reflection, setReflection] = useState("");
  const [records, setRecords] = useState([]);

  // データ取得
  useEffect(() => {
    const fetchPractices = async () => {
      const q = query(collection(db, "practices"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(data);
    };
    fetchPractices();
  }, []);

  // データ送信
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "practices"), {
        name,
        club,
        content,
        reflection,
        createdAt: serverTimestamp(),
      });
      alert("記録を保存しました！");
      setName("");
      setClub("");
      setContent("");
      setReflection("");
      // 再取得
      const q = query(collection(db, "practices"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(data);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div>
      <h1>練習記録（生徒用）</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>名前: </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>部活動: </label>
          <input
            type="text"
            value={club}
            onChange={(e) => setClub(e.target.value)}
            required
          />
        </div>
        <div>
          <label>練習内容: </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div>
          <label>振り返り: </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            required
          />
        </div>
        <button type="submit">保存</button>
      </form>

      <h2>過去の記録</h2>
      {records.length === 0 ? (
        <p>まだ記録がありません。</p>
      ) : (
        <ul>
          {records.map((r) => (
            <li key={r.id}>
              <strong>{r.name}（{r.club}）</strong><br />
              <span>内容: {r.content}</span><br />
              <span>振り返り: {r.reflection}</span><br />
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Practice;
