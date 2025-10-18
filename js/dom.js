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
    searchContainer: document.getElementById('search-container'),

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
        // Populate the list on the left
        const li = document.createElement('li');
        li.className = `project-item ${project.id === activeProjectId ? 'active' : ''}`;
        li.dataset.id = project.id;
        li.innerHTML = `
            <span class="project-name">${project.name}</span>
            <div class="project-actions">
                <button class="edit-project-btn" data-id="${project.id}">✏️</button>
                <button class="delete-project-btn" data-id="${project.id}">🗑️</button>
            </div>
        `;
        elements.projectList.appendChild(li);

        // Populate the dropdown in the form
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        elements.projectSelect.appendChild(option);
    });
}

export function renderResources(resources) {
    elements.resourceGrid.innerHTML = '';
    if (resources.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.emptyState.classList.add('flex', 'flex-col', 'items-center', 'justify-center');
    } else {
        elements.emptyState.classList.add('hidden');
        elements.emptyState.classList.remove('flex', 'flex-col', 'items-center', 'justify-center');
        resources.forEach(resource => {
            const card = document.createElement('div');
            card.className = 'resource-card';
            card.dataset.id = resource.id;

            const tagsHTML = resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

            card.innerHTML = `
                <div class="p-4 flex flex-col h-full">
                    <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="font-semibold text-sky-400 hover:text-sky-300 break-words mb-2">${resource.url}</a>
                    <p class="text-slate-400 flex-grow mb-3">${resource.notes || 'No notes provided.'}</p>
                    <div class="flex flex-wrap gap-2">${tagsHTML}</div>
                </div>
                <div class="card-actions">
                     <button class="edit-resource-btn" data-id="${resource.id}">✏️</button>
                     <button class="delete-resource-btn" data-id="${resource.id}">🗑️</button>
                </div>
            `;
            elements.resourceGrid.appendChild(card);
        });
    }
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
