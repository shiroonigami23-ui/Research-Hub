import { getState } from './state.js';

export const elements = {
    // Main form elements
    addProjectForm: document.getElementById('add-project-form'),
    newProjectName: document.getElementById('new-project-name'),
    addResourceForm: document.getElementById('add-resource-form'),
    resourceUrl: document.getElementById('resource-url'),
    resourceNotes: document.getElementById('resource-notes'),
    resourceTags: document.getElementById('resource-tags'),
    projectSelect: document.getElementById('project-select'),
    
    // Display areas
    projectList: document.getElementById('project-list'),
    resourceGrid: document.getElementById('resource-grid'),
    emptyState: document.getElementById('empty-state'),

    // Search
    searchInput: document.getElementById('search-input'),

    // Modals
    editResourceModal: document.getElementById('edit-resource-modal'),
    editResourceForm: document.getElementById('edit-resource-form'),
    editResourceId: document.getElementById('edit-resource-id'),
    editResourceUrl: document.getElementById('edit-resource-url'),
    editResourceNotes: document.getElementById('edit-resource-notes'),
    editResourceTags: document.getElementById('edit-resource-tags'),
    cancelEditResource: document.getElementById('cancel-edit-resource'),

    editProjectModal: document.getElementById('edit-project-modal'),
    editProjectForm: document.getElementById('edit-project-form'),
    editProjectId: document.getElementById('edit-project-id'),
    editProjectName: document.getElementById('edit-project-name'),
    cancelEditProject: document.getElementById('cancel-edit-project'),

    // Notifications
    notification: document.getElementById('notification'),

    // Page Navigation & Data
    profileButton: document.getElementById('profile-button'),
    backButton: document.getElementById('back-button'),
    mainContent: document.getElementById('main-content'),
    profilePage: document.getElementById('profile-page'),
    mainBackground: document.getElementById('main-background'),
    profileBackground: document.getElementById('profile-background'),
    exportButton: document.getElementById('export-button'),
    importButton: document.getElementById('import-button'),
    importFileInput: document.getElementById('import-file-input'),
};

export function renderProjects() {
    const { projects, activeProjectId } = getState();
    elements.projectList.innerHTML = '';
    elements.projectSelect.innerHTML = '';

    projects.forEach(project => {
        // Populate the project list in the sidebar
        const projectItem = document.createElement('li');
        projectItem.className = `project-item ${project.id === activeProjectId ? 'active' : ''}`;
        projectItem.dataset.id = project.id;
        projectItem.innerHTML = `
            <span class="project-name">${project.name}</span>
            <div class="project-actions">
                ${project.id !== 'general' ? `
                    <button class="edit-project-btn" title="Rename project">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                    </button>
                    <button class="delete-project-btn" title="Delete project">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                ` : ''}
            </div>
        `;
        elements.projectList.appendChild(projectItem);

        // Populate the dropdown in the "Add Resource" form
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        if (project.id === activeProjectId) {
            option.selected = true;
        }
        elements.projectSelect.appendChild(option);
    });
}

export function renderResources() {
    const { resources, activeProjectId, searchQuery } = getState();
    elements.resourceGrid.innerHTML = '';

    const filteredResources = resources
        .filter(resource => activeProjectId === null || resource.projectId === activeProjectId)
        .filter(resource => {
            const query = searchQuery.toLowerCase();
            return resource.url.toLowerCase().includes(query) ||
                   resource.notes.toLowerCase().includes(query) ||
                   resource.tags.some(tag => tag.toLowerCase().includes(query));
        });

    if (filteredResources.length === 0) {
        elements.emptyState.classList.remove('hidden');
    } else {
        elements.emptyState.classList.add('hidden');
    }

    filteredResources.forEach(resource => {
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.dataset.id = resource.id;
        card.innerHTML = `
            <div class="card-content">
                <h3 class="card-title">${resource.notes.substring(0, 50) || 'No Title'}...</h3>
                <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="card-link">${new URL(resource.url).hostname}</a>
                <p class="card-notes">${resource.notes.substring(0, 100)}...</p>
                <div class="card-tags">
                    ${resource.tags.map(tag => `<span>${tag}</span>`).join('')}
                </div>
            </div>
            <div class="card-actions">
                <button class="edit-resource-btn" title="Edit resource">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                </button>
                <button class="delete-resource-btn" title="Delete resource">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
            </div>
        `;
        elements.resourceGrid.appendChild(card);
    });
}

export function showNotification(message, type = 'error') {
    elements.notification.textContent = message;
    elements.notification.className = `fixed bottom-5 right-5 text-white py-2 px-5 rounded-lg shadow-lg opacity-0 transition-opacity duration-300 border backdrop-blur-sm`;
    if (type === 'error') {
        elements.notification.classList.add('bg-red-600/90', 'border-red-500/50');
    } else {
        elements.notification.classList.add('bg-green-600/90', 'border-green-500/50');
    }

    elements.notification.classList.remove('opacity-0');
    setTimeout(() => {
        elements.notification.classList.add('opacity-0');
    }, 3000);
}

export function openModal(modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function closeModal(modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

export function closeAllModals() {
    closeModal(elements.editResourceModal);
    closeModal(elements.editProjectModal);
}
