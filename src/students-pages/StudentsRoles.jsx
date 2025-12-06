// src/students-pages/StudentsRoles.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function StudentsRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firestoreから役職データを取得
  useEffect(() => {
    const fetchRoles = async () => {
      const snapshot = await getDocs(collection(db, "roles"));
      const rolesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoles(rolesData);
      setLoading(false);
    };
    fetchRoles();
  }, []);

  if (loading) return <p>読み込み中...</p>;

  // 🔵 部活動ごとにグループ化
  const groupedRoles = roles.reduce((acc, item) => {
    if (!acc[item.club]) acc[item.club] = [];
    acc[item.club].push(item);
    return acc;
  }, {});

  // 🔵 部活動名を昇順に並べる
  const sortedClubs = Object.keys(groupedRoles).sort();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">役職一覧（生徒用）</h1>

      {sortedClubs.length === 0 ? (
        <p>まだ役職が登録されていません。</p>
      ) : (
        <div className="space-y-6">
          {sortedClubs.map((clubName) => (
            <div key={clubName} className="border p-4 rounded shadow-sm">
              {/* 部活動タイトル */}
              <h2 className="text-lg font-bold mb-2">{clubName}</h2>

              {/* その部活の役職一覧 */}
              <ul className="space-y-1">
                {groupedRoles[clubName].map((r) => (
                  <li
                    key={r.id}
                    className="flex justify-between items-center border-b pb-1"
                  >
                    <div>
                      <strong>{r.studentName}</strong>
                      <span className="text-gray-700">
                        （{r.role}）
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentsRoles;
