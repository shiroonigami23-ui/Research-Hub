import { elements, renderProjects, renderResources, showNotification } from './dom.js';
import { saveFile, getFile, deleteFile } from './db.js';

let state = {
    projects: [],
    resources: [],
    activeProjectId: null,
    searchQuery: '',
    currentView: 'main', 
    activeResourceType: 'url',
    // NEW: To handle tag filtering
    activeTagFilter: null,
};

function saveState() {
    const stateToSave = { ...state };
    localStorage.setItem('researchHubState', JSON.stringify(stateToSave));
}

export function loadInitialState() {
    const savedState = localStorage.getItem('researchHubState');
    if (savedState) {
        state = JSON.parse(savedState);
        state.activeResourceType = 'url';
        // Ensure activeTagFilter is reset on load
        state.activeTagFilter = null; 
    } else {
        const generalProject = { id: Date.now().toString(), name: 'General' };
        state.projects.push(generalProject);
        state.activeProjectId = generalProject.id;
    }
    state.currentView = 'main';
    
    renderAll();
}

function getFilteredResources() {
    const { resources, activeProjectId, searchQuery, activeTagFilter } = state;
    let filtered = resources;

    if (activeProjectId) {
        filtered = filtered.filter(r => r.projectId === activeProjectId);
    }

    if (activeTagFilter) {
        filtered = filtered.filter(r => r.tags.includes(activeTagFilter));
    }

    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(r => 
            (r.notes && r.notes.toLowerCase().includes(lowerCaseQuery)) ||
            (r.url && r.url.toLowerCase().includes(lowerCaseQuery)) ||
            (r.file && r.file.name.toLowerCase().includes(lowerCaseQuery)) ||
            (r.tags && r.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
        );
    }
    return filtered;
}

// --- UPDATED FUNCTION ---
function renderAll() {
    // Get all the state properties we need
    const { projects, activeProjectId, activeTagFilter, searchQuery, resources } = state;
    
    renderProjects(projects, activeProjectId);
    
    const filteredResources = getFilteredResources();
    
    // NEW: Check how many resources are in this project *before* searching
    const totalProjectResources = resources.filter(r => r.projectId === activeProjectId).length;
    
    // Pass the new information to renderResources
    renderResources(filteredResources, activeTagFilter, searchQuery, totalProjectResources);
}
// --- END OF UPDATED FUNCTION ---

export function switchView(viewName) {
    state.currentView = viewName;
    
    if (viewName === 'profile') {
        elements.mainContent.classList.add('is-hidden');
        elements.searchContainer.classList.add('is-hidden'); // This now works!
        elements.profilePage.classList.remove('is-hidden');
        elements.mainBackground.classList.add('is-hidden');
        elements.profileBackground.classList.remove('is-hidden');
    } else {
        elements.mainContent.classList.remove('is-hidden');
        elements.searchContainer.classList.remove('is-hidden');
        elements.profilePage.classList.add('is-hidden');
        elements.mainBackground.classList.remove('is-hidden');
        elements.profileBackground.classList.add('is-hidden');
    }
}

export function addProject(name) {
    if (!name.trim()) {
        showNotification('Project name cannot be empty.');
        return;
    }
    state.projects.push({ id: Date.now().toString(), name: name.trim() });
    saveState();
    renderProjects(state.projects, state.activeProjectId);
}

export async function addResource(data) {
    const { notes, tags, projectId } = data; // tags is now an array
    const newId = Date.now().toString();
    let newResource;

    if (state.activeResourceType === 'file' && data.file) {
        try {
            await saveFile(newId, data.file);
            newResource = { id: newId, type: 'file', file: { name: data.file.name, size: data.file.size, type: data.file.type }, notes, tags, projectId };
        } catch (error) {
            showNotification('Failed to save file.');
            return;
        }
    } else if (state.activeResourceType === 'url' && data.url) {
        newResource = { id: newId, type: 'url', url: data.url, notes, tags, projectId };
    } else {
        showNotification('Please provide a URL or a file.');
        return;
    }

    state.resources.push(newResource);
    saveState();
    renderAll();
    showNotification('Resource added successfully!', false);
}

export function deleteProject(projectId) {
    if (state.projects.length <= 1) {
        showNotification("Cannot delete the last project.");
        return;
    }
    const resourcesInProject = state.resources.filter(r => r.projectId === projectId);
    if (resourcesInProject.length > 0) {
        showNotification("Cannot delete a project that contains resources.");
        return;
    }
    state.projects = state.projects.filter(p => p.id !== projectId);
    if (state.activeProjectId === projectId) {
        state.activeProjectId = state.projects[0].id;
    }
    saveState();
    renderAll();
}

export async function deleteResource(resourceId) {
    const resource = state.resources.find(r => r.id === resourceId);
    if (resource && resource.type === 'file') {
        try {
            await deleteFile(resourceId);
        } catch (error) {
            showNotification('Could not delete file from storage.');
        }
    }
    state.resources = state.resources.filter(r => r.id !== resourceId);
    saveState();
    renderAll();
}

export function updateProject(projectId, newName) {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
        project.name = newName.trim();
        saveState();
        renderAll();
    }
}

export function updateResource(resourceId, newUrl, newNotes, newTags) {
    const resource = state.resources.find(r => r.id === resourceId);
    if (resource) {
        if (resource.type === 'url') {
            resource.url = newUrl;
        }
        resource.notes = newNotes;
        resource.tags = newTags; // It's now an array
        saveState();
        renderAll();
    }
}

export function setActiveProject(projectId) {
    state.activeProjectId = projectId;
    // Clear filters when switching projects for better UX
    state.searchQuery = '';
    elements.searchInput.value = '';
    state.activeTagFilter = null;
    renderAll();
}

export function setSearchQuery(query) {
    state.searchQuery = query;
    // When searching, clear tag filter and vice-versa
    state.activeTagFilter = null;
    renderAll();
}

export function setTagFilter(tagName) {
    // If the same tag is clicked, clear the filter. Otherwise, set it.
    if (state.activeTagFilter === tagName) {
        state.activeTagFilter = null;
    } else {
        state.activeTagFilter = tagName;
        // Clear search query when a tag is selected
        state.searchQuery = '';
        elements.searchInput.value = '';
    }
    renderAll();
}

export function setActiveResourceType(type) {
    state.activeResourceType = type;
    elements.resourceFile.value = null; 
    elements.fileNameDisplay.textContent = '';
}

export async function downloadResourceFile(resourceId) {
    try {
        const file = await getFile(resourceId);
        const resource = state.resources.find(r => r.id === resourceId);
        if (file && resource) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.download = resource.file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(link.href), 100);
        } else {
            showNotification('Could not find file to download.');
        }
    } catch (error) {
        showNotification('Error retrieving file for download.');
        console.error(error);
    }
}

export function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'research_hub_backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showNotification("Metadata exported successfully!", false);
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
                if (newState.resources.some(r => r.type === 'file')) {
                    showNotification("Warning: File content is not included in JSON backups.", true);
                }
                state = newState;
                state.activeProjectId = state.projects[0]?.id || null;
                state.searchQuery = '';
                state.currentView = 'main';
                saveState();
                loadInitialState();
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
    reader.readText(file);
}

export const getState = () => state;