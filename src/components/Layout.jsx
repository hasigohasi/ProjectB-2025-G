// src/components/Layout.js
import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./Layout.css"; // CSSは別で定義

function Layout() {
  return (
    <div className="app-layout">
      <nav className="sidebar">
        <h2 style={{ color: "white" }}>メニュー</h2>
        <Link to="/">
          <span className="material-icons">home</span>ホーム
        </Link>
        <Link to="/messages">
          <span className="material-icons">message</span>連絡・提出
        </Link>
        <Link to="/schedule">
          <span className="material-icons">schedule</span>スケジュール
        </Link>
        <Link to="/roles">
          <span className="material-icons">group</span>役職・仕事
        </Link>
        <Link to="/practice">
          <span className="material-icons">edit_note</span>練習記録
        </Link>
        <Link to="/notifications">
          <span className="material-icons">notifications</span>通知・お知らせ
        </Link>
        <Link to="/settings">
          <span className="material-icons">settings</span>設定
        </Link>
        <hr />
        <h3 style={{ color: "white", fontSize: "20px" }}>教師用</h3>
        <Link to="/teacher/roles">役職管理</Link>
        <Link to="/teacher/practice">練習一覧</Link>
      </nav>
      <main className="content">
        {/* ページごとに切り替わる部分 */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
