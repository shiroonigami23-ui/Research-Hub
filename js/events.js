import { 
    elements, openModal, closeModal, closeAllModals, renderTagPills, 
    showAiSpinner, hideAiSpinner, showNotification, 
    showAiFileSpinner, hideAiFileSpinner // <-- NEW IMPORTS
} from './dom.js';
import { 
    getState, addProject, addResource, deleteProject, deleteResource, 
    updateProject, updateResource, setActiveProject, setSearchQuery, 
    exportData, importData, switchView, setActiveResourceType, 
    downloadResourceFile, setTagFilter 
} from './state.js';

// --- Helper for managing tags in the UI ---
function setupTagInput(container, input) {
    let tags = [];
    
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-pill-remove')) {
            const tagToRemove = e.target.dataset.tag;
            tags = tags.filter(tag => tag !== tagToRemove);
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
            tags = [...newTags]; // Use spread to create a new array
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

    // --- AI URL ANALYSIS EVENT (Unchanged) ---
    elements.resourceUrl.addEventListener('blur', async (e) => {
        const url = e.target.value.trim();
        const apiKey = "RESEARCH_API_KEY_PLACEHOLDER"; // Your secure API key
        
        if (!url.startsWith('http://') && !url.startsWith('https://') || !apiKey) {
            return;
        }

        showAiSpinner();
        
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            
            const analysisSchema = {
                type: "OBJECT",
                properties: {
                    "summary": { "type": "STRING" },
                    "tags": {
                        "type": "ARRAY",
                        "items": { "type": "STRING" }
                    }
                },
                required: ["summary", "tags"]
            };

            const systemPrompt = "You are an AI research assistant. A user has provided a URL. Summarize the content of the webpage in a single, concise paragraph (under 100 words). Based on the content, provide an array of 3-5 relevant lowercase tags. The user's prompt will be the URL.";

            const payload = {
                contents: [{ parts: [{ text: url }] }],
                tools: [{ "google_search": {} }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: analysisSchema
                }
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.candidates || !result.candidates[0].content.parts[0].text) {
                 throw new Error("Invalid API response structure.");
            }
            
            const jsonText = result.candidates[0].content.parts[0].text;
            const data = JSON.parse(jsonText);
            
            if (data.summary && data.tags) {
                elements.resourceNotes.value = data.summary;
                addFormTags.setTags(data.tags);
                showNotification("AI analysis complete!", false);
            } else {
                throw new Error("Invalid data in AI response.");
            }

        } catch (error) {
            console.error("AI Analysis Error:", error);
            showNotification(error.message, true);
        } finally {
            hideAiSpinner();
        }
    });


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

    // --- NEW: AI FILE ANALYSIS EVENT ---
    elements.resourceFile.addEventListener('change', async () => {
        if (elements.resourceFile.files.length === 0) {
            elements.fileNameDisplay.textContent = '';
            return;
        }

        const file = elements.resourceFile.files[0];
        elements.fileNameDisplay.textContent = file.name;
        const apiKey = ""; // Your secure API key

        // 1. Define allowed text types and size limit
        const allowedTypes = ['text/plain', 'text/markdown', 'text/javascript', 'text/css', 'text/html', 'application/json', 'text/x-python', 'text/csv'];
        const isTextFile = allowedTypes.includes(file.type) || file.name.endsWith('.md') || file.name.endsWith('.txt');
        const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

        // 2. Check if file is valid for analysis
        if (!apiKey || !isTextFile) {
            console.log('File type not supported for AI analysis or no API key.');
            return; // Not a text file or no key, just upload it normally
        }

        if (file.size > MAX_SIZE_BYTES) {
            showNotification('File is too large for AI analysis (Max 1MB).', true);
            return;
        }

        // 3. Read the file
        let fileContent;
        try {
            fileContent = await file.text();
        } catch (readError) {
            console.error('File read error:', readError);
            showNotification('Could not read file content.', true);
            return;
        }

        // 4. Show spinner and call AI
        showAiFileSpinner();
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            
            const analysisSchema = {
                type: "OBJECT",
                properties: {
                    "summary": { "type": "STRING" },
                    "tags": {
                        "type": "ARRAY",
                        "items": { "type": "STRING" }
                    }
                },
                required: ["summary", "tags"]
            };

            const systemPrompt = "You are an AI research assistant. A user has uploaded a file. Summarize its content in a single, concise paragraph (under 100 words). Based on the content, provide an array of 3-5 relevant lowercase tags. The user's prompt will be the full text content of the file.";

            const payload = {
                contents: [{ parts: [{ text: fileContent }] }], // Use file content as prompt
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: analysisSchema
                }
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.candidates || !result.candidates[0].content.parts[0].text) {
                 throw new Error("Invalid API response structure.");
            }

            const jsonText = result.candidates[0].content.parts[0].text;
            const data = JSON.parse(jsonText);

            // 5. Populate form
            if (data.summary && data.tags) {
                elements.resourceNotes.value = data.summary;
                addFormTags.setTags(data.tags);
                showNotification("AI file analysis complete!", false);
            } else {
                throw new Error("Invalid data in AI response.");
            }

        } catch (error) {
            console.error("AI File Analysis Error:", error);
            showNotification(error.message, true);
        } finally {
            // 6. Hide spinner
            hideAiFileSpinner();
        }
    });
    // --- END OF NEW FILE EVENT ---


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
        elements.resourceFile.dispatchEvent(new Event('change')); // Manually trigger 'change' to run AI
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
