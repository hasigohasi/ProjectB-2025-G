import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./students-pages/Dashboard";
import Messages from "./students-pages/Messages";
import Schedule from "./students-pages/Schedule";
import StudentsRoles from "./students-pages/StudentsRoles";
import Practice from "./students-pages/Practice";
import Notifications from "./students-pages/Notifications";
import Settings from "./students-pages/Settings";

import TeachersRoles from "./teachers-pages/TeachersRoles";
import TeachersPractice from "./teachers-pages/TeachersPractice";

function App() {
  return (
    <Router>
      <Routes>
        {/* 生徒用 */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="messages" element={<Messages />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="roles" element={<StudentsRoles />} />
          <Route path="practice" element={<Practice />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 教師用 */}
         <Route path="/teacher" element={<Layout />}>
           <Route path="roles" element={<TeachersRoles />} />
           <Route path="practice" element={<TeachersPractice />} />
         </Route>

      </Routes>
    </Router>
  );
}

export default App;
