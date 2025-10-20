import { elements, openModal, closeModal, closeAllModals, renderTagPills } from './dom.js';
import { getState, addProject, addResource, deleteProject, deleteResource, updateProject, updateResource, setActiveProject, setSearchQuery, exportData, importData, switchView, setActiveResourceType, downloadResourceFile, setTagFilter } from './state.js';

// --- Helper for managing tags in the UI ---
function setupTagInput(container, input) {
    let tags = [];
    
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-pill-remove')) {
            tags = tags.filter(tag => tag !== e.target.dataset.tag);
            renderTagPills(container, tags);
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = input.value.trim();
            if (newTag && !tags.includes(newTag)) {
                tags.push(newTag);
                renderTagPills(container, tags);
            }
            input.value = '';
        }
        if (e.key === 'Backspace' && input.value === '') {
            if (tags.length > 0) {
                tags.pop();
                renderTagPills(container, tags);
            }
        }
    });

    return {
        getTags: () => tags,
        setTags: (newTags) => {
            tags = newTags;
            renderTagPills(container, tags);
        },
        clear: () => {
            tags = [];
            renderTagPills(container, tags);
        }
    };
}

export function addEventListeners() {
    const addFormTags = setupTagInput(elements.resourceTagsContainer, elements.resourceTagsInput);
    const editFormTags = setupTagInput(elements.editResourceTagsContainer, elements.editResourceTagsInput);

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

    elements.fileDropArea.addEventListener('click', () => {
        elements.resourceFile.click();
    });

    elements.resourceFile.addEventListener('change', () => {
        elements.fileNameDisplay.textContent = elements.resourceFile.files.length > 0 ? elements.resourceFile.files[0].name : '';
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        elements.fileDropArea.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        elements.fileDropArea.addEventListener(eventName, () => elements.fileDropArea.classList.add('dragover'));
    });
    ['dragleave', 'drop'].forEach(eventName => {
         elements.fileDropArea.addEventListener(eventName, () => elements.fileDropArea.classList.remove('dragover'));
    });
    elements.fileDropArea.addEventListener('drop', (e) => {
        elements.resourceFile.files = e.dataTransfer.files;
        elements.resourceFile.dispatchEvent(new Event('change'));
    });

    elements.addProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addProject(elements.newProjectName.value);
        elements.newProjectName.value = '';
    });

    elements.addResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const resourceData = {
            notes: elements.resourceNotes.value,
            tags: addFormTags.getTags(),
            projectId: elements.projectSelect.value,
        };
        if (getState().activeResourceType === 'url') {
            resourceData.url = elements.resourceUrl.value;
        } else if (elements.resourceFile.files.length > 0) {
            resourceData.file = elements.resourceFile.files[0];
        }
        addResource(resourceData);
        elements.addResourceForm.reset();
        addFormTags.clear();
        elements.fileNameDisplay.textContent = '';
    });

    elements.projectList.addEventListener('click', (e) => {
        const projectItem = e.target.closest('.project-item');
        if (e.target.closest('.edit-project-btn')) {
            const projectId = e.target.closest('.edit-project-btn').dataset.id;
            const project = getState().projects.find(p => p.id === projectId);
            elements.editProjectId.value = project.id;
            elements.editProjectName.value = project.name;
            openModal(elements.editProjectModal);
        } else if (e.target.closest('.delete-project-btn')) {
            const projectId = e.target.closest('.delete-project-btn').dataset.id;
            if (confirm('Are you sure you want to delete this project?')) deleteProject(projectId);
        } else if (projectItem) {
            setActiveProject(projectItem.dataset.id);
        }
    });

    elements.resourceGrid.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('tag')) {
            setTagFilter(target.textContent);
            return;
        }
        
        const cardAction = target.closest('.icon-btn');
        if (!cardAction) return;

        const resourceId = cardAction.dataset.id;

        if (cardAction.classList.contains('edit-resource-btn')) {
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
            editFormTags.setTags(resource.tags);
            openModal(elements.editResourceModal);
        } else if (cardAction.classList.contains('delete-resource-btn')) {
            if (confirm('Are you sure you want to delete this resource?')) deleteResource(resourceId);
        } else if (cardAction.classList.contains('download-resource-btn')) {
            downloadResourceFile(resourceId);
        }
    });

    elements.activeFilterPill.addEventListener('click', () => {
        setTagFilter(getState().activeTagFilter); // Clicking again clears it
    });

    elements.searchInput.addEventListener('input', (e) => setSearchQuery(e.target.value));

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
            editFormTags.getTags()
        );
        closeModal(elements.editResourceModal);
    });

    elements.cancelEditProject.addEventListener('click', () => closeModal(elements.editProjectModal));
    elements.cancelEditResource.addEventListener('click', () => closeModal(elements.editResourceModal));
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeAllModals();
        });
    });

    elements.profileButton.addEventListener('click', () => {
        switchView(getState().currentView === 'main' ? 'profile' : 'main');
    });
    
    elements.exportButton.addEventListener('click', exportData);
    elements.importButton.addEventListener('click', () => elements.importFileInput.click());
    elements.importFileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) importData(e.target.files[0]);
        e.target.value = null;
    });
}
