// State Management
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [
    { id: '1', title: 'Review Database Schema', desc: 'Verify foreign key constraints and cascade delete logic.', status: 'completed', priority: 'High', date: '2026-09-24' },
    { id: '2', title: 'Deploy Web Application', desc: 'Push code changes to GitHub repository and verify build output.', status: 'pending', priority: 'Medium', date: '2026-09-25' }
];

// DOM Elements
const taskListEl = document.getElementById('task-list');
const emptyStateEl = document.getElementById('empty-state');
const modalEl = document.getElementById('task-modal');
const modalContentEl = document.getElementById('modal-content');
const modalTitleEl = document.getElementById('modal-title');
const taskFormEl = document.getElementById('task-form');

const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');

const statTotal = document.getElementById('stat-total');
const statPending = document.getElementById('stat-pending');
const statCompleted = document.getElementById('stat-completed');

// Event Listeners for Filters & Search
searchInput.addEventListener('input', renderTasks);
filterStatus.addEventListener('change', renderTasks);
filterPriority.addEventListener('change', renderTasks);

// Initialize App
function init() {
    renderTasks();
}

// Save to Local Storage & Update Stats
function saveAndRefresh() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    renderTasks();
}

// Render Tasks with Filtering and Stats
function renderTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusVal = filterStatus.value;
    const priorityVal = filterPriority.value;

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) || task.desc.toLowerCase().includes(searchTerm);
        const matchesStatus = statusVal === 'all' || task.status === statusVal;
        const matchesPriority = priorityVal === 'all' || task.priority === priorityVal;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Update stats dashboard
    statTotal.textContent = tasks.length;
    statPending.textContent = tasks.filter(t => t.status === 'pending').length;
    statCompleted.textContent = tasks.filter(t => t.status === 'completed').length;

    // Render list or empty state
    taskListEl.innerHTML = '';
    if (filteredTasks.length === 0) {
        emptyStateEl.classList.remove('hidden');
        return;
    }
    emptyStateEl.classList.add('hidden');

    filteredTasks.forEach(task => {
        const isCompleted = task.status === 'completed';
        
        // Priority Badge Styles
        let priorityClass = 'bg-slate-100 text-slate-700 border-slate-200';
        if (task.priority === 'High') {
            priorityClass = 'bg-rose-50 text-rose-700 border-rose-200';
        } else if (task.priority === 'Medium') {
            priorityClass = 'bg-amber-50 text-amber-700 border-amber-200';
        } else if (task.priority === 'Low') {
            priorityClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }

        const card = document.createElement('div');
        card.className = `task-card bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm fade-in ${isCompleted ? 'opacity-75 bg-slate-50/50' : ''}`;
        
        card.innerHTML = `
            <div>
                <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="flex items-center gap-3">
                        <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleTaskStatus('${task.id}')"
                            class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer">
                        <h3 class="font-semibold text-slate-900 text-base ${isCompleted ? 'line-through text-slate-400' : ''}">
                            ${escapeHtml(task.title)}
                        </h3>
                    </div>
                    <span class="text-xs px-2.5 py-1 rounded-lg border font-medium ${priorityClass}">
                        ${task.priority}
                    </span>
                </div>
                <p class="text-sm text-slate-600 pl-8 mb-4 ${isCompleted ? 'text-slate-400' : ''}">
                    ${escapeHtml(task.desc || 'No description provided.')}
                </p>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-slate-100 pl-8">
                <span class="text-xs text-slate-400"><i class="fa-regular fa-calendar mr-1"></i> ${task.date}</span>
                <div class="flex items-center gap-1">
                    <button onclick="openEditModal('${task.id}')" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit Task">
                        <i class="fa-solid fa-pen-to-square text-sm"></i>
                    </button>
                    <button onclick="deleteTask('${task.id}')" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Task">
                        <i class="fa-solid fa-trash-can text-sm"></i>
                    </button>
                </div>
            </div>
        `;
        taskListEl.appendChild(card);
    });
}

// Toggle Task Status (Pending / Completed)
function toggleTaskStatus(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.status = task.status === 'completed' ? 'pending' : 'completed';
        }
        return task;
    });
    saveAndRefresh();
}

// Delete Task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveAndRefresh();
    }
}

// Modal Controls
function openTaskModal() {
    modalTitleEl.textContent = 'Create New Task';
    taskFormEl.reset();
    document.getElementById('task-id').value = '';
    modalEl.classList.remove('hidden');
    setTimeout(() => {
        modalEl.classList.remove('opacity-0');
        modalContentEl.classList.remove('scale-95');
        modalContentEl.classList.add('scale-100');
    }, 10);
}

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    modalTitleEl.textContent = 'Edit Task';
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-desc').value = task.desc;
    document.getElementById('task-priority').value = task.priority;

    modalEl.classList.remove('hidden');
    setTimeout(() => {
        modalEl.classList.remove('opacity-0');
        modalContentEl.classList.remove('scale-95');
        modalContentEl.classList.add('scale-100');
    }, 10);
}

function closeTaskModal() {
    modalEl.classList.add('opacity-0');
    modalContentEl.classList.remove('scale-100');
    modalContentEl.classList.add('scale-95');
    setTimeout(() => {
        modalEl.classList.add('hidden');
    }, 300);
}

// Form Submit Handler (Create or Update)
function handleFormSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    const priority = document.getElementById('task-priority').value;

    if (!title) return;

    const currentDate = new Date().toISOString().split('T')[0];

    if (id) {
        // Update existing task
        tasks = tasks.map(task => {
            if (task.id === id) {
                task.title = title;
                task.desc = desc;
                task.priority = priority;
            }
            return task;
        });
    } else {
        // Create new task
        const newTask = {
            id: Date.now().toString(),
            title,
            desc,
            status: 'pending',
            priority,
            date: currentDate
        };
        tasks.unshift(newTask);
    }

    closeTaskModal();
    saveAndRefresh();
}

// Helper to prevent XSS injection
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Run init on load
init();