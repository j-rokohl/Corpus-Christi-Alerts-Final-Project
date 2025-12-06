import { openDB } from "https://unpkg.com/idb?module";
import {
    addNoteToFirebase,
    getNotesFromFirebase,
    deleteNoteFromFirebase,
    updateNoteInFirebase,
} from "./firebaseDB.js";

// Constants
const STORAGE_THRESHOLD = 0.8;

// Initialization and Event Listeners
document.addEventListener("DOMContentLoaded", function () {
    const menus = document.querySelector(".sidenav");
    M.Sidenav.init(menus, { edge: "right" });
    const forms = document.querySelector(".side-form");
    M.Sidenav.init(forms, { edge: "left" });
    checkStorageUsage();
    requestPersistentStorage();
});

// Register Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/serviceworker.js")
        .then((req) => console.log("Service Worker Registered!", req))
        .catch((err) => console.log("Service Worker registration failed", err));
}

// Modals to Users
// 1. Display notifications to users when offline data is synced with Firebase upon reconnecting
function restoredFunct() {
    $(document).ready(function () {
        $('.modal').modal();
        var instance = M.Modal.getInstance(document.getElementById('modal1'));
        instance.open();
    });
}
// 2. Display notifications to users when note will be stored offline
function lostFunct() {
    $(document).ready(function () {
        $('.modal').modal();
        var instance = M.Modal.getInstance(document.getElementById('modal2'));
        instance.open();
    });
}

// Database Operations
// Create or Get IndexedDB database instance
let dbPromise;
async function getDB() {
    if (!dbPromise) {
        dbPromise = openDB("noteManager", 1, {
            upgrade(db) {
                const store = db.createObjectStore("notes", {
                    keyPath: "id",
                    autoIncrement: true,
                });
                store.createIndex("status", "status");
                store.createIndex("synced", "synced");
            },
        });
    }
    return dbPromise;
}

// Sync unsynced notes from IndexedDB to Firebase
export async function syncNotes() {
    const db = await getDB();
    const tx = db.transaction("notes", "readonly");
    const store = tx.objectStore("notes");
    const notes = await store.getAll();
    await tx.done;

    for (const note of notes) {
        if (!note.synced && isOnline()) {
            try {
                const noteToSync = {
                    title: note.title,
                    description: note.description,
                    status: note.status,
                };
                const savedNote = await addNoteToFirebase(noteToSync);
                const txUpdate = db.transaction("notes", "readwrite");
                const storeUpdate = txUpdate.objectStore("notes");
                await storeUpdate.delete(note.id);
                await storeUpdate.put({ ...note, id: savedNote.id, synced: true });
                setTimeout(restoredFunct, 500);
                await txUpdate.done;
            } catch (error) {
                console.error("Error syncing note:", error);
            }
        }
    }
}

// Check if the app is online
function isOnline() {
    return navigator.onLine;
}

// Note Management Functions
// Add Note (either to Firebase or IndexedDB)
async function addNote(note) {
    const db = await getDB();
    let noteId;

    if (isOnline()) {
        try {
            const savedNote = await addNoteToFirebase(note);
            noteId = savedNote.id;
            const tx = db.transaction("notes", "readwrite");
            const store = tx.objectStore("notes");
            await store.put({ ...note, id: noteId, synced: true });
            await tx.done;
        } catch (error) {
            console.error("Error adding note to Firebase:", error);
        }
    } else {
        noteId = `temp-${Date.now()}`;
        const noteToStore = { ...note, id: noteId, synced: false };
        const tx = db.transaction("notes", "readwrite");
        const store = tx.objectStore("notes");
        await store.put(noteToStore);
        setTimeout(lostFunct, 500);
        await tx.done;
    }

    checkStorageUsage();
    return { ...note, id: noteId };
}

