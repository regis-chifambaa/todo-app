// ── State ──────────────────────────────────────────────
let currentFilter = "all";

// ── Init ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    setupEnterKey();
    setupFilters();
    updateUI();
});

// ── Enter key support ──────────────────────────────────
function setupEnterKey() {
    document.getElementById("taskInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") addTask();
    });
}

// ── Filter buttons ─────────────────────────────────────
function setupFilters() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            applyFilter();
        });
    });
}

function applyFilter() {
    const items = document.querySelectorAll("#taskList li");
    items.forEach(li => {
        const done = li.classList.contains("completed");
        let show = true;
        if (currentFilter === "active")    show = !done;
        if (currentFilter === "completed") show = done;
        li.classList.toggle("hidden", !show);
    });
    updateUI();
}

// ── Add task ───────────────────────────────────────────
function addTask() {
    const taskInput = document.getElementById("taskInput");
    const taskText  = taskInput.value.trim();
    if (!taskText) return;

    createTaskElement(taskText, false);
    saveTask(taskText, false);
    taskInput.value = "";
    applyFilter();
}

// ── Create task element ────────────────────────────────
function createTaskElement(text, completed) {
    const taskList = document.getElementById("taskList");

    const li = document.createElement("li");
    if (completed) li.classList.add("completed");

    // Checkbox
    const checkBox = document.createElement("div");
    checkBox.className = "check-box" + (completed ? " checked" : "");
    checkBox.addEventListener("click", () => toggleComplete(li, checkBox, span));

    // Task text
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = text;
    span.addEventListener("click", () => toggleComplete(li, checkBox, span));

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.addEventListener("click", () => {
        li.remove();
        updateStorage();
        applyFilter();
    });

    li.appendChild(checkBox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

function toggleComplete(li, checkBox, span) {
    li.classList.toggle("completed");
    checkBox.classList.toggle("checked");
    updateStorage();
    applyFilter();
}

// ── Clear completed ────────────────────────────────────
function clearCompleted() {
    document.querySelectorAll("#taskList li.completed").forEach(li => li.remove());
    updateStorage();
    applyFilter();
}

// ── UI state (counter + empty state + footer) ──────────
function updateUI() {
    const allTasks       = document.querySelectorAll("#taskList li");
    const activeTasks    = document.querySelectorAll("#taskList li:not(.completed)");
    const completedTasks = document.querySelectorAll("#taskList li.completed");
    const visibleTasks   = document.querySelectorAll("#taskList li:not(.hidden)");

    // Counter
    const count = activeTasks.length;
    document.getElementById("taskCounter").textContent =
        count === 1 ? "1 task remaining" : `${count} tasks remaining`;

    // Empty state
    document.getElementById("emptyState").style.display =
        visibleTasks.length === 0 ? "block" : "none";

    // Footer (only show if there are completed tasks)
    document.getElementById("listFooter").style.display =
        completedTasks.length > 0 ? "block" : "none";
}

// ── localStorage helpers ───────────────────────────────
function saveTask(text, completed) {
    const tasks = getTasks();
    tasks.push({ text, completed });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

function loadTasks() {
    getTasks().forEach(task => createTaskElement(task.text, task.completed));
}

function updateStorage() {
    const tasks = [];
    document.querySelectorAll("#taskList li").forEach(li => {
        tasks.push({
            text:      li.querySelector(".task-text").textContent,
            completed: li.classList.contains("completed")
        });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateUI();
}
