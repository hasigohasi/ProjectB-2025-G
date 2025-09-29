// src/students-pages/StudentsRoles.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // firebase設定ファイル

function StudentsRoles() {
  const [roles, setRoles] = useState([]);

  // Firestoreから役職データを取得
  useEffect(() => {
    const fetchRoles = async () => {
      const querySnapshot = await getDocs(collection(db, "roles"));
      const rolesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoles(rolesData);
    };
    fetchRoles();
  }, []);

  return (
    <div>
      <h1>役職一覧（生徒用）</h1>
      {roles.length === 0 ? (
        <p>まだ役職が登録されていません。</p>
      ) : (
        <ul>
          {roles.map((r) => (
            <li key={r.id}>
              {r.role} - {r.studentName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StudentsRoles;
