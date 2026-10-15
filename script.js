const STORAGE_KEYS = {
  tasks: "focusflow-tasks",
  theme: "focusflow-theme",
};

const FOCUS_SECONDS = 25 * 60;
const VALID_PRIORITIES = ["high", "medium", "low"];
const VALID_CATEGORIES = ["Study", "Assignments", "Work", "Personal", "Other"];
const VALID_FILTERS = ["all", "pending", "completed"];

const titleInput = document.getElementById("task-title");
const categorySelect = document.getElementById("task-category");
const prioritySelect = document.getElementById("task-priority");
const titleError = document.getElementById("title-error");
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const themeToggle = document.getElementById("theme-toggle");
const themeToggleLabel = document.getElementById("theme-toggle-label");
const filterButtons = document.querySelectorAll(".filter-button");

const statTotal = document.getElementById("stat-total");
const statCompleted = document.getElementById("stat-completed");
const statPending = document.getElementById("stat-pending");
const progressFill = document.getElementById("progress-fill");
const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");

const timerDisplay = document.getElementById("timer-display");
const timerMessage = document.getElementById("timer-message");
const startButton = document.getElementById("timer-start");
const pauseButton = document.getElementById("timer-pause");
const resetButton = document.getElementById("timer-reset");

let tasks = [];
let currentFilter = "all";
let remainingSeconds = FOCUS_SECONDS;
let timerId = null;

function createTaskId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage can fail in private browsing; the app still works for this session.
  }
}

function isValidTask(item) {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    item.title.trim() !== "" &&
    VALID_CATEGORIES.includes(item.category) &&
    VALID_PRIORITIES.includes(item.priority) &&
    typeof item.completed === "boolean"
  );
}

function loadTasks() {
  const saved = loadFromStorage(STORAGE_KEYS.tasks);
  if (!Array.isArray(saved)) {
    return [];
  }
  return saved.filter(isValidTask);
}

function saveTasks() {
  saveToStorage(STORAGE_KEYS.tasks, tasks);
}

function getPreferredTheme() {
  const saved = loadFromStorage(STORAGE_KEYS.theme);
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", nextTheme);
  saveToStorage(STORAGE_KEYS.theme, nextTheme);

  const isDark = nextTheme === "dark";
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );
  themeToggleLabel.textContent = isDark ? "Light" : "Dark";
}

function updateDashboard() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  statTotal.textContent = String(total);
  statCompleted.textContent = String(completed);
  statPending.textContent = String(pending);
  progressLabel.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  progressBar.setAttribute("aria-valuenow", String(percent));
}

function getFilteredTasks() {
  if (currentFilter === "pending") {
    return tasks.filter((task) => !task.completed);
  }
  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }
  return tasks;
}

function getEmptyMessage() {
  if (tasks.length === 0) {
    return "No tasks yet. Add one above to get started.";
  }
  if (currentFilter === "pending") {
    return "No pending tasks. Nice work.";
  }
  if (currentFilter === "completed") {
    return "No completed tasks yet.";
  }
  return "No tasks to show.";
}

function renderTasks() {
  const visibleTasks = getFilteredTasks();

  if (visibleTasks.length === 0) {
    taskList.innerHTML = `<li class="empty-state">${getEmptyMessage()}</li>`;
    return;
  }

  taskList.innerHTML = visibleTasks
    .map((task) => {
      const checked = task.completed ? "checked" : "";
      const completeClass = task.completed ? " is-complete" : "";
      const completeLabel = task.completed ? "Mark as pending" : "Mark as completed";

      return `
        <li class="task-item${completeClass}" data-id="${task.id}">
          <input
            type="checkbox"
            class="task-toggle"
            ${checked}
            aria-label="${completeLabel}: ${escapeHtml(task.title)}"
          />
          <div>
            <p class="task-title">${escapeHtml(task.title)}</p>
            <div class="task-meta">
              <span class="badge">${escapeHtml(task.category)}</span>
              <span class="badge ${task.priority}">${task.priority[0].toUpperCase()}${task.priority.slice(1)}</span>
            </div>
          </div>
          <div class="task-actions">
            <button type="button" class="ghost-button delete" data-action="delete" aria-label="Delete ${escapeHtml(task.title)}">
              Delete
            </button>
          </div>
        </li>
      `;
    })
    .join("");
}

function refreshUi() {
  updateDashboard();
  renderTasks();
}

function showTitleError(show) {
  titleError.hidden = !show;
  titleInput.setAttribute("aria-invalid", show ? "true" : "false");
}

function addTask(title, category, priority) {
  tasks.unshift({
    id: createTaskId(),
    title,
    category,
    priority,
    completed: false,
  });
  saveTasks();
  refreshUi();
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return;
  }
  task.completed = !task.completed;
  saveTasks();
  refreshUi();
}

function deleteTask(id) {
  tasks = tasks.filter((item) => item.id !== id);
  saveTasks();
  refreshUi();
}

function setFilter(filter) {
  if (!VALID_FILTERS.includes(filter)) {
    return;
  }

  currentFilter = filter;
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  renderTasks();
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);
}

function clearTimerInterval() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function finishTimer() {
  clearTimerInterval();
  remainingSeconds = 0;
  updateTimerDisplay();
  timerMessage.textContent = "Focus session complete. Time for a short break.";
}

function startTimer() {
  if (timerId !== null) {
    return;
  }

  if (remainingSeconds === 0) {
    remainingSeconds = FOCUS_SECONDS;
  }

  timerMessage.textContent = "Focus session in progress.";
  updateTimerDisplay();

  timerId = setInterval(() => {
    remainingSeconds -= 1;
    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      finishTimer();
    }
  }, 1000);
}

function pauseTimer() {
  clearTimerInterval();
  if (remainingSeconds > 0 && remainingSeconds < FOCUS_SECONDS) {
    timerMessage.textContent = "Timer paused.";
  }
}

function resetTimer() {
  clearTimerInterval();
  remainingSeconds = FOCUS_SECONDS;
  updateTimerDisplay();
  timerMessage.textContent = "";
}

function handleFormSubmit(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const category = categorySelect.value;
  const priority = prioritySelect.value;

  if (!title) {
    showTitleError(true);
    titleInput.focus();
    return;
  }

  if (!VALID_CATEGORIES.includes(category) || !VALID_PRIORITIES.includes(priority)) {
    return;
  }

  showTitleError(false);
  addTask(title, category, priority);
  taskForm.reset();
  prioritySelect.value = "medium";
  titleInput.focus();
}

function handleTaskListClick(event) {
  const item = event.target.closest(".task-item");
  if (!item) {
    return;
  }

  const id = item.dataset.id;

  if (event.target.classList.contains("task-toggle")) {
    toggleTask(id);
    return;
  }

  if (event.target.closest("[data-action='delete']")) {
    deleteTask(id);
  }
}

function init() {
  tasks = loadTasks();
  applyTheme(getPreferredTheme());
  refreshUi();
  updateTimerDisplay();

  taskForm.addEventListener("submit", handleFormSubmit);
  titleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      taskForm.requestSubmit();
    }
  });
  titleInput.addEventListener("input", () => {
    if (titleInput.value.trim()) {
      showTitleError(false);
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  taskList.addEventListener("click", handleTaskListClick);
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  startButton.addEventListener("click", startTimer);
  pauseButton.addEventListener("click", pauseTimer);
  resetButton.addEventListener("click", resetTimer);
}

init();
