import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

function TeachersPractice() {
  const [records, setRecords] = useState({});
  const [openStudents, setOpenStudents] = useState({}); // 展開状態を管理

  useEffect(() => {
    const fetchPractices = async () => {
      const q = query(collection(db, "practices"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 生徒名ごとにまとめる
      const grouped = {};
      data.forEach((r) => {
        if (!grouped[r.name]) {
          grouped[r.name] = [];
        }
        grouped[r.name].push(r);
      });

      setRecords(grouped);
    };
    fetchPractices();
  }, []);

  // 日付を YYYY/MM/DD 形式に整形
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 氏名クリックで展開/非展開を切り替え
  const toggleStudent = (name) => {
    setOpenStudents((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div>
      <h1>練習記録（教師用）</h1>
      {Object.keys(records).length === 0 ? (
        <p>まだ記録がありません。</p>
      ) : (
        <ul>
          {Object.keys(records).map((studentName) => (
            <li key={studentName}>
              <button
                onClick={() => toggleStudent(studentName)}
                style={{ fontWeight: "bold", margin: "5px", cursor: "pointer" }}
              >
                {studentName}
              </button>
              {openStudents[studentName] && (
                <ul style={{ marginLeft: "20px" }}>
                  {records[studentName].map((r) => (
                    <li key={r.id}>
                      <span>{formatDate(r.createdAt)} </span><br />
                      <strong>部活動:</strong> {r.club}<br />
                      <strong>内容:</strong> {r.content}<br />
                      <strong>振り返り:</strong> {r.reflection}
                      <hr />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TeachersPractice;
