// This event listener ensures that the script runs only after the entire HTML
// document has been loaded and parsed. This prevents errors from trying to
// access DOM elements that haven't been created yet.
document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM ELEMENT REFERENCES ---
    // Storing references to frequently used DOM elements improves performance
    // and makes the code cleaner.
    const projectList = document.getElementById('project-list');
    const addProjectForm = document.getElementById('add-project-form');
    const newProjectNameInput = document.getElementById('new-project-name');
    const resourceGrid = document.getElementById('resource-grid');
    const addResourceForm = document.getElementById('add-resource-form');
    const projectSelect = document.getElementById('project-select');
    const emptyState = document.getElementById('empty-state');

    // --- STATE MANAGEMENT ---
    // 'state' is a single object that holds all the application's data.
    // This makes it easy to save and load the entire application's status.
    let state = {
        projects: [],
        resources: [],
        activeFilter: 'all' // 'all' or a project ID
    };

    // Load initial data from the browser's localStorage.
    // localStorage allows data to persist even after the browser is closed.
    function loadState() {
        const savedState = localStorage.getItem('researchHubState');
        if (savedState) {
            state = JSON.parse(savedState);
        } else {
            // If no data is saved, initialize with a default "General" project.
            state = {
                projects: [{ id: 1, name: 'General' }],
                resources: [],
                activeFilter: 'all'
            };
        }
    }

    // Save the current state to localStorage.
    // This function is called whenever data is added or changed.
    function saveState() {
        localStorage.setItem('researchHubState', JSON.stringify(state));
    }

    // --- RENDERING FUNCTIONS ---
    // These functions are responsible for updating the HTML based on the current state.

    // Render the list of projects and the project selection dropdown.
    function renderProjects() {
        projectList.innerHTML = '';
        projectSelect.innerHTML = '';

        // Add the "All Resources" filter option first.
        const allFilterItem = document.createElement('li');
        allFilterItem.innerHTML = `<button data-id="all" class="w-full text-left px-3 py-2 rounded-md ${state.activeFilter === 'all' ? 'bg-sky-600 text-white' : 'hover:bg-slate-700'} transition-colors">All Resources</button>`;
        projectList.appendChild(allFilterItem);
        
        // Loop through each project in the state and create list items and dropdown options.
        state.projects.forEach(project => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<button data-id="${project.id}" class="w-full text-left px-3 py-2 rounded-md ${state.activeFilter === project.id ? 'bg-sky-600 text-white' : 'hover:bg-slate-700'} transition-colors">${project.name}</button>`;
            projectList.appendChild(listItem);
            
            const optionItem = document.createElement('option');
            optionItem.value = project.id;
            optionItem.textContent = project.name;
            projectSelect.appendChild(optionItem);
        });
    }

    // Render the resource cards based on the active filter.
    function renderResources() {
        resourceGrid.innerHTML = '';
        
        // Determine which resources to show.
        const filteredResources = state.activeFilter === 'all'
            ? state.resources
            : state.resources.filter(r => r.projectId === state.activeFilter);

        // Show or hide the "empty state" message.
        if (filteredResources.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }

        // Create and append a card for each filtered resource.
        filteredResources.forEach(resource => {
            const projectName = state.projects.find(p => p.id === resource.projectId)?.name || 'Unassigned';
            const tagsHTML = resource.tags.split(',').map(tag => tag.trim() ? `<span class="bg-slate-600 text-sky-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">${tag.trim()}</span>` : '').join('');

            const card = document.createElement('div');
            card.className = 'bg-slate-800 rounded-lg p-5 shadow-lg flex flex-col card-animate';
            card.innerHTML = `
                <div class="flex-grow">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs font-semibold uppercase tracking-wider text-sky-400">${projectName}</span>
                        <button data-id="${resource.id}" class="delete-btn text-slate-500 hover:text-red-500 transition-colors">&times;</button>
                    </div>
                    <p class="text-slate-400 text-sm break-all">${resource.url}</p>
                    <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="text-lg font-semibold text-white hover:text-sky-400 transition-colors mt-1 mb-3 block">${truncateURL(resource.url)}</a>
                    <p class="text-slate-300 mb-4">${resource.notes || 'No notes for this resource.'}</p>
                </div>
                <div class="flex-shrink-0">${tagsHTML}</div>
            `;
            resourceGrid.appendChild(card);
        });
    }
    
    // Utility to make long URLs more readable in the cards.
    function truncateURL(url) {
        try {
            const urlObj = new URL(url);
            let path = urlObj.pathname;
            if(path.length > 30) path = path.substring(0, 27) + '...';
            return urlObj.hostname + path;
        } catch (e) {
            // Fallback for invalid URLs
            return url.length > 40 ? url.substring(0, 37) + '...' : url;
        }
    }


    // --- EVENT HANDLERS ---
    // These functions handle user interactions.
    
    // Handles the submission of the "Add Project" form.
    addProjectForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevents the page from reloading
        const name = newProjectNameInput.value.trim();
        if (name) {
            const newProject = {
                id: Date.now(), // Using timestamp for a simple unique ID
                name: name
            };
            state.projects.push(newProject);
            newProjectNameInput.value = '';
            saveState();
            renderProjects();
        }
    });

    // Handles the submission of the "Add Resource" form.
    addResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newResource = {
            id: Date.now(),
            url: document.getElementById('resource-url').value.trim(),
            notes: document.getElementById('resource-notes').value.trim(),
            tags: document.getElementById('resource-tags').value.trim(),
            projectId: parseInt(projectSelect.value)
        };
        
        if (!newResource.url || !newResource.projectId) {
            // Using a custom modal/alert would be better than the default `alert`.
            // For now, `alert` is simple and effective.
            alert('URL and Project are required.');
            return;
        }
        
        state.resources.push(newResource);
        addResourceForm.reset();
        saveState();
        renderResources();
    });

    // Uses event delegation to handle clicks on the project filter buttons.
    projectList.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const id = e.target.dataset.id;
            state.activeFilter = (id === 'all') ? 'all' : parseInt(id);
            renderProjects(); // Re-render projects to update the active style
            renderResources();
        }
    });

    // Uses event delegation to handle clicks on the delete button on resource cards.
    resourceGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.dataset.id);
            if (confirm('Are you sure you want to delete this resource?')) {
                state.resources = state.resources.filter(r => r.id !== id);
                saveState();
                renderResources();
            }
        }
    });

    // --- INITIALIZATION ---
    // This function kicks everything off when the script first runs.
    function init() {
        loadState();
        renderProjects();
        renderResources();
    }

    init();
});
