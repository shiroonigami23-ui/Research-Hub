// --- IndexedDB for File Storage ---

const DB_NAME = 'research-hub-files';
const DB_VERSION = 1;
const STORE_NAME = 'files';

let db;

// Function to initialize the database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.errorCode);
            reject('Error opening database');
        };
    });
}

// Function to save a file to the database
export async function saveFile(id, file) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id: id, file: file });

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
            console.error('Error saving file:', event.target.error);
            reject('Could not save file.');
        };
    });
}

// Function to retrieve a file from the database
export async function getFile(id) {
    if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = (event) => {
            if (event.target.result) {
                resolve(event.target.result.file);
            } else {
                reject('File not found.');
            }
        };
        request.onerror = (event) => {
             console.error('Error getting file:', event.target.error);
            reject('Could not retrieve file.');
        };
    });
}

// Function to delete a file from the database
export async function deleteFile(id) {
     if (!db) await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => {
            console.error('Error deleting file:', event.target.error);
            reject('Could not delete file.');
        };
    });
}

// Initialize the DB on script load
initDB().catch(console.error);
