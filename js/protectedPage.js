import { auth } from "./firebaseConfig.js";

import {
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { loadNotes, syncNotes } from "./ui.js";

export let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    const logoutBtnMb = document.getElementById("logout-btn-mb");
    const loginBtn = document.getElementById("login-btn");
    const loginBtnMb = document.getElementById("login-btn-mb");
    console.log(logoutBtn);
    // Check if the user is authenticated
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in.
            currentUser = user;
            console.log("User ID: ", user.uid);
            console.log("Email: ", user.email);
            logoutBtn.style.display = "inline-block";
            logoutBtnMb.style.display = "block";
            loginBtn.style.display = "none";
            loginBtnMb.style.display = "none";
            loadNotes();
            syncNotes();
        } else {
            // No user is signed in.
            console.log("No user is currently signed in.");
            // If the user is not signed in, redirect to the auth page
            window.location.href = "/pages/auth.html";
        }
    });
    // Handle logout functionality
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            M.toast({ html: "Logout successful!" });
            logoutBtn.style.display = "none";
            window.location.href = "/pages/auth.html";
        } catch (error) {
            M.toast({ html: error.message });
        }
    });
    // Handle logout functionality (Mobile menu)
    logoutBtnMb.addEventListener("click", async () => {
        try {
            await signOut(auth);
            M.toast({ html: "Logout successful!" });
            logoutBtnMb.style.display = "none";
            window.location.href = "/pages/auth.html";
        } catch (error) {
            M.toast({ html: error.message });
        }
    });
});