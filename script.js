// ── State ──────────────────────────────────────────────
let currentFilter = "all";

// ── Init ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    setupEnterKey();
    setupFilters();
    setupEventDelegation();
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

// ── Event Delegation for task list ─────────────────────
function setupEventDelegation() {
    const taskList = document.getElementById("taskList");
    taskList.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".delete-btn");
        const checkBox = e.target.closest(".check-box");
        const taskText = e.target.closest(".task-text");

        if (deleteBtn) {
            const li = deleteBtn.closest("li");
            li.remove();
            updateStorage();
            applyFilter();
        } else if (checkBox || taskText) {
            const li = checkBox ? checkBox.closest("li") : taskText.closest("li");
            toggleComplete(li);
        }
    });
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
    li.setAttribute("role", "listitem");
    if (completed) li.classList.add("completed");

    // Checkbox
    const checkBox = document.createElement("div");
    checkBox.className = "check-box" + (completed ? " checked" : "");

    // Task text
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = text;

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("aria-label", "Delete task");

    li.appendChild(checkBox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

function toggleComplete(li) {
    li.classList.toggle("completed");
    li.querySelector(".check-box").classList.toggle("checked");
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
    try {
        const tasks = getTasks();
        tasks.push({ text, completed });
        localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
        if (error.name === "QuotaExceededError") {
            console.error("localStorage quota exceeded. Could not save task.");
        } else if (error.name === "SecurityError") {
            console.error("localStorage is not accessible. Tasks will not persist.");
        } else {
            console.error("Error saving task:", error);
        }
    }
}

function getTasks() {
    try {
        return JSON.parse(localStorage.getItem("tasks")) || [];
    } catch (error) {
        console.error("Error retrieving tasks:", error);
        return [];
    }
}

function loadTasks() {
    try {
        getTasks().forEach(task => createTaskElement(task.text, task.completed));
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

function updateStorage() {
    try {
        const tasks = [];
        document.querySelectorAll("#taskList li").forEach(li => {
            tasks.push({
                text:      li.querySelector(".task-text").textContent,
                completed: li.classList.contains("completed")
            });
        });
        localStorage.setItem("tasks", JSON.stringify(tasks));
        updateUI();
    } catch (error) {
        if (error.name === "QuotaExceededError") {
            console.error("localStorage quota exceeded. Could not update storage.");
        } else if (error.name === "SecurityError") {
            console.error("localStorage is not accessible. Changes will not persist.");
        } else {
            console.error("Error updating storage:", error);
        }
    }
}
