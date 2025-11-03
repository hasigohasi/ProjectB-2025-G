// 生徒用ダッシュボード本体
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    { name: "連絡・提出", path: "/messages" , icon: "message"},
    { name: "スケジュール", path: "/schedule", icon: "schedule" },
    { name: "役職・仕事", path: "/roles", icon: "group" },
    { name: "練習記録", path: "/practice", icon: "edit_note" },
    { name: "通知・お知らせ", path: "/notifications", icon: "notifications" },
    { name: "設定", path: "/settings", icon: "settings" },
  ];

  return (
    <div>
      <Header />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {menuItems.map((item) => (
  <div
    key={item.name}
    onClick={() => navigate(item.path)}
    style={{
      padding: "20px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      cursor: "pointer",
      width: "200px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
    }}
  >
    <span className="material-icons" style={{ fontSize: "40px", color: "#555" }}>
      {item.icon}
    </span>
    <span>{item.name}</span>
  </div>
))}
      </div>
    </div>
  );
};

export default Dashboard;
