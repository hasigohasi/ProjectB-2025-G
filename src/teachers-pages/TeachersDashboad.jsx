import React from "react";
import { Link } from "react-router-dom"; 
import TeacherHeader from "../components/TeacherHeader";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    { name: "連絡", path: "/teacher/messages" , icon: "message"},
    { name: "スケジュール", path: "/teacher/schedule", icon: "schedule" },
    { name: "役職・仕事", path: "/teacher/roles", icon: "group" },
    { name: "練習記録", path: "/teacher/practice", icon: "edit_note" },
    { name: "大会結果", path: "/teacher/results", icon: "emoji_events" },
  ];

  return (
    <div>
      <TeacherHeader />
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

export default TeacherDashboard;