// Edit Note with Transaction
async function editNote(id, updatedData) {
    if (!id) {
        console.error("Invalid ID passed to editNote.");
        return;
    }

    const db = await getDB();

    if (isOnline()) {
        try {
            await updateNoteInFirebase(id, updatedData);
            // Update in IndexedDB as well
            const tx = db.transaction("notes", "readwrite");
            const store = tx.objectStore("notes");
            await store.put({ ...updatedData, id: id, synced: true });
            await tx.done;

            // Reload the entire note list to reflect the updates
            loadNotes(); // Call loadNotes here to refresh the UI
        } catch (error) {
            console.error("Error updating note in Firebase:", error);
        }
    } else {
        // If offline, make an IndexedDB transaction
        const tx = db.transaction("notes", "readwrite");
        const store = tx.objectStore("notes");
        await store.put({ ...updatedData, id: id, synced: false });
        await tx.done;
        loadNotes(); // Refresh the UI with loadNotes here as well
    }
}

// Delete Note with Transaction
async function deleteNote(id) {
    if (!id) {
        console.error("Invalid ID passed to deleteNote.");
        return;
    }
    const db = await getDB();
    if (isOnline()) {
        try {
            await deleteNoteFromFirebase(id);
        } catch (error) {
            console.error("Error deleting note from Firebase:", error);
        }
    }

    const tx = db.transaction("notes", "readwrite");
    const store = tx.objectStore("notes");
    try {
        await store.delete(id);
    } catch (e) {
        console.error("Error deleting note from IndexedDB:", e);
    }
    await tx.done;

    const noteCard = document.querySelector(`[data-id="${id}"]`);
    if (noteCard) {
        noteCard.remove();
    }
    checkStorageUsage();
}

// UI Functions 
// Load notes and sync with Firebase if online
export async function loadNotes() {
    const db = await getDB();
    const noteContainer = document.querySelector(".notes");
    noteContainer.innerHTML = "";

    if (isOnline()) {
        const firebaseNotes = await getNotesFromFirebase();
        const tx = db.transaction("notes", "readwrite");
        const store = tx.objectStore("notes");

        for (const note of firebaseNotes) {
            await store.put({ ...note, synced: true });
            displayNote(note);
        }
        await tx.done;
    } else {
        const tx = db.transaction("notes", "readonly");
        const store = tx.objectStore("notes");
        const notes = await store.getAll();
        notes.forEach((note) => {
            displayNote(note);
        });
        await tx.done;
    }
}

// Display Note in the UI
function displayNote(note) {
    const noteContainer = document.querySelector(".notes");

    // Check if the note already exists in the UI and remove it
    const existingNote = noteContainer.querySelector(`[data-id="${note.id}"]`);
    if (existingNote) {
        existingNote.remove();
    }

    // Create new note HTML and add it to the container
    const html = `
    <div class="card-panel white row valign-wrapper" data-id="${note.id}">
      <div class="col s2 m1">
        <img src="/img/note.png" class="responsive-img" alt="Note icon" style="width: 100%; max-width: 80px; min-width: 28px; height: auto; margin: auto;"/>
      </div>
      <div class="note-detail col s10 m8">
        <h5 class="note-title black-text">${note.title}</h5>
        <div class="note-description black-text">${note.description}</div>
      </div>
      <div class="col s2 right-align">
        <button class="note-delete btn-flat" aria-label="Delete note">
          <i class="material-icons black-text text-darken-1" style="font-size: 30px">delete</i>
        </button>
        <button class="note-edit btn-flat" data-target="side-form" aria-label="Edit note">
          <i class="material-icons black-text text-darken-1" style="font-size: 30px">edit</i>
        </button>
      </div>
    </div>
  `;
    noteContainer.insertAdjacentHTML("beforeend", html);

    const deleteButton = noteContainer.querySelector(
        `[data-id="${note.id}"] .note-delete`
    );
    deleteButton.addEventListener("click", () => deleteNote(note.id));

    const editButton = noteContainer.querySelector(
        `[data-id="${note.id}"] .note-edit`
    );
    editButton.addEventListener("click", () =>
        openEditForm(note.id, note.title, note.description)
    );
}

