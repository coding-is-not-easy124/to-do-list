const addBtn = document.querySelector('.btn-add-task');
const tasksSectionDue = document.querySelector('.due-tasks');
const tasksSectionUpcoming = document.querySelector('.upcoming-tasks');
const searchInput = document.querySelector('.search-input');
const errorMessage = document.querySelector('.error-message');
const errorCloseBtn = document.querySelector('.close-error');

const inputTask = document.querySelector('.input-task');
const inputDate = document.querySelector('.input-date');
const inputTime = document.querySelector('.input-time');

let tasks = [];

window.addEventListener('DOMContentLoaded', () => {
  const storedTasks = localStorage.getItem('tasks');
  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
  }
  renderTasks();
});

function formatTime(time24) {
  if (!time24) return 'No time set';
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function showError(message) {
  errorMessage.querySelector('span').textContent = message;
  errorMessage.style.display = 'flex';
}

function hideError() {
  errorMessage.style.display = 'none';
}

errorCloseBtn.addEventListener('click', hideError);

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks(filter = '') {
  tasksSectionDue.innerHTML = '';
  tasksSectionUpcoming.innerHTML = '';

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDateObj = new Date(todayStr);

  let filteredTasks = tasks;
  if (filter.trim() !== '') {
    const lowerFilter = filter.toLowerCase();
    filteredTasks = tasks.filter(t =>
      t.task.toLowerCase().includes(lowerFilter)
    );
  }

  const groupedDueTasks = {};
  const groupedUpcomingTasks = {};

  filteredTasks.forEach(task => {
    const taskDateObj = new Date(task.date);

    const keyDateFormatted = formatDate(task.date);

    if (taskDateObj < todayDateObj) {
      if (!groupedDueTasks[keyDateFormatted]) groupedDueTasks[keyDateFormatted] = [];
      groupedDueTasks[keyDateFormatted].push(task);
    } else if (taskDateObj.getTime() === todayDateObj.getTime()) {
      if (!groupedDueTasks['Today']) groupedDueTasks['Today'] = [];
      groupedDueTasks['Today'].push(task);
    } else {
      if (!groupedUpcomingTasks[keyDateFormatted]) groupedUpcomingTasks[keyDateFormatted] = [];
      groupedUpcomingTasks[keyDateFormatted].push(task);
    }
  });

  function createTaskGroup(container, groupName, taskList) {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('task-day-group');

    const heading = document.createElement('h3');
    heading.textContent = groupName;
    groupDiv.appendChild(heading);

    taskList.forEach(task => {
      const taskDiv = document.createElement('div');
      taskDiv.classList.add('task-item');

      const textSpan = document.createElement('span');
      textSpan.classList.add('task-text');
      textSpan.textContent = task.task;

      const timeSpan = document.createElement('span');
      timeSpan.classList.add('task-time');
      timeSpan.textContent = `at ${formatTime(task.time)}`;

      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('task-actions');

      const editBtn = document.createElement('button');
      editBtn.classList.add('edit-btn');
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => handleEditTask(task.id));

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete-btn');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => handleDeleteTask(task.id));

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      taskDiv.appendChild(textSpan);
      taskDiv.appendChild(timeSpan);
      taskDiv.appendChild(actionsDiv);

      groupDiv.appendChild(taskDiv);
    });

    container.appendChild(groupDiv);
  }

  if (Object.keys(groupedDueTasks).length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.classList.add('empty-state');
    emptyMsg.textContent = 'No due tasks';
    tasksSectionDue.appendChild(emptyMsg);
  } else {
    for (const dateGroup in groupedDueTasks) {
      createTaskGroup(tasksSectionDue, dateGroup, groupedDueTasks[dateGroup]);
    }
  }

  if (Object.keys(groupedUpcomingTasks).length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.classList.add('empty-state');
    emptyMsg.textContent = 'No upcoming tasks';
    tasksSectionUpcoming.appendChild(emptyMsg);
  } else {
    for (const dateGroup in groupedUpcomingTasks) {
      createTaskGroup(tasksSectionUpcoming, dateGroup, groupedUpcomingTasks[dateGroup]);
    }
  }
}

function handleAddTask(event) {
  event.preventDefault();
  hideError();

  const taskVal = inputTask.value.trim();
  const dateVal = inputDate.value;
  const timeVal = inputTime.value;

  if (!taskVal || !dateVal || !timeVal) {
    showError('Please fill in all fields');
    return;
  }

    tasks.push({
    id: Date.now(),
    task: taskVal,
    date: dateVal,
    time: timeVal,
  });

  saveTasks();
  renderTasks(searchInput.value);

  inputTask.value = '';
  inputDate.value = '';
  inputTime.value = '';
}

function handleDeleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks(searchInput.value);
}

function handleEditTask(id) {
  const taskToEdit = tasks.find(t => t.id === id);
  if (!taskToEdit) return;

  const newTaskText = prompt('Edit task:', taskToEdit.task);
  if (newTaskText !== null && newTaskText.trim() !== '') {
    taskToEdit.task = newTaskText.trim();
    saveTasks();
    renderTasks(searchInput.value);
  }
}

function handleSearch() {
  renderTasks(searchInput.value);
}

addBtn.addEventListener('click', handleAddTask);
searchInput.addEventListener('input', handleSearch);
