document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM ELEMENT REFERENCES ---
    const projectList = document.getElementById('project-list');
    const addProjectForm = document.getElementById('add-project-form');
    const newProjectNameInput = document.getElementById('new-project-name');
    const resourceGrid = document.getElementById('resource-grid');
    const addResourceForm = document.getElementById('add-resource-form');
    const projectSelect = document.getElementById('project-select');
    const emptyState = document.getElementById('empty-state');
    const notification = document.getElementById('notification');

    // --- MODAL ELEMENTS ---
    const editResourceModal = document.getElementById('edit-resource-modal');
    const editResourceForm = document.getElementById('edit-resource-form');
    const cancelEditResourceBtn = document.getElementById('cancel-edit-resource');
    
    const editProjectModal = document.getElementById('edit-project-modal');
    const editProjectForm = document.getElementById('edit-project-form');
    const cancelEditProjectBtn = document.getElementById('cancel-edit-project');
    
    // --- STATE MANAGEMENT ---
    let state = {
        projects: [],
        resources: [],
        activeFilter: 'all'
    };

    function loadState() {
        const savedState = localStorage.getItem('researchHubState');
        if (savedState) {
            state = JSON.parse(savedState);
        } else {
            state = {
                projects: [{ id: 1, name: 'General' }],
                resources: [],
                activeFilter: 1 // Start by filtering the 'General' project
            };
        }
    }

    function saveState() {
        localStorage.setItem('researchHubState', JSON.stringify(state));
    }

    // --- RENDERING FUNCTIONS ---
    function renderProjects() {
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
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                    </button>
                    <button data-id="${project.id}" class="delete-project-btn p-1 text-slate-400 ${isActive ? 'text-white' : ''} hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

    function renderResources() {
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
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                            </button>
                            <button data-id="${resource.id}" class="delete-resource-btn p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
    
    // --- NOTIFICATION ---
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.remove('opacity-0');
        setTimeout(() => {
            notification.classList.add('opacity-0');
        }, 3000);
    }
    
    // --- EVENT HANDLERS ---
    addProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = newProjectNameInput.value.trim();
        if (name) {
            const newProject = { id: Date.now(), name: name };
            state.projects.push(newProject);
            newProjectNameInput.value = '';
            saveState();
            renderProjects();
        }
    });

    addResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newResource = {
            id: Date.now(),
            url: document.getElementById('resource-url').value.trim(),
            notes: document.getElementById('resource-notes').value.trim(),
            tags: document.getElementById('resource-tags').value.trim(),
            projectId: parseInt(projectSelect.value)
        };
        if (!newResource.url || !newResource.projectId) return;
        state.resources.push(newResource);
        addResourceForm.reset();
        saveState();
        renderResources();
    });

    // --- EVENT DELEGATION for projects (filter, edit, delete) ---
    projectList.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-project-btn');
        const deleteBtn = e.target.closest('.delete-project-btn');
        const filterBtn = e.target.closest('button:not(.edit-project-btn):not(.delete-project-btn)');

        if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            openEditProjectModal(id);
        } else if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id);
            deleteProject(id);
        } else if (filterBtn) {
            const id = filterBtn.dataset.id;
            state.activeFilter = (id === 'all') ? 'all' : parseInt(id);
            renderProjects();
            renderResources();
        }
    });

    // --- EVENT DELEGATION for resources (edit, delete) ---
    resourceGrid.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-resource-btn');
        const deleteBtn = e.target.closest('.delete-resource-btn');
        
        if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            openEditResourceModal(id);
        } else if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id);
            if (confirm('Are you sure you want to delete this resource?')) {
                state.resources = state.resources.filter(r => r.id !== id);
                saveState();
                renderResources();
            }
        }
    });

    // --- MODAL LOGIC ---
    function openEditResourceModal(id) {
        const resource = state.resources.find(r => r.id === id);
        if (resource) {
            document.getElementById('edit-resource-id').value = resource.id;
            document.getElementById('edit-resource-url').value = resource.url;
            document.getElementById('edit-resource-notes').value = resource.notes;
            document.getElementById('edit-resource-tags').value = resource.tags;
            editResourceModal.classList.remove('hidden');
        }
    }

    function closeEditResourceModal() {
        editResourceModal.classList.add('hidden');
    }

    function openEditProjectModal(id) {
        const project = state.projects.find(p => p.id === id);
        if (project) {
            document.getElementById('edit-project-id').value = project.id;
            document.getElementById('edit-project-name').value = project.name;
            editProjectModal.classList.remove('hidden');
        }
    }

    function closeEditProjectModal() {
        editProjectModal.classList.add('hidden');
    }

    // --- EDIT & DELETE LOGIC ---
    editResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-resource-id').value);
        const resource = state.resources.find(r => r.id === id);
        if (resource) {
            resource.url = document.getElementById('edit-resource-url').value.trim();
            resource.notes = document.getElementById('edit-resource-notes').value.trim();
            resource.tags = document.getElementById('edit-resource-tags').value.trim();
            saveState();
            renderResources();
            closeEditResourceModal();
        }
    });
    
    editProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-project-id').value);
        const project = state.projects.find(p => p.id === id);
        const newName = document.getElementById('edit-project-name').value.trim();
        if (project && newName) {
            project.name = newName;
            saveState();
            renderProjects();
            renderResources(); // In case project names on cards need updating
            closeEditProjectModal();
        }
    });

    function deleteProject(id) {
        // Safety check: Don't delete the 'General' project
        if (id === 1) {
            showNotification("Cannot delete the default 'General' project.");
            return;
        }

        // Safety check: Don't delete a project that has resources in it.
        const hasResources = state.resources.some(r => r.projectId === id);
        if (hasResources) {
            showNotification("Cannot delete a project that contains resources. Please move or delete the resources first.");
            return;
        }
        
        if (confirm(`Are you sure you want to delete the project named "${state.projects.find(p => p.id === id).name}"?`)) {
            state.projects = state.projects.filter(p => p.id !== id);
            // If the deleted project was the active filter, switch to 'all'.
            if (state.activeFilter === id) {
                state.activeFilter = 'all';
            }
            saveState();
            renderProjects();
            renderResources();
        }
    }

    // Cancel buttons and clicking outside the modal
    cancelEditResourceBtn.addEventListener('click', closeEditResourceModal);
    editResourceModal.addEventListener('click', (e) => e.target === editResourceModal && closeEditResourceModal());
    cancelEditProjectBtn.addEventListener('click', closeEditProjectModal);
    editProjectModal.addEventListener('click', (e) => e.target === editProjectModal && closeEditProjectModal());

    // --- INITIALIZATION ---
    function init() {
        loadState();
        renderProjects();
        renderResources();
    }

    init();
});
