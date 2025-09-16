import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./students-pages/Dashboard";
import Messages from "./students-pages/Messages";
import Schedule from "./students-pages/Schedule";
import Roles from "./students-pages/Roles";
import Practice from "./students-pages/Practice";
import Notifications from "./students-pages/Notifications";
import Settings from "./students-pages/Settings";

import TeachersRoles from "./teachers-pages/TeachersRoles";

function App() {
  return (
    <Router>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="messages" element={<Messages />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="roles" element={<Roles />} />
          <Route path="practice" element={<Practice />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
=======
        {/* 生徒用 */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />

        {/* 教師用 */}
        <Route path="/teacher/roles" element={<TeachersRoles />} />
>>>>>>> e341caf90c110264c4cdff4bf548033308c90ebe
      </Routes>
    </Router>
  );
}

export default App;
