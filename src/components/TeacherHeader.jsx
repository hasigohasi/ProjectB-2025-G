import React from "react";
import { useNavigate } from "react-router-dom";

const TeacherHeader = () => {
  const navigate = useNavigate();
  return (
    <header style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", background: "#f5f5f5" }}>
      <h2>部活ナビ（教員用）</h2>
    </header>
  );
};

export default TeacherHeader;