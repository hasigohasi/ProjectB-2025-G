import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function TeachersRoles() {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState("");
  const [club, setClub] = useState("");
  const [studentName, setStudentName] = useState("");
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Firestore "roles" リアルタイム取得
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "roles"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoles(data);
    });
    return () => unsubscribe();
  }, []);

  // 🔵 部活動変更 → Firestore "students" から該当生徒を取得
  const fetchStudentsByClub = async (clubName) => {
    if (!clubName) {
      setStudents([]);
      return;
    }

    const q = query(collection(db, "students"), where("club", "==", clubName));
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => {
      const s = doc.data();
      return {
        ...s,
        fullName: `${s.lastName} ${s.firstName}`, // ← 姓 + 名 を結合
      };
    });

    setStudents(data);
  };

  // 🔵 部活動入力時
  const handleClubChange = (e) => {
    const value = e.target.value;
    setClub(value);
    setStudentName("");
    fetchStudentsByClub(value);
  };

  // 🔵 新規追加
  const handleAddRole = async () => {
    if (!role || !studentName || !club) return;

    await addDoc(collection(db, "roles"), {
      role,
      studentName,
      club,
    });

    setRole("");
    setClub("");
    setStudentName("");
    setStudents([]);
  };

  // 🔵 編集
  const handleEditRole = async (id) => {
    if (!role || !studentName || !club) return;

    await updateDoc(doc(db, "roles", id), {
      role,
      studentName,
      club,
    });

    setEditingId(null);
    setRole("");
    setClub("");
    setStudentName("");
    setStudents([]);
  };

  // 🔵 削除
  const handleDeleteRole = async (id) => {
    await deleteDoc(doc(db, "roles", id));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">教師用の役職管理画面</h1>

      {/* 入力フォーム */}
      <div className="space-y-2 mb-4">

        {/* 🔵 部活動入力 */}
        <input
          type="text"
          placeholder="部活動（例: サッカー）"
          value={club}
          onChange={handleClubChange}
          className="border p-2 rounded w-full"
        />

        {/* 🔵 生徒名プルダウン（firstName + lastName） */}
        <select
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">生徒を選択</option>

          {students.map((s, index) => (
            <option key={index} value={s.fullName}>
              {s.fullName}
            </option>
          ))}
        </select>

        {/* 🔵 役職 */}
        <input
          type="text"
          placeholder="役職（例: 部長）"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded w-full"
        />

        {editingId ? (
          <button
            onClick={() => handleEditRole(editingId)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            更新
          </button>
        ) : (
          <button
            onClick={handleAddRole}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            追加
          </button>
        )}
      </div>

      {/* 🔵 一覧表示（部活ごとにグループ化して表示） */}
      <div className="space-y-6">
        {(() => {
          // 部活ごとにグループ化
          const grouped = roles.reduce((acc, item) => {
            if (!acc[item.club]) acc[item.club] = [];
            acc[item.club].push(item);
            return acc;
          }, {});

          // 部活名の昇順（任意で変更可能）
          const sortedClubs = Object.keys(grouped).sort();

          return sortedClubs.map((clubName) => (
            <div key={clubName} className="border p-4 rounded">

              {/* 部活動タイトル */}
              <h2 className="text-lg font-bold mb-2">{clubName}</h2>

              {/* その部活の役職一覧 */}
              <ul className="space-y-1">
                {grouped[clubName].map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center border-b pb-1"
                  >
                    <div>
                      <strong>{item.studentName}</strong>
                      <span className="text-gray-700">（{item.role}）</span>
                    </div>

                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setRole(item.role);
                          setClub(item.club);
                          setStudentName(item.studentName);
                          fetchStudentsByClub(item.club);
                        }}
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        編集
                      </button>

                      <button
                        onClick={() => handleDeleteRole(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        削除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

            </div>
          ));
        })()}
      </div>
    </div>
  );
}
