import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./Layout.css";

function TeacherLayout() {
  return (
    <div className="app-layout">
      <nav className="sidebar">
        <h2 style={{ color: "white" }}>メニュー</h2>

        <h3 style={{ color: "white", fontSize: "20px" }}>教師用</h3>
        <Link to="/teacher/dashboard">
        <span className="material-icons">home</span>ホーム
        </Link>
        <Link to="/teacher/messages">
        <span className="material-icons">message</span>連絡
        </Link>
        <Link to="/teacher/schedule">
          <span className="material-icons">schedule</span>スケジュール
        </Link>
        <Link to="/teacher/roles">
        <span className="material-icons">group</span>役職管理
        </Link>
        <Link to="/teacher/practice">
        <span className="material-icons">edit_note</span>練習一覧
        </Link>
        <Link to="/teacher/results">
        <span className="material-icons">emoji_events</span>大会結果一覧
        </Link>
        
      </nav>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default TeacherLayout;
