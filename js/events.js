import { elements, openModal, closeModal, closeAllModals } from './dom.js';
import { getState, addProject, addResource, deleteProject, deleteResource, updateProject, updateResource, setActiveProject, setSearchQuery, exportData, importData, switchView } from './state.js';

export function addEventListeners() {

    // --- FORMS ---
    elements.addProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addProject(elements.newProjectName.value);
        elements.newProjectName.value = '';
    });

    elements.addResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addResource(
            elements.resourceUrl.value,
            elements.resourceNotes.value,
            elements.resourceTags.value,
            elements.projectSelect.value
        );
        elements.addResourceForm.reset();
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
            if (confirm('Are you sure you want to delete this project?')) {
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
        
        if (editBtn) {
            const resourceId = editBtn.dataset.id;
            const resource = getState().resources.find(r => r.id === resourceId);
            elements.editResourceId.value = resource.id;
            elements.editResourceUrl.value = resource.url;
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
            elements.editResourceUrl.value,
            elements.editResourceNotes.value,
            elements.editResourceTags.value
        );
        closeModal(elements.editResourceModal);
    });

    elements.cancelEditProject.addEventListener('click', () => closeModal(elements.editProjectModal));
    elements.cancelEditResource.addEventListener('click', () => closeModal(elements.editResourceModal));
    
    // Close modals on overlay click
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
        // Reset the input so the 'change' event fires even if the same file is selected again
        e.target.value = null;
    });
}
