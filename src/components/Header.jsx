import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", background: "#f5f5f5" }}>
      <h2>部活ナビ（仮）</h2>
      <div>
        <button onClick={() => navigate("/notifications")} style={{ marginRight: "10px" }}>通知</button>
        <button onClick={() => navigate("/settings")}>設定</button>
      </div>
    </header>
  );
};

export default Header;
