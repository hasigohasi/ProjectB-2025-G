// src/TeacherResult.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Sidebar from "../components/Layout";

const TeacherResult = () => {
  const [club, setClub] = useState("");
  const [grade, setGrade] = useState("");
  const [name, setName] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("");

  //  Firestore 検索処理
  const handleSearch = async () => {
    try {
      setStatus(" 検索中...");
      setResults([]);

      const snapshot = await getDocs(collection(db, "results"));
      const allData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      //  重複削除
      const uniqueData = allData.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.club === item.club &&
              t.grade === item.grade &&
              t.name === item.name &&
              t.result === item.result
          )
      );

      //  フィルタリング（入力された条件で絞り込み）
      const filtered = uniqueData.filter((item) => {
        return (
          (!club || item.club?.includes(club)) &&
          (!grade || item.grade?.includes(grade)) &&
          (!name || item.name?.includes(name))
        );
      });

      if (filtered.length === 0) {
        setStatus(" 該当するデータが見つかりません。");
        return;
      }

      setResults(filtered);
      setStatus(` ${filtered.length}件取得しました。`);
    } catch (err) {
      console.error("検索エラー:", err);
      setStatus(" 検索中にエラーが発生しました。");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/*  メインエリア */}
      <div style={styles.container}>
        <h2>大会結果（教師用）</h2>

        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <input
            style={styles.input}
            placeholder="部活名（例：サッカー）"
            value={club}
            onChange={(e) => setClub(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="学年（例：2）"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="名前（例：山田）"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button style={styles.searchButton} onClick={handleSearch}>
            検索
          </button>
        </div>

        {status && <p style={styles.status}>{status}</p>}

        {results.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>部活</th>
                <th>学年</th>
                <th>名前</th>
                <th>結果</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>{r.club}</td>
                  <td>{r.grade}</td>
                  <td>{r.name}</td>
                  <td>{r.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/*  CSS */
const styles = {
  container: {
    flex: 1,
    padding: "20px",
    backgroundColor: "#f8f9fa",
    overflowY: "auto",
  },
  input: {
    padding: "8px",
    width: "150px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  searchButton: {
    backgroundColor: "#4C84FF",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  table: {
    borderCollapse: "collapse",
    marginTop: "15px",
    width: "100%",
    textAlign: "center",
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
  },
  status: { marginTop: "10px", fontWeight: "bold" },
};

export default TeacherResult;
