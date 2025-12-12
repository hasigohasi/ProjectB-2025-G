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
  getDoc
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

  const [currentUser, setCurrentUser] = useState(null);
  const [myClub, setMyClub] = useState("");

  // ログインユーザー取得
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 生徒の所属クラブ取得
  useEffect(() => {
    const fetchStudentInfo = async () => {
      if (!currentUser) return;

      const ref = doc(db, "students", currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setMyClub(snap.data().club || "");
      }
    };

    fetchStudentInfo();
  }, [currentUser]);

  // Firestore 予定取得
useEffect(() => {
  if (!currentUser) return;

  // Firestore 全イベントを購読
  const unsubscribe = onSnapshot(collection(db, "events"), async (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    let res = [];

    // ① 自分のイベント
    const myEvents = all.filter((e) => e.createdBy === currentUser.uid);

    res = [...myEvents];

    // ② 自分の部活の教師イベント
    if (myClub) {
      const teacherEvents = all.filter(
        (e) => e.type === "teacher" && e.targetClub === myClub
      );
      res = [...res, ...teacherEvents];
    }

    setEvents(res);
  });

  return () => unsubscribe();
}, [currentUser, myClub]);

  // 日付クリック
  const handleDateClick = (info) => {
    setSelectedEvent(null);
    setTitle("");
    setDate(info.dateStr);
    setDetails("");
    setIsDialogOpen(true);
  };

  // イベントクリック
  const handleEventClick = (info) => {
  const event = info.event.extendedProps.raw;
  if (!event) return;

  // 教師の予定：編集禁止だが【閲覧はできる】
  if (event.type === "teacher") {
    setSelectedEvent(event);
    setTitle(event.title);
    setDate(event.start);
    setDetails(event.details || "");

    setIsDialogOpen(true);  // ← 閲覧ダイアログを開く

    return;  // 編集禁止だけど閲覧はOKにする
  }

  // 生徒本人のイベントは編集可能
  setSelectedEvent(event);
  setTitle(event.title);
  setDate(event.start);
  setDetails(event.details || "");
  setIsDialogOpen(true);
};


  // 保存
  const handleSave = async () => {
    if (!title) return alert("タイトル必須");

    if (!selectedEvent) {
      await addDoc(collection(db, "events"), {
        title,
        start: date,
        details,
        createdBy: currentUser.uid,
        type: "student"
      });
    } else {
      await updateDoc(doc(db, "events", selectedEvent.id), {
        title,
        start: date,
        details
      });
    }

    setIsDialogOpen(false);
  };

  // 削除
  const handleDelete = async () => {
    if (!selectedEvent) return;

    if (selectedEvent.createdBy !== currentUser.uid) {
      return alert("削除権限がありません");
    }

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
          title: ev.title,
          start: ev.start,
          extendedProps: { raw: ev },  // ← これが必須
        }))}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height={600}
        locale="ja"
      />

      {/* ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="p-4 space-y-4 w-80">
          <h2 className="text-lg font-semibold">
            {selectedEvent ? "予定を編集" : "予定を追加"}
          </h2>

          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトル" />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="詳細（任意）" />

          <div className="flex gap-2 justify-end">
            {selectedEvent?.createdBy === currentUser?.uid && (
              <Button variant="destructive" onClick={handleDelete}>
                削除
              </Button>
            )}
            {selectedEvent?.type !== "teacher" && (
              <Button onClick={handleSave}>保存</Button>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
