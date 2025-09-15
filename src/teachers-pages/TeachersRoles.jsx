import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export default function TeachersRoles() {
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(""); // ✅ useState 追加
  const [studentName, setStudentName] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Firestore からリアルタイム取得
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

  // 役職を追加
  const handleAddRole = async () => {
    if (!role || !studentName) return;
    await addDoc(collection(db, "roles"), {
      
      role,
      studentName,
    });
    console.log("保存成功!");
    setRole("");
    setStudentName("");
  };

  // 役職を編集
  const handleEditRole = async (id) => {
    if (!role || !studentName) return;
    await updateDoc(doc(db, "roles", id), {
      role,
      studentName,
    });
    setEditingId(null);
    setRole("");
    setStudentName("");
  };

  // 役職を削除
  const handleDeleteRole = async (id) => {
    await deleteDoc(doc(db, "roles", id));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">教師用の役職管理画面</h1>

      {/* 入力フォーム */}
      <div className="space-y-2 mb-4">
        <input
          type="text"
          placeholder="役職 (例: 部長)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="生徒氏名"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
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

      {/* 一覧表示 */}
      <ul className="space-y-2">
        {roles.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>
              <strong>{item.role}</strong> - {item.studentName}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setEditingId(item.id);
                  setRole(item.role);
                  setStudentName(item.studentName);
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
  );
}
