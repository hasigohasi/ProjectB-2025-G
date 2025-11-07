// src/pages/LoginSelect.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function LoginSelect() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>ログインを選択してください</h1>
      <button onClick={() => navigate("/student-login")}>生徒ログイン</button>
      <button onClick={() => navigate("/teacher-login")}>教師ログイン</button>
      <hr />
      <h3>初めての方はこちら</h3>
      <button onClick={() => navigate("/student-register")}>生徒 新規登録</button>
      <button onClick={() => navigate("/teacher-register")}>教師 新規登録</button>
    </div>
  );
}

export default LoginSelect;
