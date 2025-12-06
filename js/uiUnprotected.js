import { openDB } from "https://unpkg.com/idb?module";

import { addNoteToFirebase } from "./firebaseDB.js";

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