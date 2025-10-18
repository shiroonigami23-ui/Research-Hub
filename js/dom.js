import { state } from './state.js';

// --- DOM ELEMENT REFERENCES ---
export const projectList = document.getElementById('project-list');
export const addProjectForm = document.getElementById('add-project-form');
export const newProjectNameInput = document.getElementById('new-project-name');
export const resourceGrid = document.getElementById('resource-grid');
export const addResourceForm = document.getElementById('add-resource-form');
export const projectSelect = document.getElementById('project-select');
export const emptyState = document.getElementById('empty-state');
export const notification = document.getElementById('notification');
// Modals
export const editResourceModal = document.getElementById('edit-resource-modal');
export const editResourceForm = document.getElementById('edit-resource-form');
export const cancelEditResourceBtn = document.getElementById('cancel-edit-resource');
export const editProjectModal = document.getElementById('edit-project-modal');
export const editProjectForm = document.getElementById('edit-project-form');
export const cancelEditProjectBtn = document.getElementById('cancel-edit-project');


// --- RENDERING FUNCTIONS ---
export function renderProjects() {
    projectList.innerHTML = '';
    projectSelect.innerHTML = '';

    const allFilterItem = document.createElement('li');
    allFilterItem.innerHTML = `<button data-id="all" class="w-full text-left px-3 py-2 rounded-md ${state.activeFilter === 'all' ? 'bg-sky-600 text-white' : 'hover:bg-slate-700'} transition-colors">All Resources</button>`;
    projectList.appendChild(allFilterItem);
    
    state.projects.forEach(project => {
        const isActive = state.activeFilter === project.id;
        const listItem = document.createElement('li');
        listItem.className = `group flex items-center justify-between rounded-md ${isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-700'}`;
        
        listItem.innerHTML = `
            <button data-id="${project.id}" class="flex-grow text-left px-3 py-2 transition-colors">${project.name}</button>
            <div class="flex items-center pr-2">
                <button data-id="${project.id}" class="edit-project-btn p-1 text-slate-400 ${isActive ? 'text-white' : ''} hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="pointer-events: none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                </button>
                <button data-id="${project.id}" class="delete-project-btn p-1 text-slate-400 ${isActive ? 'text-white' : ''} hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="pointer-events: none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        `;
        projectList.appendChild(listItem);
        
        const optionItem = document.createElement('option');
        optionItem.value = project.id;
        optionItem.textContent = project.name;
        projectSelect.appendChild(optionItem);
    });
}

export function renderResources() {
    resourceGrid.innerHTML = '';
    const filteredResources = state.activeFilter === 'all' ? state.resources : state.resources.filter(r => r.projectId === state.activeFilter);

    emptyState.classList.toggle('hidden', filteredResources.length > 0);

    filteredResources.forEach(resource => {
        const projectName = state.projects.find(p => p.id === resource.projectId)?.name || 'Unassigned';
        const tagsHTML = resource.tags.split(',').map(tag => tag.trim() ? `<span class="bg-slate-600 text-sky-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">${tag.trim()}</span>` : '').join('');

        const card = document.createElement('div');
        card.className = 'bg-slate-800 rounded-lg p-5 shadow-lg flex flex-col card-animate group';
        card.innerHTML = `
            <div class="flex-grow">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs font-semibold uppercase tracking-wider text-sky-400">${projectName}</span>
                    <div class="flex items-center">
                        <button data-id="${resource.id}" class="edit-resource-btn p-1 text-slate-400 hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="pointer-events: none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                        </button>
                        <button data-id="${resource.id}" class="delete-resource-btn p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="pointer-events: none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>
                <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="text-lg font-semibold text-white hover:text-sky-400 transition-colors mt-1 mb-3 block break-all">${truncateURL(resource.url)}</a>
                <p class="text-slate-300 mb-4 whitespace-pre-wrap">${resource.notes || 'No notes for this resource.'}</p>
            </div>
            <div class="flex-shrink-0">${tagsHTML}</div>
        `;
        resourceGrid.appendChild(card);
    });
}

// --- UTILITY FUNCTIONS ---
function truncateURL(url) {
    try {
        const urlObj = new URL(url);
        let path = urlObj.pathname;
        if (path.length > 30) path = path.substring(0, 27) + '...';
        return urlObj.hostname.replace('www.', '') + path;
    } catch (e) {
        return url.length > 40 ? url.substring(0, 37) + '...' : url;
    }
}

export function showNotification(message) {
    notification.textContent = message;
    notification.classList.remove('opacity-0');
    setTimeout(() => {
        notification.classList.add('opacity-0');
    }, 3000);
}
