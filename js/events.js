import { state, addProject, addResource, updateResource, updateProject, deleteResource, deleteProject } from './state.js';
import * as dom from './dom.js';

export function initializeEventListeners() {

    // --- SEARCH INPUT ---
    dom.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        dom.renderResources(); // Re-render resources whenever search query changes
    });

    // --- FORM SUBMISSIONS ---
    dom.addProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = dom.newProjectNameInput.value;
        if (name) {
            addProject(name);
            dom.newProjectNameInput.value = '';
            dom.renderProjects();
        }
    });

    dom.addResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('resource-url').value;
        const notes = document.getElementById('resource-notes').value;
        const tags = document.getElementById('resource-tags').value;
        const projectId = dom.projectSelect.value;
        
        if (!url || !projectId) return;

        addResource(url, notes, tags, projectId);
        dom.addResourceForm.reset();
        dom.renderResources();
    });
    
    // --- EVENT DELEGATION (Projects) ---
    dom.projectList.addEventListener('click', (e) => {
        const target = e.target;
        const editBtn = target.closest('.edit-project-btn');
        const deleteBtn = target.closest('.delete-project-btn');
        const filterBtn = target.closest('button:not(.edit-project-btn):not(.delete-project-btn)');

        if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            openEditProjectModal(id);
        } else if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id);
            handleDeleteProject(id);
        } else if (filterBtn) {
            const id = filterBtn.dataset.id;
            state.activeFilter = (id === 'all') ? 'all' : parseInt(id);
            // When changing projects, we should clear the search
            dom.searchInput.value = '';
            state.searchQuery = '';
            dom.renderProjects();
            dom.renderResources();
        }
    });

    // --- EVENT DELEGATION (Resources) ---
    dom.resourceGrid.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-resource-btn');
        const deleteBtn = e.target.closest('.delete-resource-btn');
        
        if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            openEditResourceModal(id);
        } else if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id);
            if (confirm('Are you sure you want to delete this resource?')) {
                deleteResource(id);
                dom.renderResources();
            }
        }
    });

    // --- MODAL LOGIC & SUBMISSIONS ---
    dom.editResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-resource-id').value);
        const url = document.getElementById('edit-resource-url').value;
        const notes = document.getElementById('edit-resource-notes').value;
        const tags = document.getElementById('edit-resource-tags').value;
        updateResource(id, url, notes, tags);
        dom.renderResources();
        closeEditResourceModal();
    });
    
    dom.editProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-project-id').value);
        const newName = document.getElementById('edit-project-name').value;
        if (newName) {
            updateProject(id, newName);
            dom.renderProjects();
            dom.renderResources(); 
            closeEditProjectModal();
        }
    });

    // Modal open/close helpers
    function openEditResourceModal(id) {
        const resource = state.resources.find(r => r.id === id);
        if (resource) {
            document.getElementById('edit-resource-id').value = resource.id;
            document.getElementById('edit-resource-url').value = resource.url;
            document.getElementById('edit-resource-notes').value = resource.notes;
            document.getElementById('edit-resource-tags').value = resource.tags;
            dom.editResourceModal.classList.remove('hidden');
        }
    }
    
    function closeEditResourceModal() { dom.editResourceModal.classList.add('hidden'); }

    function openEditProjectModal(id) {
        const project = state.projects.find(p => p.id === id);
        if (project) {
            document.getElementById('edit-project-id').value = project.id;
            document.getElementById('edit-project-name').value = project.name;
            dom.editProjectModal.classList.remove('hidden');
        }
    }
    
    function closeEditProjectModal() { dom.editProjectModal.classList.add('hidden'); }
    
    // Cancel buttons and clicking outside the modal
    dom.cancelEditResourceBtn.addEventListener('click', closeEditResourceModal);
    dom.editResourceModal.addEventListener('click', (e) => e.target === dom.editResourceModal && closeEditResourceModal());
    dom.cancelEditProjectBtn.addEventListener('click', closeEditProjectModal);
    dom.editProjectModal.addEventListener('click', (e) => e.target === dom.editProjectModal && closeEditProjectModal());

    // --- DELETE HANDLERS with safety checks ---
    function handleDeleteProject(id) {
        if (id === 1) { // Default project ID
            dom.showNotification("Cannot delete the default 'General' project.");
            return;
        }
        const hasResources = state.resources.some(r => r.projectId === id);
        if (hasResources) {
            dom.showNotification("Cannot delete projects with resources. Move or delete them first.");
            return;
        }
        const projectName = state.projects.find(p => p.id === id)?.name;
        if (confirm(`Are you sure you want to delete the "${projectName}" project?`)) {
            deleteProject(id);
            dom.renderProjects();
            dom.renderResources();
        }
    }
}
