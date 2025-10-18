// Centralized state for the entire application
export let state = {
    projects: [],
    resources: [],
    activeFilter: 'all',
    searchQuery: '' // New property to hold the search term
};

// Load state from localStorage or set default state
export function loadState() {
    const savedState = localStorage.getItem('researchHubState');
    if (savedState) {
        // Ensure new properties are added to the state if they don't exist in localStorage
        const loadedState = JSON.parse(savedState);
        Object.assign(state, loadedState);
        state.searchQuery = ''; // Always reset search on load
    } else {
        // If no saved state, create a default 'General' project
        state.projects = [{ id: 1, name: 'General' }];
        state.resources = [];
        state.activeFilter = 1; // Filter by the 'General' project by default
    }
}

// Save the current state to localStorage
export function saveState() {
    // Create a version of state to save that doesn't include transient properties like searchQuery
    const stateToSave = { ...state, searchQuery: undefined };
    localStorage.setItem('researchHubState', JSON.stringify(stateToSave));
}

// --- STATE MUTATION FUNCTIONS ---
// (addProject, addResource, updateResource, updateProject, deleteResource, deleteProject functions are unchanged)

export function addProject(name) {
    const newProject = { id: Date.now(), name: name.trim() };
    state.projects.push(newProject);
    saveState();
}

export function addResource(url, notes, tags, projectId) {
    const newResource = {
        id: Date.now(),
        url: url.trim(),
        notes: notes.trim(),
        tags: tags.trim(),
        projectId: parseInt(projectId)
    };
    state.resources.push(newResource);
    saveState();
}

export function updateResource(id, url, notes, tags) {
    const resource = state.resources.find(r => r.id === id);
    if (resource) {
        resource.url = url.trim();
        resource.notes = notes.trim();
        resource.tags = tags.trim();
        saveState();
    }
}

export function updateProject(id, newName) {
    const project = state.projects.find(p => p.id === id);
    if (project) {
        project.name = newName.trim();
        saveState();
    }
}

export function deleteResource(id) {
    state.resources = state.resources.filter(r => r.id !== id);
    saveState();
}

export function deleteProject(id) {
    state.projects = state.projects.filter(p => p.id !== id);
    if (state.activeFilter === id) {
        state.activeFilter = 'all';
    }
    saveState();
}
