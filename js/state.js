import { elements, renderProjects, renderResources, showNotification } from './dom.js';

let state = {
    projects: [],
    resources: [],
    activeProjectId: null,
    searchQuery: '',
};

const DB_NAME = 'researchHubState';

function saveState() {
    localStorage.setItem(DB_NAME, JSON.stringify(state));
}

export function loadInitialState() {
    const savedState = localStorage.getItem(DB_NAME);
    if (savedState) {
        state = JSON.parse(savedState);
    } else {
        // Initialize with a default project
        const generalProject = { id: 'general', name: 'General' };
        state.projects.push(generalProject);
        state.activeProjectId = 'general';
        saveState();
    }
}

export function addProject(name) {
    if (!name.trim()) {
        showNotification('Project name cannot be empty.');
        return;
    }
    const newProject = {
        id: `proj_${new Date().getTime()}`,
        name: name.trim(),
    };
    state.projects.push(newProject);
    saveState();
}

export function addResource({ url, notes, tags, projectId }) {
    if (!url.trim() || !projectId) {
        showNotification('URL and Project are required.');
        return;
    }
    const newResource = {
        id: `res_${new Date().getTime()}`,
        projectId,
        url: url.trim(),
        notes: notes.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
    };
    state.resources.push(newResource);
    saveState();
}

export function deleteProject(projectId) {
    if (projectId === 'general') {
        showNotification('The "General" project cannot be deleted.');
        return;
    }
    // Prevent deleting a project that has resources
    if (state.resources.some(r => r.projectId === projectId)) {
        showNotification('Cannot delete project with resources. Move or delete them first.');
        return;
    }
    state.projects = state.projects.filter(p => p.id !== projectId);
    if (state.activeProjectId === projectId) {
        state.activeProjectId = 'general';
    }
    saveState();
}

export function deleteResource(resourceId) {
    state.resources = state.resources.filter(r => r.id !== resourceId);
    saveState();
}

export function updateProject({ id, name }) {
    const project = state.projects.find(p => p.id === id);
    if (project) {
        project.name = name.trim();
        saveState();
    }
}

export function updateResource({ id, url, notes, tags }) {
    const resource = state.resources.find(r => r.id === id);
    if (resource) {
        resource.url = url.trim();
        resource.notes = notes.trim();
        resource.tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        saveState();
    }
}

export function setActiveProject(projectId) {
    state.activeProjectId = projectId;
    renderProjects();
    renderResources();
}

export function setSearchQuery(query) {
    state.searchQuery = query;
    renderResources();
}

export function exportData() {
    const data = {
        projects: state.projects,
        resources: state.resources,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!', 'success');
}

export function importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (data.projects && data.resources) {
                // A simple confirmation before overwriting
                if (confirm('Are you sure you want to import this file? It will overwrite all your current data.')) {
                    state.projects = data.projects;
                    state.resources = data.resources;
                    state.activeProjectId = state.projects[0]?.id || null;
                    saveState();
                    loadInitialState();
                    renderProjects();
                    renderResources();
                    switchView('main');
                    showNotification('Data imported successfully!', 'success');
                }
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            showNotification('Error importing file. Please check the format.', 'error');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

export function switchView(viewName) {
    if (viewName === 'profile') {
        elements.mainContent.classList.add('is-hidden');
        elements.profilePage.classList.remove('is-hidden');
        elements.mainBackground.classList.add('is-hidden');
        elements.profileBackground.classList.remove('is-hidden');
    } else { // 'main'
        elements.mainContent.classList.remove('is-hidden');
        elements.profilePage.classList.add('is-hidden');
        elements.mainBackground.classList.remove('is-hidden');
        elements.profileBackground.classList.add('is-hidden');
    }
}

export const getState = () => state;
export const setState = (newState) => {
    state = { ...state, ...newState };
};
