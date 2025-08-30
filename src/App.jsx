import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./students-pages/Dashboard";
import Messages from "./students-pages/Messages";
import Schedule from "./students-pages/Schedule";
import Roles from "./students-pages/Roles";
import Practice from "./students-pages/Practice";
import Notifications from "./students-pages/Notifications";
import Settings from "./students-pages/Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
