import { loadState } from './state.js';
import { renderAll } from './ui.js';
import { initializeEventListeners } from './events.js';

// The main function to initialize the application
function init() {
    loadState();
    renderAll();
    initializeEventListeners();
}

// Wait for the DOM to be fully loaded before running the app
document.addEventListener('DOMContentLoaded', init);
