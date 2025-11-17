// src/pages/LoginSelect.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function LoginSelect() {
  const navigate = useNavigate();

  const loginButtons = [
    { label: "生徒ログイン", path: "/student-login", icon: "person" },
    { label: "教師ログイン", path: "/teacher-login", icon: "school" },
  ];

  const registerButtons = [
    { label: "生徒 新規登録", path: "/student-register", icon: "person_add" },
    { label: "教師 新規登録", path: "/teacher-register", icon: "person_add_alt" },
  ];

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "60px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "30px",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>ログインを選択してください</h1>

      {/* ログイン */}
      <div style={{ display: "flex", gap: "20px" }}>
        {loginButtons.map((btn) => (
          <div
            key={btn.label}
            onClick={() => navigate(btn.path)}
            style={{
              padding: "20px",
              width: "150px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              background: "white",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <span className="material-icons" style={{ fontSize: "40px" }}>
              {btn.icon}
            </span>
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>{btn.label}</span>
          </div>
        ))}
      </div>

      <hr style={{ width: "70%" }} />

      <h3 style={{ fontSize: "32px" }}>初めての方はこちら</h3>

      {/* 新規登録 */}
      <div style={{ display: "flex", gap: "20px" }}>
        {registerButtons.map((btn) => (
          <div
            key={btn.label}
            onClick={() => navigate(btn.path)}
            style={{
              padding: "20px",
              width: "150px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              background: "white",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <span className="material-icons" style={{ fontSize: "40px" }}>
              {btn.icon}
            </span>
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>{btn.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


export default LoginSelect;
