import { elements, renderProjects, renderResources, showNotification } from './dom.js';

let state = {
    projects: [],
    resources: [],
    activeProjectId: null,
    searchQuery: '',
    currentView: 'main', 
};

function saveState() {
    localStorage.setItem('researchHubState', JSON.stringify(state));
}

export function loadInitialState() {
    const savedState = localStorage.getItem('researchHubState');
    if (savedState) {
        state = JSON.parse(savedState);
    } else {
        // First time load: create a default project
        const generalProject = { id: Date.now().toString(), name: 'General' };
        state.projects.push(generalProject);
        state.activeProjectId = generalProject.id;
    }
    // Ensure currentView is set correctly on load
    state.currentView = 'main';
    
    renderAll();
}

function getFilteredResources() {
    const { resources, activeProjectId, searchQuery } = state;
    let filtered = resources;

    if (activeProjectId) {
        filtered = filtered.filter(r => r.projectId === activeProjectId);
    }

    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(r => 
            r.notes.toLowerCase().includes(lowerCaseQuery) ||
            r.url.toLowerCase().includes(lowerCaseQuery) ||
            r.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
        );
    }
    return filtered;
}

function renderAll() {
    renderProjects(state.projects, state.activeProjectId);
    renderResources(getFilteredResources());
}

export function switchView(viewName) {
    state.currentView = viewName;
    
    if (viewName === 'profile') {
        elements.mainContent.classList.add('is-hidden');
        elements.searchContainer.classList.add('is-hidden');
        elements.profilePage.classList.remove('is-hidden');
        elements.mainBackground.classList.add('is-hidden');
        elements.profileBackground.classList.remove('is-hidden');
    } else { // 'main'
        elements.mainContent.classList.remove('is-hidden');
        elements.searchContainer.classList.remove('is-hidden');
        elements.profilePage.classList.add('is-hidden');
        elements.mainBackground.classList.remove('is-hidden');
        elements.profileBackground.classList.add('is-hidden');
    }
}


// --- DATA MANIPULATION ---

export function addProject(name) {
    if (!name.trim()) {
        showNotification('Project name cannot be empty.');
        return;
    }
    state.projects.push({ id: Date.now().toString(), name: name.trim() });
    saveState();
    renderProjects(state.projects, state.activeProjectId);
}

export function addResource(url, notes, tags, projectId) {
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    state.resources.push({ 
        id: Date.now().toString(), 
        url, 
        notes, 
        tags: tagArray, 
        projectId 
    });
    saveState();
    renderResources(getFilteredResources());
}

export function deleteProject(projectId) {
    if (state.projects.length <= 1) {
        showNotification("Cannot delete the last project.");
        return;
    }
    const resourcesInProject = state.resources.filter(r => r.projectId === projectId);
    if (resourcesInProject.length > 0) {
        showNotification("Cannot delete a project with resources in it.");
        return;
    }

    state.projects = state.projects.filter(p => p.id !== projectId);
    
    if (state.activeProjectId === projectId) {
        state.activeProjectId = state.projects[0].id;
    }
    
    saveState();
    renderAll();
}

export function deleteResource(resourceId) {
    state.resources = state.resources.filter(r => r.id !== resourceId);
    saveState();
    renderResources(getFilteredResources());
}

export function updateProject(projectId, newName) {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
        project.name = newName;
        saveState();
        renderAll();
    }
}

export function updateResource(resourceId, newUrl, newNotes, newTags) {
    const resource = state.resources.find(r => r.id === resourceId);
    if (resource) {
        resource.url = newUrl;
        resource.notes = newNotes;
        resource.tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
        saveState();
        renderResources(getFilteredResources());
    }
}

export function setActiveProject(projectId) {
    state.activeProjectId = projectId;
    renderAll();
}

export function setSearchQuery(query) {
    state.searchQuery = query;
    renderResources(getFilteredResources());
}

export function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'research_hub_backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showNotification("Data exported successfully!", false);
}

export function importData(file) {
    if (!file) {
        showNotification("No file selected for import.");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const newState = JSON.parse(event.target.result);
            if (newState.projects && newState.resources) {
                state = newState;
                state.activeProjectId = state.projects[0]?.id || null;
                state.searchQuery = '';
                state.currentView = 'main';
                saveState();
                loadInitialState(); // Reload and re-render everything
                switchView('main');
                showNotification("Data imported successfully!", false);
            } else {
                showNotification("Invalid data file format.");
            }
        } catch (e) {
            showNotification("Error reading or parsing the file.");
            console.error(e);
        }
    };
    reader.readAsText(file);
}

export const getState = () => state;
