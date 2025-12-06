import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

function TeachersPractice() {
  const [records, setRecords] = useState({});
  const [openStudents, setOpenStudents] = useState({});
  const [searchClub, setSearchClub] = useState(""); // 🔍 部活動検索

  useEffect(() => {
    const fetchPractices = async () => {
      const q = query(collection(db, "practices"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const toggleStudent = (name) => {
    setOpenStudents((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // 🔍 部活検索フィルタ
  const filteredRecords = Object.keys(records).filter((studentName) =>
    searchClub === ""
      ? true
      : records[studentName].some((r) =>
          r.club.includes(searchClub)
        )
  );

  return (
    <div>
      <h1>練習記録（教師用）</h1>

      {/* 🔍 部活検索フォーム */}
      <input
        type="text"
        placeholder="部活名で検索（例：サッカー）"
        value={searchClub}
        onChange={(e) => setSearchClub(e.target.value)}
        style={{ padding: "5px", marginBottom: "10px" }}
      />

      {filteredRecords.length === 0 ? (
        <p>該当する記録がありません。</p>
      ) : (
        <ul>
          {filteredRecords.map((studentName) => (
            <li key={studentName}>
              <button
                onClick={() => toggleStudent(studentName)}
                style={{
                  fontWeight: "bold",
                  margin: "5px",
                  cursor: "pointer",
                }}
              >
                {studentName}
              </button>
              {openStudents[studentName] && (
                <ul style={{ marginLeft: "20px" }}>
                  {records[studentName].map((r) => (
                    <li key={r.id}>
                      <span>{formatDate(r.createdAt)} </span>
                      <br />
                      <strong>部活動:</strong> {r.club}
                      <br />
                      <strong>内容:</strong> {r.content}
                      <br />
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
