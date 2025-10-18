import state, * as State from './state.js';
import { DOMElements, renderAll, showNotification, openEditResourceModal, closeEditResourceModal, openEditProjectModal, closeEditProjectModal } from './ui.js';

export function initializeEventListeners() {

    // --- FORM SUBMISSIONS ---
    DOMElements.addProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = DOMElements.newProjectNameInput.value.trim();
        if (name) {
            State.addProject(name);
            DOMElements.newProjectNameInput.value = '';
            renderAll();
        }
    });

    DOMElements.addResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const resourceData = {
            url: document.getElementById('resource-url').value.trim(),
            notes: document.getElementById('resource-notes').value.trim(),
            tags: document.getElementById('resource-tags').value.trim(),
            projectId: parseInt(DOMElements.projectSelect.value)
        };
        if (!resourceData.url || !resourceData.projectId) return;
        State.addResource(resourceData);
        DOMElements.addResourceForm.reset();
        renderAll();
    });

    DOMElements.editResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-resource-id').value);
        const updatedData = {
            url: document.getElementById('edit-resource-url').value.trim(),
            notes: document.getElementById('edit-resource-notes').value.trim(),
            tags: document.getElementById('edit-resource-tags').value.trim(),
        };
        State.updateResource(id, updatedData);
        renderAll();
        closeEditResourceModal();
    });

    DOMElements.editProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-project-id').value);
        const newName = document.getElementById('edit-project-name').value.trim();
        if (newName) {
            State.updateProject(id, newName);
            renderAll();
            closeEditProjectModal();
        }
    });

    // --- CLICK EVENT DELEGATION ---
    DOMElements.projectList.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-project-btn');
        const deleteBtn = e.target.closest('.delete-project-btn');
        const filterBtn = e.target.closest('.filter-btn, button[data-id="all"]');

        if (editBtn) openEditProjectModal(parseInt(editBtn.dataset.id));
        else if (deleteBtn) handleDeleteProject(parseInt(deleteBtn.dataset.id));
        else if (filterBtn) handleFilterProjects(filterBtn.dataset.id);
    });

    DOMElements.resourceGrid.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-resource-btn');
        const deleteBtn = e.target.closest('.delete-resource-btn');
        
        if (editBtn) openEditResourceModal(parseInt(editBtn.dataset.id));
        else if (deleteBtn) handleDeleteResource(parseInt(deleteBtn.dataset.id));
    });

    // --- MODAL CONTROLS ---
    DOMElements.cancelEditResourceBtn.addEventListener('click', closeEditResourceModal);
    DOMElements.editResourceModal.addEventListener('click', (e) => e.target === DOMElements.editResourceModal && closeEditResourceModal());
    DOMElements.cancelEditProjectBtn.addEventListener('click', closeEditProjectModal);
    DOMElements.editProjectModal.addEventListener('click', (e) => e.target === DOMElements.editProjectModal && closeEditProjectModal());
}

// --- HANDLER FUNCTIONS ---
function handleDeleteProject(id) {
    const project = state.projects.find(p => p.id === id);
    if (confirm(`Are you sure you want to delete the project "${project.name}"?`)) {
        const result = State.deleteProject(id);
        if (!result.success) {
            showNotification(result.message);
        }
        renderAll();
    }
}

function handleDeleteResource(id) {
    if (confirm('Are you sure you want to delete this resource?')) {
        State.deleteResource(id);
        renderAll();
    }
}

function handleFilterProjects(id) {
    State.setActiveFilter(id);
    renderAll();
}
