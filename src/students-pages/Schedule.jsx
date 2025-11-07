// スケジュール管理画面
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
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
  const [currentUser, setCurrentUser] = useState(null);

  // ログインユーザー情報
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Firestore からイベント取得・リアルタイム同期
  useEffect(() => {
    const eventsCol = collection(db, "events");
    const unsubscribe = onSnapshot(eventsCol, snapshot => {
      const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(fetchedEvents);
    });
    return () => unsubscribe();
  }, []);

  // カレンダー日付クリック → 追加用ダイアログ表示
  const handleDateClick = (info) => {
    setSelectedEvent(null);
    setTitle("");
    setDate(info.dateStr);
    setDetails("");
    setIsDialogOpen(true);
  };

  // イベントクリック → 詳細表示＋編集可能なら編集ボタン表示
  const handleEventClick = (info) => {
    const event = events.find(e => e.id === info.event.id);
    setSelectedEvent(event);
    setTitle(event.title);
    setDate(event.start);
    setDetails(event.details || "");
    setIsDialogOpen(true);
  };

  // 保存（追加 or 編集）
  const handleSave = async () => {
    if (!title) return alert("タイトルは必須です");

    if (selectedEvent) {
      // 編集権限チェック
      if (selectedEvent.createdBy !== currentUser.uid) return alert("編集権限がありません");
      await updateDoc(doc(db, "events", selectedEvent.id), { title, start: date, details });
    } else {
      await addDoc(collection(db, "events"), {
        title,
        start: date,
        details,
        createdBy: currentUser.uid,
        type: "student" // 後で教師は type: "teacher" にする
      });
    }

    setIsDialogOpen(false);
  };

  // 削除
  const handleDelete = async () => {
    if (selectedEvent && selectedEvent.createdBy === currentUser.uid) {
      await deleteDoc(doc(db, "events", selectedEvent.id));
      setIsDialogOpen(false);
    } else {
      alert("削除権限がありません");
    }
  };

  return (
    <div className="p-6">
      {/* カレンダー上部に追加フォームは置かず、クリックでダイアログ表示 */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events.map(ev => ({
          id: ev.id,
          title: ev.title,
          start: ev.start
        }))}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height={600}
        dayCellClassNames={(arg) => {
          const day = arg.date.getDay();
          const ymd = arg.date.toISOString().split("T")[0];

          if (day === 0) return "sunday";
          if (day === 6) return "saturday";
          return "";
          }}
        locale="ja"
      />

      {/* 予定追加・編集ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="p-4 space-y-4 w-80">
          <h2 className="text-lg font-semibold">{selectedEvent ? "予定を編集" : "予定を追加"}</h2>
          <Input placeholder="タイトル" value={title} onChange={e => setTitle(e.target.value)} />
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          <Textarea placeholder="詳細 (任意)" value={details} onChange={e => setDetails(e.target.value)} />
          <div className="flex gap-2 justify-end">
            {selectedEvent && selectedEvent.createdBy === currentUser?.uid && (
              <Button variant="destructive" onClick={handleDelete}>削除</Button>
            )}
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
