import { elements, renderProjects, renderResources } from './dom.js';
import { addEventListeners } from './events.js';
import { loadInitialState, switchView } from './state.js';

// Initialize the application
function init() {
    loadInitialState();
    addEventListeners();
    renderProjects();
    renderResources();

    // Set initial view to main content
    switchView('main');
}

// Start the app once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
