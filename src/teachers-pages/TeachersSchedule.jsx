// src/teachers-pages/CalendarApp.jsx

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db, auth } from "../firebase";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";

export default function CalendarApp() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");
  const [targetClub, setTargetClub] = useState(""); // ← ★ 追加

  const [currentUser, setCurrentUser] = useState(null);
  const [clubs, setClubs] = useState([]); // ← ★ 部活リスト

  // 🔵 教師判定（教師専用ページなので true で OK）
  const isTeacher = true;

  // 🔵 ログインユーザー情報
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 🔵 Firestore から教師が作成したイベントのみ取得
  useEffect(() => {
    const q = query(
      collection(db, "events"),
      where("type", "==", "teacher") // ← ★ 生徒作成(type: student)の予定は見えないようにする
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(fetched);
    });

    return () => unsubscribe();
  }, []);

  // 🔵 部活一覧を students から取得
  useEffect(() => {
    const fetchClubs = async () => {
      const snap = await getDocs(collection(db, "students"));
      const clubList = [...new Set(snap.docs.map((d) => d.data().club))].filter(
        Boolean
      );
      setClubs(clubList);
    };
    fetchClubs();
  }, []);

  // 🔵 カレンター日付クリック → 追加ダイアログ
  const handleDateClick = (info) => {
    setSelectedEvent(null);
    setTitle("");
    setDate(info.dateStr);
    setDetails("");
    setTargetClub(""); // ← 初期化
    setIsDialogOpen(true);
  };

  // 🔵 イベントクリック → 編集（教師の予定のみ）
  const handleEventClick = (info) => {
    const event = events.find((e) => e.id === info.event.id);

    setSelectedEvent(event);
    setTitle(event.title);
    setDate(event.start);
    setDetails(event.details || "");
    setTargetClub(event.targetClub || "");

    setIsDialogOpen(true);
  };

  // 🔵 保存（追加 / 更新）
  const handleSave = async () => {
    if (!title) return alert("タイトルは必須です");
    if (!targetClub) return alert("対象部活を選択してください");

    // 編集
    if (selectedEvent) {
      await updateDoc(doc(db, "events", selectedEvent.id), {
        title,
        start: date,
        details,
        targetClub,
      });
    } else {
      // 新規追加
      await addDoc(collection(db, "events"), {
        title,
        start: date,
        details,
        createdBy: currentUser.uid,
        type: "teacher", // ← ★ 教師イベント
        targetClub, // ← ★ この部活の生徒だけ見える
      });
    }

    setIsDialogOpen(false);
  };

  // 🔵 削除
  const handleDelete = async () => {
    if (!selectedEvent) return;
    await deleteDoc(doc(db, "events", selectedEvent.id));
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events.map((ev) => ({
          id: ev.id,
          title: `${ev.title}（${ev.targetClub}）`, // ← 表示に部活も含めても可
          start: ev.start,
        }))}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height={600}
        locale="ja"
      />

      {/* 予定追加/編集ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="p-4 space-y-4 w-80">
          <h2 className="text-lg font-semibold">
            {selectedEvent ? "予定を編集" : "予定を追加"}
          </h2>

          <Input placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <Textarea
            placeholder="詳細（任意）"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />

          {/* 🔵 部活動選択（フィルタ用） */}
          <label>対象部活動</label>
          <select
            value={targetClub}
            onChange={(e) => setTargetClub(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">選択してください</option>
            {clubs.map((club, i) => (
              <option key={i} value={club}>
                {club}
              </option>
            ))}
          </select>

          <div className="flex gap-2 justify-end">
            {selectedEvent && (
              <Button variant="destructive" onClick={handleDelete}>
                削除
              </Button>
            )}
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
