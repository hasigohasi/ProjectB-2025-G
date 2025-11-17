import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import LoginSelect from "./login-pages/LoginSelect";
import StudentLogin from "./login-pages/StudentLogin";
import TeacherLogin from "./login-pages/TeacherLogin";
import StudentRegister from "./login-pages/StudentRegister";
import TeacherRegister from "./login-pages/TeacherRegister";

import Dashboard from "./students-pages/Dashboard";
import StudentsMessages from "./students-pages/StudentsMessages";
import Schedule from "./students-pages/Schedule";
import StudentsRoles from "./students-pages/StudentsRoles";
import Practice from "./students-pages/Practice";
import Competition from "./students-pages/Competition";
import Notifications from "./students-pages/Notifications";
import Settings from "./students-pages/Settings";

import TeacherDashboard from "./teachers-pages/TeachersDashboad"; 
import TeachersRoles from "./teachers-pages/TeachersRoles";
import TeachersPractice from "./teachers-pages/TeachersPractice";
import TeachersResults from "./teachers-pages/TeachersResults";
import TeachersMessages from "./teachers-pages/TeachersMessages";

function App() {
  return (
    <Router>
      <Routes>
        {/*ログインページ */}
          <Route index element={<LoginSelect />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/student-register" element={<StudentRegister />} />
          <Route path="/teacher-register" element={<TeacherRegister />} />
        {/* 生徒用 */}
        <Route path="/" element={<Layout />}>
          <Route path="/student" element={<Dashboard />} />
          <Route path="messages" element={<StudentsMessages />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="roles" element={<StudentsRoles />} />
          <Route path="practice" element={<Practice />} />
          <Route path="competitions" element={<Competition />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 教師用 */}
         <Route path="/teacher" element={<Layout />}>
           <Route path="dashboard" element={<TeacherDashboard />} />
           <Route path="roles" element={<TeachersRoles />} />
           <Route path="practice" element={<TeachersPractice />} />
           <Route path="results" element={<TeachersResults />} />
           <Route path="messages" element={<TeachersMessages />} />
         </Route>

      </Routes>
    </Router>
  );
}

export default App;
