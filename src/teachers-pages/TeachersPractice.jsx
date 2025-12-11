// src/teachers-pages/TeachersPractice.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

function TeachersPractice() {
  const [records, setRecords] = useState({});
  const [openStudents, setOpenStudents] = useState({});
  const [openMonths, setOpenMonths] = useState({});
  const [searchClub, setSearchClub] = useState(""); // 部活検索
  const [filterGrade, setFilterGrade] = useState("全学年"); // ★ 学年フィルター

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
        if (!grouped[r.name]) grouped[r.name] = [];
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

  const toggleMonth = (key) => {
    setOpenMonths((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const groupByMonth = (list) => {
    const grouped = {};
    list.forEach((r) => {
      if (!r.createdAt) return;
      const d = r.createdAt.toDate();
      const ym = `${d.getFullYear()}年${d.getMonth() + 1}月`;

      if (!grouped[ym]) grouped[ym] = [];
      grouped[ym].push(r);
    });
    return grouped;
  };

  // 🔍 部活検索 & 学年フィルタ適用
  const filteredRecords = Object.keys(records).filter((studentName) => {
    const list = records[studentName];

    // 部活フィルタ
    const clubMatch =
      searchClub === "" ? true : list.some((r) => r.club.includes(searchClub));

    // 学年フィルタ
    const gradeMatch =
      filterGrade === "全学年"
        ? true
        : list.some((r) => r.grade === filterGrade);

    return clubMatch && gradeMatch;
  });

  // 🔽 学年順でソート（1年→2年→3年→その他→未設定）
  const gradeOrder = { "1年": 1, "2年": 2, "3年": 3, 未設定: 4 };
  filteredRecords.sort((a, b) => {
    const gradeA = records[a][0]?.grade || "未設定";
    const gradeB = records[b][0]?.grade || "未設定";
    return (gradeOrder[gradeA] || 9) - (gradeOrder[gradeB] || 9);
  });

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

      {/* 🎓 学年フィルター */}
      <select
        value={filterGrade}
        onChange={(e) => setFilterGrade(e.target.value)}
        style={{ marginLeft: "10px", padding: "5px" }}
      >
        <option value="全学年">全学年</option>
        <option value="1年">1年</option>
        <option value="2年">2年</option>
        <option value="3年">3年</option>
        <option value="未設定">未設定</option>
      </select>

      {filteredRecords.length === 0 ? (
        <p>該当する記録がありません。</p>
      ) : (
        <ul>
          {filteredRecords.map((studentName) => {
            const studentRecords = records[studentName];
            const months = groupByMonth(studentRecords);

            const grade = studentRecords[0]?.grade || "未設定";

            return (
              <li key={studentName}>
                {/* 🔵 生徒名 + 学年表示 */}
                <button
                  onClick={() => toggleStudent(studentName)}
                  style={{
                    fontWeight: "bold",
                    margin: "5px",
                    cursor: "pointer",
                  }}
                >
                  {openStudents[studentName] ? "▼" : "▶"} {studentName}（{grade}）
                </button>

                {openStudents[studentName] && (
                  <ul style={{ marginLeft: "20px" }}>
                    {/* 🔵 年月一覧 */}
                    {Object.keys(months).map((ym) => {
                      const key = `${studentName}-${ym}`;

                      return (
                        <li key={ym}>
                          <button
                            onClick={() => toggleMonth(key)}
                            style={{
                              cursor: "pointer",
                              background: "none",
                              border: "none",
                              fontSize: "16px",
                              padding: 0,
                              marginTop: "5px",
                            }}
                          >
                            {openMonths[key] ? "▼" : "▶"} {ym}
                          </button>

                          {openMonths[key] && (
                            <ul style={{ marginLeft: "20px" }}>
                              {months[ym].map((r) => (
                                <li key={r.id}>
                                  <span>{formatDate(r.createdAt)}</span>
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
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default TeachersPractice;
