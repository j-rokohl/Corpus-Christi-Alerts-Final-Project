// Import Firebase
import { auth, db } from "./firebaseConfig.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { 
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
    // Select elements
    const signInForm = document.getElementById("sign-in-form");
    const signUpForm = document.getElementById("sign-up-form");
    const showSignUp = document.getElementById("show-signup");
    const showSignIn = document.getElementById("show-signin");
    const signInBtn = document.getElementById("sign-in-btn");
    const signUpBtn = document.getElementById("sign-up-btn");

    // Show Sign Up form and hide Sign In form
    showSignUp.addEventListener("click", () => {
        signInForm.style.display = "none";
        signUpForm.style.display = "block";
    });

    // Show Sign In form and hide Sign Up form
    showSignIn.addEventListener("click", () => {
        signUpForm.style.display = "none";
        signInForm.style.display = "block";
    });

    // Sign up new users
    signUpBtn.addEventListener("click", async () => {
        const email = document.getElementById("sign-up-email").value;
        const password = document.getElementById("sign-up-password").value;
        try {
            const authCredential = await createUserWithEmailAndPassword(
                auth, 
                email, 
                password
            );
            const docRef = doc( db, "users", authCredential.user.uid);
            await setDoc(docRef, { email: email });
            M.toast({ html: "Sign up successful!" });
            window.location.href = "/";
            signUpForm.style.display = "none";
            signInForm.style.display = "block";
        } catch (error) {
            M.toast({ html: error.message });
        }
    });

    // Sign in existing users
    signInBtn.addEventListener("click", async () => {
        const email = document.getElementById("sign-in-email").value;
        const password = document.getElementById("sign-in-password").value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            M.toast({ html: "Sign in successful!" });
            window.location.href = "/"; // Redirect to home page after successful sign-in
        } catch (error) {
            M.toast({ html: error.message });
        }
    });

});