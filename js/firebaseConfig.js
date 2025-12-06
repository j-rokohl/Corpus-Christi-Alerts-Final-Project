import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAvoPneCFuoRgG9mcsZ3OjdqDr-Iirb1TY",
  authDomain: "alert-notes.firebaseapp.com",
  projectId: "alert-notes",
  storageBucket: "alert-notes.firebasestorage.app",
  messagingSenderId: "224214997173",
  appId: "1:224214997173:web:a949fd40197275e271c6fc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };