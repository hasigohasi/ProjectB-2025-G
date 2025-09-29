// src/Layout.js
import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./Layout.css"; // CSSは別で定義

function Layout() {
  return (
    <div className="app-layout">
      <nav className="sidebar">
        <Link to="/">ホーム</Link>
        <Link to="/messages">連絡・提出</Link>
        <Link to="/schedule">スケジュール</Link>
        <Link to="/roles">役職・仕事</Link>
        <Link to="/practice">練習記録</Link>
        <Link to="/notifications">通知・お知らせ</Link>
        <Link to="/settings">設定</Link>
      </nav>
      <main className="content">
        {/* ページごとに切り替わる部分 */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
