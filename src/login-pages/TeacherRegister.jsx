import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function TeacherRegister() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Firebase Authentication に登録
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore に教師情報を登録
      await setDoc(doc(db, "teachers", user.uid), {
        firstName,
        lastName,
        email,
        role: "teacher",
      });

      alert("登録が完了しました！");
      navigate("/teacher-login");
    } catch (err) {
      setError("登録に失敗しました: " + err.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>教師 新規登録</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="姓"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        /><br/>
        <input
          type="text"
          placeholder="名"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        /><br/>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br/>
        <input
          type="password"
          placeholder="パスワード（6文字以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br/>
        <button type="submit">登録</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default TeacherRegister;
