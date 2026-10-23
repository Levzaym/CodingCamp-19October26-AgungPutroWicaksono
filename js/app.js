document.addEventListener('DOMContentLoaded', () => {
    
    // --- UI Utilities ---
    const toastEl = document.getElementById('toast');
    let toastTimeout;
    
    function showToast(message, type = 'danger') {
        toastEl.textContent = message;
        toastEl.className = `toast show ${type}`;
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3000);
    }

    // --- Theme Management (Fitur Tambahan 1) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Check local storage for theme preference
    let isDark = localStorage.getItem('darkMode') === 'true';
    
    function applyTheme() {
        if (isDark) {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        isDark = !isDark;
        localStorage.setItem('darkMode', isDark);
        applyTheme();
    });
    applyTheme(); // Initial call

    // --- Clock and Greeting ---
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    const greetingEl = document.getElementById('greeting');

    function updateTime() {
        const now = new Date();
        
        // Format Time HH:MM:SS
        clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        
        // Format Date
        dateEl.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
        });
        
        // Format Greeting
        const hour = now.getHours();
        let greeting = 'Good Evening';
        if (hour >= 5 && hour < 12) {
            greeting = 'Good Morning';
        } else if (hour >= 12 && hour < 18) {
            greeting = 'Good Afternoon';
        }
        greetingEl.textContent = `${greeting}, Agung Putro Wicaksono`;
    }
    setInterval(updateTime, 1000);
    updateTime(); // Initial call

    // --- Focus Timer (Pomodoro) ---
    let timerInterval;
    let timeRemaining = 25 * 60; // default 25 minutes in seconds
    let currentDuration = 25; // Store chosen duration for reset
    let isRunning = false;

    const timerDisplay = document.getElementById('timer-display');
    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');
    const timerInput = document.getElementById('timer-input');
    const timerSetBtn = document.getElementById('timer-set');

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function startTimer() {
        if (isRunning || timeRemaining <= 0) return;
        isRunning = true;
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                stopTimer();
                showToast("Time's up! Take a break.", 'success');
            }
        }, 1000);
    }

    function stopTimer() {
        isRunning = false;
        clearInterval(timerInterval);
    }

    function resetTimer() {
        stopTimer();
        timeRemaining = currentDuration * 60;
        updateTimerDisplay();
    }

    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Fitur Tambahan 2: Change Pomodoro Time
    timerSetBtn.addEventListener('click', () => {
        const newDuration = parseInt(timerInput.value, 10);
        if (isNaN(newDuration) || newDuration <= 0) {
            showToast("Please enter a valid number greater than 0");
            return;
        }
        currentDuration = newDuration;
        resetTimer();
        showToast(`Timer set to ${currentDuration} minutes`, 'success');
    });
    updateTimerDisplay(); // Initial call

    // --- Tasks (To-Do List) ---
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskListEl = document.getElementById('task-list');
    
    // Load from Local Storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskListEl.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${escapeHTML(task.text)}</span>
                <div class="task-actions">
                    <button class="btn-secondary btn-sm edit-btn">Edit</button>
                    <button class="btn-danger btn-sm delete-btn">Delete</button>
                </div>
            `;

            // Event Listeners for actions
            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => toggleTaskStatus(task.id));

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => enableEditMode(li, task));

            taskListEl.appendChild(li);
        });
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (!text) {
            showToast("Task cannot be empty!");
            return;
        }

        // Fitur Tambahan 3: Prevent duplicate tasks
        const isDuplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
        if (isDuplicate) {
            showToast("This task already exists!");
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
    }

    function toggleTaskStatus(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }

    function enableEditMode(liElement, taskObj) {
        const textSpan = liElement.querySelector('.task-text');
        const actionsDiv = liElement.querySelector('.task-actions');
        
        // Create input for editing
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'task-edit-input';
        editInput.value = taskObj.text;
        
        // Create save button
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn-primary btn-sm';
        saveBtn.textContent = 'Save';
        
        // Swap elements
        liElement.insertBefore(editInput, textSpan);
        liElement.removeChild(textSpan);
        
        actionsDiv.innerHTML = '';
        actionsDiv.appendChild(saveBtn);
        
        editInput.focus();

        function saveEdit() {
            const newText = editInput.value.trim();
            if (!newText) {
                showToast("Task cannot be empty!");
                editInput.focus();
                return;
            }
            
            // Check duplicate ignoring itself
            const isDuplicate = tasks.some(t => t.id !== taskObj.id && t.text.toLowerCase() === newText.toLowerCase());
            if (isDuplicate) {
                showToast("This task already exists!");
                editInput.focus();
                return;
            }

            taskObj.text = newText;
            saveTasks();
            renderTasks();
        }

        saveBtn.addEventListener('click', saveEdit);
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    renderTasks(); // Initial call

    // --- Quick Links ---
    const linkNameInput = document.getElementById('link-name');
    const linkUrlInput = document.getElementById('link-url');
    const addLinkBtn = document.getElementById('add-link-btn');
    const linksContainer = document.getElementById('links-container');
    
    let links = [];
    const savedLinks = localStorage.getItem('links');
    
    if (savedLinks) {
        links = JSON.parse(savedLinks);
    } else {
        // Pre-populate default links if empty/null on first load
        links = [
            { id: 'default-google', name: 'Google', url: 'https://google.com' },
            { id: 'default-gmail', name: 'Gmail', url: 'https://mail.google.com' },
            { id: 'default-calendar', name: 'Calendar', url: 'https://calendar.google.com' }
        ];
        localStorage.setItem('links', JSON.stringify(links));
    }

    function saveLinks() {
        localStorage.setItem('links', JSON.stringify(links));
    }

    function renderLinks() {
        linksContainer.innerHTML = '';
        links.forEach(link => {
            const anchor = document.createElement('a');
            anchor.href = link.url;
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
            anchor.className = 'link-pill';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = escapeHTML(link.name);
            
            const delBtn = document.createElement('button');
            delBtn.className = 'link-delete';
            delBtn.innerHTML = '✕';
            delBtn.title = "Delete link";
            
            // Prevent navigation when clicking delete
            delBtn.addEventListener('click', (e) => {
                e.preventDefault();
                deleteLink(link.id);
            });

            anchor.appendChild(nameSpan);
            anchor.appendChild(delBtn);
            linksContainer.appendChild(anchor);
        });
    }

    function addLink() {
        const name = linkNameInput.value.trim();
        let url = linkUrlInput.value.trim();
        
        if (!name || !url) {
            showToast("Both name and URL are required!");
            return;
        }

        // Simple URL formatter
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const newLink = {
            id: Date.now().toString(),
            name: name,
            url: url
        };
        
        links.push(newLink);
        saveLinks();
        renderLinks();
        
        linkNameInput.value = '';
        linkUrlInput.value = '';
    }

    function deleteLink(id) {
        links = links.filter(l => l.id !== id);
        saveLinks();
        renderLinks();
    }

    addLinkBtn.addEventListener('click', addLink);
    linkUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addLink();
    });
    renderLinks(); // Initial call

    // Utility to prevent XSS in rendering
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
