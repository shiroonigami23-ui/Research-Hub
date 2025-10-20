import { elements, openModal, closeModal, closeAllModals } from './dom.js';
import { getState, addProject, addResource, deleteProject, deleteResource, updateProject, updateResource, setActiveProject, setSearchQuery, exportData, importData, switchView, setActiveResourceType, downloadResourceFile } from './state.js';

export function addEventListeners() {

    // --- FORM TOGGLES ---
    elements.toggleUrlBtn.addEventListener('click', () => {
        setActiveResourceType('url');
        elements.toggleUrlBtn.classList.add('active');
        elements.toggleFileBtn.classList.remove('active');
        elements.urlInputContainer.classList.remove('hidden');
        elements.fileInputContainer.classList.add('hidden');
        elements.resourceUrl.required = true;
        elements.resourceFile.required = false;
    });

    elements.toggleFileBtn.addEventListener('click', () => {
        setActiveResourceType('file');
        elements.toggleFileBtn.classList.add('active');
        elements.toggleUrlBtn.classList.remove('active');
        elements.fileInputContainer.classList.remove('hidden');
        elements.urlInputContainer.classList.add('hidden');
        elements.resourceFile.required = true;
        elements.resourceUrl.required = false;
    });

    // --- File Input & Drag/Drop ---
    elements.fileDropArea.addEventListener('click', () => {
        elements.resourceFile.click();
    });

    elements.resourceFile.addEventListener('change', () => {
        if (elements.resourceFile.files.length > 0) {
            const file = elements.resourceFile.files[0];
            elements.fileNameDisplay.textContent = file.name;
        } else {
            elements.fileNameDisplay.textContent = '';
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        elements.fileDropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        elements.fileDropArea.addEventListener(eventName, () => {
            elements.fileDropArea.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
         elements.fileDropArea.addEventListener(eventName, () => {
            elements.fileDropArea.classList.remove('dragover');
        });
    });

    elements.fileDropArea.addEventListener('drop', (e) => {
        elements.resourceFile.files = e.dataTransfer.files;
        const changeEvent = new Event('change');
        elements.resourceFile.dispatchEvent(changeEvent);
    });

    // --- FORMS ---
    elements.addProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addProject(elements.newProjectName.value);
        elements.newProjectName.value = '';
    });

    elements.addResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const { activeResourceType } = getState();
        const resourceData = {
            notes: elements.resourceNotes.value,
            tags: elements.resourceTags.value,
            projectId: elements.projectSelect.value,
        };

        if (activeResourceType === 'url') {
            resourceData.url = elements.resourceUrl.value;
        } else {
            if (elements.resourceFile.files.length > 0) {
                resourceData.file = elements.resourceFile.files[0];
            }
        }
        
        addResource(resourceData);
        elements.addResourceForm.reset();
        elements.fileNameDisplay.textContent = '';
        elements.resourceFile.value = null; // Clear file input
    });

    // --- LISTS & GRIDS (Event Delegation) ---
    elements.projectList.addEventListener('click', (e) => {
        const projectItem = e.target.closest('.project-item');
        const editBtn = e.target.closest('.edit-project-btn');
        const deleteBtn = e.target.closest('.delete-project-btn');

        if (editBtn) {
            const projectId = editBtn.dataset.id;
            const project = getState().projects.find(p => p.id === projectId);
            elements.editProjectId.value = project.id;
            elements.editProjectName.value = project.name;
            openModal(elements.editProjectModal);
            return;
        }

        if (deleteBtn) {
            const projectId = deleteBtn.dataset.id;
            if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                deleteProject(projectId);
            }
            return;
        }

        if (projectItem) {
            setActiveProject(projectItem.dataset.id);
        }
    });

    elements.resourceGrid.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-resource-btn');
        const deleteBtn = e.target.closest('.delete-resource-btn');
        const downloadBtn = e.target.closest('.download-resource-btn');
        
        if (editBtn) {
            const resourceId = editBtn.dataset.id;
            const resource = getState().resources.find(r => r.id === resourceId);
            elements.editResourceId.value = resource.id;
            
            if (resource.type === 'file') {
                elements.editUrlContainer.classList.add('hidden');
                elements.editFileInfo.classList.remove('hidden');
                elements.editFileName.textContent = resource.file.name;
                elements.editResourceUrl.required = false;
            } else {
                elements.editUrlContainer.classList.remove('hidden');
                elements.editFileInfo.classList.add('hidden');
                elements.editResourceUrl.value = resource.url;
                elements.editResourceUrl.required = true;
            }

            elements.editResourceNotes.value = resource.notes;
            elements.editResourceTags.value = resource.tags.join(', ');
            openModal(elements.editResourceModal);
            return;
        }

        if (deleteBtn) {
            const resourceId = deleteBtn.dataset.id;
            if (confirm('Are you sure you want to delete this resource?')) {
                deleteResource(resourceId);
            }
            return;
        }

        if (downloadBtn) {
            const resourceId = downloadBtn.dataset.id;
            downloadResourceFile(resourceId);
            return;
        }
    });

    // --- SEARCH ---
    elements.searchInput.addEventListener('input', (e) => {
        setSearchQuery(e.target.value);
    });

    // --- MODALS ---
    elements.editProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateProject(elements.editProjectId.value, elements.editProjectName.value);
        closeModal(elements.editProjectModal);
    });

    elements.editResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateResource(
            elements.editResourceId.value,
            elements.editResourceUrl.value, // Pass it, state function will ignore if it's a file
            elements.editResourceNotes.value,
            elements.editResourceTags.value
        );
        closeModal(elements.editResourceModal);
    });

    elements.cancelEditProject.addEventListener('click', () => closeModal(elements.editProjectModal));
    elements.cancelEditResource.addEventListener('click', () => closeModal(elements.editResourceModal));
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });

    // --- PAGE NAVIGATION ---
    elements.profileButton.addEventListener('click', () => {
        const { currentView } = getState();
        if (currentView === 'main') {
            switchView('profile');
        } else {
            switchView('main');
        }
    });
    
    // --- DATA MANAGEMENT ---
    elements.exportButton.addEventListener('click', exportData);

    elements.importButton.addEventListener('click', () => {
        elements.importFileInput.click();
    });

    elements.importFileInput.addEventListener('change', (e) => {
        importData(e.target.files[0]);
        e.target.value = null; // Reset input
    });
}
