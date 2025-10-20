export const elements = {
    // Main form elements
    addProjectForm: document.getElementById('add-project-form'),
    newProjectName: document.getElementById('new-project-name'),
    addResourceForm: document.getElementById('add-resource-form'),
    
    // Resource form toggles and inputs
    toggleUrlBtn: document.getElementById('toggle-url-btn'),
    toggleFileBtn: document.getElementById('toggle-file-btn'),
    urlInputContainer: document.getElementById('url-input-container'),
    fileInputContainer: document.getElementById('file-input-container'),
    resourceUrl: document.getElementById('resource-url'),
    resourceFile: document.getElementById('resource-file'),
    fileDropArea: document.getElementById('file-drop-area'),
    fileNameDisplay: document.getElementById('file-name-display'),
    resourceNotes: document.getElementById('resource-notes'),
    projectSelect: document.getElementById('project-select'),

    // NEW: Tag input elements
    resourceTagsContainer: document.getElementById('resource-tags-container'),
    resourceTagsInput: document.getElementById('resource-tags-input'),
    
    // Display areas
    projectList: document.getElementById('project-list'),
    resourceGrid: document.getElementById('resource-grid'),
    emptyStateSearch: document.getElementById('empty-state-search'),
    activeFilterContainer: document.getElementById('active-filter-container'),
    activeFilterPill: document.getElementById('active-filter-pill'),

    // Search
    searchInput: document.getElementById('search-input'),

    // Modals
    editResourceModal: document.getElementById('edit-resource-modal'),
    editResourceForm: document.getElementById('edit-resource-form'),
    editResourceId: document.getElementById('edit-resource-id'),
    editUrlContainer: document.getElementById('edit-url-container'),
    editFileInfo: document.getElementById('edit-file-info'),
    editFileName: document.getElementById('edit-file-name'),
    editResourceUrl: document.getElementById('edit-resource-url'),
    editResourceNotes: document.getElementById('edit-resource-notes'),
    editResourceTagsContainer: document.getElementById('edit-resource-tags-container'),
    editResourceTagsInput: document.getElementById('edit-resource-tags-input'),
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
    mainContent: document.getElementById('main-content'),
    profilePage: document.getElementById('profile-page'),
    mainBackground: document.getElementById('main-background'),
    profileBackground: document.getElementById('profile-background'),
    exportButton: document.getElementById('export-button'),
    importButton: document.getElementById('import-button'),
    importFileInput: document.getElementById('import-file-input'),
};

export function renderProjects(projects, activeProjectId) {
    elements.projectList.innerHTML = '';
    elements.projectSelect.innerHTML = '';
    
    projects.forEach(project => {
        const li = document.createElement('li');
        li.className = `project-item ${project.id === activeProjectId ? 'active' : ''}`;
        li.dataset.id = project.id;
        li.innerHTML = `
            <span class="project-name">${project.name}</span>
            <div class="project-actions">
                <button class="icon-btn edit-project-btn" data-id="${project.id}" aria-label="Edit Project"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></button>
                <button class="icon-btn delete-project-btn" data-id="${project.id}" aria-label="Delete Project"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>
            </div>
        `;
        elements.projectList.appendChild(li);

        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        elements.projectSelect.appendChild(option);
    });
}

function showEmptyState(type) {
    elements.emptyStateSearch.classList.add('hidden');
    elements.emptyStateSearch.classList.remove('flex', 'flex-col', 'items-center', 'justify-center');

    if (type === 'search') {
        elements.emptyStateSearch.classList.remove('hidden');
        elements.emptyStateSearch.classList.add('flex', 'flex-col', 'items-center', 'justify-center');
    }
}

function getFileIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>`;
}

export function renderResources(filteredResources, activeTagFilter) {
    elements.resourceGrid.innerHTML = '';
    showEmptyState(null); 

    if (elements.activeFilterPill.parentElement) {
        if (activeTagFilter) {
            elements.activeFilterContainer.classList.remove('hidden');
            elements.activeFilterContainer.classList.add('flex');
            elements.activeFilterPill.textContent = activeTagFilter;
        } else {
            elements.activeFilterContainer.classList.add('hidden');
            elements.activeFilterContainer.classList.remove('flex');
        }
    }

    if (filteredResources.length === 0) {
        showEmptyState('search');
    } else {
        filteredResources.forEach(resource => {
            const card = document.createElement('div');
            card.className = 'resource-card';
            card.dataset.id = resource.id;

            const tagsHTML = resource.tags.map(tag => 
                `<span class="tag ${tag === activeTagFilter ? 'active-filter' : ''}">${tag}</span>`
            ).join('');
            
            let resourceContentHTML;

            if (resource.type === 'file') {
                resourceContentHTML = `<div class="file-card-content mb-2">${getFileIcon()}<span class="font-semibold text-sky-400" title="${resource.file.name}">${resource.file.name}</span></div>`;
            } else {
                resourceContentHTML = `<a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="font-semibold text-sky-400 hover:text-sky-300 break-words mb-2">${resource.url}</a>`;
            }

            card.innerHTML = `
                <div class="p-4 flex flex-col h-full">
                    ${resourceContentHTML}
                    <p class="text-slate-400 flex-grow mb-3">${resource.notes || 'No notes provided.'}</p>
                    <div class="flex flex-wrap gap-2">${tagsHTML}</div>
                </div>
                <div class="card-actions">
                     <button class="icon-btn edit-resource-btn" data-id="${resource.id}" aria-label="Edit Resource"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></button>
                     ${resource.type === 'file' ? `<button class="icon-btn download-resource-btn" data-id="${resource.id}" aria-label="Download File"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg></button>` : ''}
                     <button class="icon-btn delete-resource-btn" data-id="${resource.id}" aria-label="Delete Resource"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>
                </div>
            `;
            elements.resourceGrid.appendChild(card);
        });
    }
}

export function renderTagPills(container, tags) {
    // Clear existing pills except for the input
    const input = container.querySelector('.tag-input');
    container.innerHTML = ''; 
    tags.forEach(tag => {
        const pill = document.createElement('span');
        pill.className = 'tag-pill';
        pill.textContent = tag;
        const removeBtn = document.createElement('span');
        removeBtn.className = 'tag-pill-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.dataset.tag = tag;
        pill.appendChild(removeBtn);
        container.appendChild(pill);
    });
    // Add the input back at the end
    container.appendChild(input);
    input.focus();
}

export function showNotification(message, isError = true) {
    elements.notification.textContent = message;
    elements.notification.classList.remove('bg-red-600/90', 'border-red-500/50', 'bg-green-600/90', 'border-green-500/50');
    if (isError) {
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
