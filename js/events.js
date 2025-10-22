import { elements, openModal, closeModal, closeAllModals, renderTagPills, showAiSpinner, hideAiSpinner, showNotification } from './dom.js';
import { getState, addProject, addResource, deleteProject, deleteResource, updateProject, updateResource, setActiveProject, setSearchQuery, exportData, importData, switchView, setActiveResourceType, downloadResourceFile, setTagFilter } from './state.js';

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

    // --- NEW AI URL ANALYSIS EVENT ---
    elements.resourceUrl.addEventListener('blur', async (e) => {
        const url = e.target.value.trim();
        
        // Only run if it looks like a valid URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return;
        }

        showAiSpinner();
        
        try {
            const apiKey = "AIzaSyAn0D5MuaBMqcA0YJz5cqNCYLlTqd5W-q4"; // API key is injected by the environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

            const systemPrompt = `You are an expert research assistant. Your job is to analyze the content of a URL and provide a concise summary and relevant keywords.
            
            Guidelines:
            - The summary should be a single, informative paragraph.
            - Provide 3-5 keyword tags that accurately reflect the main topics.
            - Respond ONLY with the requested JSON object.`;
            
            const userQuery = `Please analyze the content of this URL: ${url}`;
            
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                tools: [{ "google_search": {} }], // Enable Google Search grounding to read the URL
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            "summary": { "type": "STRING" },
                            "tags": {
                                "type": "ARRAY",
                                "items": { "type": "STRING" }
                            }
                        },
                        required: ["summary", "tags"]
                    }
                }
            };

            // Exponential backoff for retries
            let response;
            let delay = 1000;
            for (let i = 0; i < 5; i++) {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    break; // Success
                }

                if (response.status === 429 || response.status >= 500) {
                    // Throttling or server error, wait and retry
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                } else {
                    // Other client-side error, don't retry
                    throw new Error(`API request failed with status ${response.status}`);
                }
            }

            if (!response.ok) {
                throw new Error(`API request failed after retries with status ${response.status}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content?.parts?.[0]?.text) {
                const jsonText = result.candidates[0].content.parts[0].text;
                const data = JSON.parse(jsonText);
                
                // Populate the form
                elements.resourceNotes.value = data.summary;
                addFormTags.setTags(data.tags); // This will render the tags as pills
                
                showNotification("AI analysis complete!", false);
            } else {
                throw new Error("Invalid response structure from AI.");
            }

        } catch (error) {
            console.error("AI Analysis Error:", error);
            showNotification("AI analysis failed. Please check URL.", true);
        } finally {
            hideAiSpinner();
        }
    });
    // --- END OF NEW AI EVENT ---


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