// Add/Edit Note Button Listener
const addNoteButton = document.querySelector("#form-action-btn");
addNoteButton.addEventListener("click", async () => {
    const titleInput = document.querySelector("#title");
    const descriptionInput = document.querySelector("#description");
    const noteIdInput = document.querySelector("#note-id");
    const formActionButton = document.querySelector("#form-action-btn");
    // Prepare the note data
    const noteId = noteIdInput.value; // If editing, this will have a value
    const noteData = {
        title: titleInput.value,
        description: descriptionInput.value,
        status: "pending",
    };
    if (!noteId) {
        // If no noteId, we are adding a new note
        const savedNote = await addNote(noteData);
        displayNote(savedNote); // Display new note in the UI
    } else {
        // If noteId exists, we are editing an existing note
        await editNote(noteId, noteData); // Edit note in Firebase and IndexedDB
        loadNotes(); // Refresh note list to show updated data
    }
    // Reset the button text and close the form
    formActionButton.textContent = "Add";
    closeForm();
});

// Open Edit Form with Existing Note Data
function openEditForm(id, title, description) {
    const titleInput = document.querySelector("#title");
    const descriptionInput = document.querySelector("#description");
    const noteIdInput = document.querySelector("#note-id");
    const formActionButton = document.querySelector("#form-action-btn");

    // Fill in the form with existing note data
    titleInput.value = title;
    descriptionInput.value = description;
    noteIdInput.value = id; // Set noteId for the edit operation
    formActionButton.textContent = "Edit"; // Change the button text to "Edit"

    M.updateTextFields(); // Materialize CSS form update

    // Open the side form
    const forms = document.querySelector(".side-form");
    const instance = M.Sidenav.getInstance(forms);
    instance.open();
}

// Helper function to reset the form after use
function closeForm() {
    const titleInput = document.querySelector("#title");
    const descriptionInput = document.querySelector("#description");
    const noteIdInput = document.querySelector("#note-id");
    const formActionButton = document.querySelector("#form-action-btn");
    titleInput.value = "";
    descriptionInput.value = "";
    noteIdInput.value = "";
    formActionButton.textContent = "Add";
    const forms = document.querySelector(".side-form");
    const instance = M.Sidenav.getInstance(forms);
    instance.close();
}

// Check storage usage and display warnings
async function checkStorageUsage() {
    if (navigator.storage && navigator.storage.estimate) {
        const { usage, quota } = await navigator.storage.estimate();
        const usageInMB = (usage / (1024 * 1024)).toFixed(2);
        const quotaInMB = (quota / (1024 * 1024)).toFixed(2);
        console.log(`Storage used: ${usageInMB} MB of ${quotaInMB} MB`);

        const storageInfo = document.querySelector("#storage-info");
        if (storageInfo) {
            storageInfo.textContent = `Storage used: ${usageInMB} MB of ${quotaInMB} MB`;
        }

        const storageWarning = document.querySelector("#storage-warning");
        if (usage / quota > STORAGE_THRESHOLD) {
            if (storageWarning) {
                storageWarning.textContent = "Warning: Running low on storage space.";
                storageWarning.style.display = "block";
            }
        } else if (storageWarning) {
            storageWarning.textContent = "";
            storageWarning.style.display = "none";
        }
    }
}

// Request persistent storage
async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        const isPersistent = await navigator.storage.persist();
        console.log(`Persistent storage granted: ${isPersistent}`);

        const storageMessage = document.querySelector("#persistent-storage-info");
        if (storageMessage) {
            storageMessage.textContent = isPersistent
                ? "Persistent storage granted!"
                : "Data might be cleared under storage pressure.";
            storageMessage.classList.toggle("green-text", isPersistent);
            storageMessage.classList.toggle("red-text", !isPersistent);
        }
    }
}

// Event listener to detect online status and sync
window.addEventListener("online", syncNotes);
window.addEventListener("online", loadNotes);
