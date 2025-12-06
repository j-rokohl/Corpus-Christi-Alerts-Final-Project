import { currentUser } from "./unprotectedPage.js";

import { db } from "./firebaseConfig.js";

import {
    collection,
    addDoc,
    setDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Add a note
export async function addNoteToFirebase(note) {
    try {
        if (!currentUser){
            throw new Error("User is not authenticated.")
        }
        const userId = currentUser.uid;
        console.log( "userID: ", userId );
        const userRef = doc(db, "users", userId);
        await setDoc(
        userRef,
        {
            email: currentUser.email,
        },
        { merge: true }
        );
        const notesRef = collection(userRef, "notes");
        const docRef = await addDoc(notesRef, note);
        return { id: docRef.id, ...note };
    } catch (e) {
        console.error("Error adding note: ", e);
    }
}

export async function getNotesFromFirebase() {
    const notes = [];
    try {
        if (!currentUser){
            throw new Error("User is not authenticated.")
        }
        const userId = currentUser.uid;
        const noteRef = collection(doc(db, "users", userId), "notes");
        const querySnapshot = await getDocs(noteRef);
        querySnapshot.forEach((doc) => {
            notes.push({ id: doc.id, ...doc.data() });
        });
    } catch (e) {
        console.error("Error retrieving notes: ", e);
    }
    return notes;
}

export async function deleteNoteFromFirebase(id) {
    try {
        if (!currentUser){
            throw new Error("User is not authenticated.")
        }
        const userId = currentUser.uid;
        await deleteDoc(doc(db, "users", userId, "notes", id));
    } catch (e) {
        console.error("Error deleting note: ", e);
    }
}

export async function updateNoteInFirebase(id, updatedData) {
    console.log(updatedData, id);
    try {
        if (!currentUser){
            throw new Error("User is not authenticated.")
        }
        const userId = currentUser.uid;
        const noteRef = doc(db, "users", userId, "notes", id);
        await updateDoc(noteRef, updatedData);
    } catch (e) {
        console.error("Error updating note: ", e);
    }
}
