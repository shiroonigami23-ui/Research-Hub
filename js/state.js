// Default state structure
let state = {
    projects: [{ id: 1, name: 'General' }],
    resources: [],
    activeFilter: 1,
};

// Function to load state from localStorage
export function loadState() {
    const savedState = localStorage.getItem('researchHubState');
    if (savedState) {
        state = JSON.parse(savedState);
    }
}

// Function to save the current state to localStorage
export function saveState() {
    localStorage.setItem('researchHubState', JSON.stringify(state));
}

// Function to add a new project
export function addProject(name) {
    const newProject = { id: Date.now(), name };
    state.projects.push(newProject);
    saveState();
}

// Function to update an existing project
export function updateProject(id, newName) {
    const project = state.projects.find(p => p.id === id);
    if (project) {
        project.name = newName;
        saveState();
    }
}

// Function to delete a project (with safety checks)
export function deleteProject(id) {
    if (id === 1) return { success: false, message: "Cannot delete the default 'General' project." };
    
    const hasResources = state.resources.some(r => r.projectId === id);
    if (hasResources) return { success: false, message: "Cannot delete a project that contains resources. Please move or delete them first." };

    state.projects = state.projects.filter(p => p.id !== id);
    if (state.activeFilter === id) {
        state.activeFilter = 'all';
    }
    saveState();
    return { success: true };
}

// Function to add a new resource
export function addResource(resourceData) {
    const newResource = { id: Date.now(), ...resourceData };
    state.resources.push(newResource);
    saveState();
}

// Function to update an existing resource
export function updateResource(id, updatedData) {
    const resource = state.resources.find(r => r.id === id);
    if (resource) {
        Object.assign(resource, updatedData);
        saveState();
    }
}

// Function to delete a resource
export function deleteResource(id) {
    state.resources = state.resources.filter(r => r.id !== id);
    saveState();
}

// Function to change the active project filter
export function setActiveFilter(id) {
    state.activeFilter = (id === 'all') ? 'all' : parseInt(id);
    // No need to save state here, it's a transient UI state
}

// Export the state object itself so other modules can read it
export default state;
