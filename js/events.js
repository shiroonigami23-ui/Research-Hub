import { elements, renderProjects, renderResources, showNotification, openModal, closeModal, closeAllModals } from './dom.js';
import { getState, addProject, addResource, deleteProject, deleteResource, updateProject, updateResource, setActiveProject, setSearchQuery, exportData, importData, switchView } from './state.js';

export function addEventListeners() {
    // --- FORM SUBMISSIONS ---
    elements.addProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addProject(elements.newProjectName.value);
        elements.newProjectName.value = '';
        renderProjects();
    });

    elements.addResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addResource({
            url: elements.resourceUrl.value,
            notes: elements.resourceNotes.value,
            tags: elements.resourceTags.value,
            projectId: elements.projectSelect.value,
        });
        e.target.reset();
        renderResources();
    });

    // --- PROJECT LIST INTERACTIONS ---
    elements.projectList.addEventListener('click', (e) => {
        const projectItem = e.target.closest('.project-item');
        if (projectItem && !e.target.closest('button')) {
            setActiveProject(projectItem.dataset.id);
        }

        if (e.target.closest('.edit-project-btn')) {
            const project = getState().projects.find(p => p.id === projectItem.dataset.id);
            elements.editProjectId.value = project.id;
            elements.editProjectName.value = project.name;
            openModal(elements.editProjectModal);
        }

        if (e.target.closest('.delete-project-btn')) {
            if (confirm('Are you sure you want to delete this project?')) {
                deleteProject(projectItem.dataset.id);
                renderProjects();
                renderResources();
            }
        }
    });

    // --- RESOURCE GRID INTERACTIONS ---
    elements.resourceGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.resource-card');
        if (!card) return;
        const resourceId = card.dataset.id;
        
        if (e.target.closest('.edit-resource-btn')) {
            const resource = getState().resources.find(r => r.id === resourceId);
            elements.editResourceId.value = resource.id;
            elements.editResourceUrl.value = resource.url;
            elements.editResourceNotes.value = resource.notes;
            elements.editResourceTags.value = resource.tags.join(', ');
            openModal(elements.editResourceModal);
        }

        if (e.target.closest('.delete-resource-btn')) {
            if (confirm('Are you sure you want to delete this resource?')) {
                deleteResource(resourceId);
                renderResources();
            }
        }
    });

    // --- SEARCH ---
    elements.searchInput.addEventListener('input', (e) => {
        setSearchQuery(e.target.value);
    });

    // --- MODAL INTERACTIONS ---
    elements.editResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateResource({
            id: elements.editResourceId.value,
            url: elements.editResourceUrl.value,
            notes: elements.editResourceNotes.value,
            tags: elements.editResourceTags.value,
        });
        closeModal(elements.editResourceModal);
        renderResources();
    });

    elements.editProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateProject({
            id: elements.editProjectId.value,
            name: elements.editProjectName.value,
        });
        closeModal(elements.editProjectModal);
        renderProjects();
    });

    elements.cancelEditResource.addEventListener('click', () => closeModal(elements.editResourceModal));
    elements.cancelEditProject.addEventListener('click', () => closeModal(elements.editProjectModal));
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    // --- PAGE NAVIGATION ---
    elements.profileButton.addEventListener('click', () => {
        switchView('profile');
    });

    elements.backButton.addEventListener('click', () => {
        switchView('main');
    });

    // --- DATA MANAGEMENT ---
    elements.exportButton.addEventListener('click', exportData);

    elements.importButton.addEventListener('click', () => {
        elements.importFileInput.click();
    });
    
    elements.importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            importData(file);
        }
        event.target.value = null;
    });
}
