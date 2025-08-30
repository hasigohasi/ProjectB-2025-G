// 生徒用ダッシュボード本体
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    { name: "連絡・提出", path: "/messages" },
    { name: "スケジュール", path: "/schedule" },
    { name: "役職・仕事", path: "/roles" },
    { name: "練習記録", path: "/practice" },
    { name: "通知・お知らせ", path: "/notifications" },
    { name: "設定", path: "/settings" },
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
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
