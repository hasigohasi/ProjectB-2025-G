// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ここに Firebase コンソールで取得した設定を貼り付けてください
const firebaseConfig = {
  apiKey: "AIzaSyBkjLlNQ8OkaRvpoV4qzjMHao764Uel8Pw",
  authDomain: "club-app-1b61d.firebaseapp.com",
  projectId: "club-app-1b61d",
  storageBucket: "club-app-1b61d.firebasestorage.app",
  messagingSenderId: "1061044119780",
  appId: "1:1061044119780:web:dc757c35a4221b634324f1"
};
// Firebase アプリ初期化
const app = initializeApp(firebaseConfig);

// Firestore と Authentication をエクスポート
export const db = getFirestore(app);
export const auth = getAuth(app);
