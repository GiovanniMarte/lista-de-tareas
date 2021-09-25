// state
// localStorage.clear();
let todoGroups = JSON.parse(localStorage.getItem('todoGroups')) || Array(5).fill([]);
let currentGroup = localStorage.getItem('currentGroup') || 0;
let idCounter = localStorage.getItem('idCounter') || 0;

// selectors
const root = document.querySelector('.todo');
const form = document.forms.todos;
const input = form.elements.todo;
const list = root.querySelector('.todo-list');
const clear = root.querySelector('.todo-clear');
const count = root.querySelector('.todo-count');
const tabs = root.querySelector('.todo-tabs');
const groupNumber = root.querySelector('.todo-title span');

// init
function init() {
  render(todoGroups[currentGroup]);

  form.addEventListener('submit', addTodo);
  list.addEventListener('change', updateTodo);
  list.addEventListener('dblclick', editTodo);
  list.addEventListener('click', deleteTodo);
  clear.addEventListener('click', deleteSelected);
  tabs.addEventListener('click', changeTab);
}

init();

// functions
function render(todos) {
  let todosList = '';
  todos.forEach((todo) => {
    todosList += `
    <li data-id="${todo.id}" ${todo.checked ? 'class="todo-complete"' : ''}>
      <input type="checkbox" ${todo.checked ? 'checked' : ''}>
      <input type="text" value="${todo.label}" readonly />
      <button class="clear" type="button"></button>
    </li>
    `;
  });
  list.innerHTML = todosList;

  tabs.children[currentGroup].classList.add('tab-active');
  groupNumber.innerText = parseInt(currentGroup) + 1;
  updateCounter();
  checkButtonDisplay();
}

function saveToStorage() {
  localStorage.setItem('todoGroups', JSON.stringify(todoGroups));
  localStorage.setItem('idCounter', idCounter);
  localStorage.setItem('currentGroup', currentGroup);
}

function addTodo(e) {
  e.preventDefault();
  const label = input.value.trim();
  todoGroups[currentGroup] = [
    ...todoGroups[currentGroup],
    {
      id: idCounter++,
      label,
      checked: false,
    },
  ];

  const li = document.createElement('li');
  const checkbox = document.createElement('input');
  const todoInput = document.createElement('input');
  const button = document.createElement('button');

  li.setAttribute('data-id', idCounter - 1);
  checkbox.type = 'checkbox';
  todoInput.type = 'text';
  todoInput.value = label;
  todoInput.readOnly = true;
  button.type = 'button';
  button.className = 'clear';

  li.append(checkbox, todoInput, button);
  list.appendChild(li);

  updateCounter();
  saveToStorage();
  input.value = '';
}

function updateTodo(e) {
  if (e.target.checked) {
    e.target.parentNode.classList.add('todo-complete');
  } else {
    e.target.parentNode.classList.remove('todo-complete');
  }
  const id = parseInt(e.target.parentNode.getAttribute('data-id'));
  const todoChanged = todoGroups[currentGroup].find((todo) => todo.id === id);
  todoChanged.checked = e.target.checked;
  updateCounter();
  checkButtonDisplay();
  saveToStorage();
}

function editTodo(e) {
  if (e.target.type !== 'text') return;
  const listItem = e.target.parentNode;
  const id = parseInt(listItem.getAttribute('data-id'));

  e.target.readOnly = false;
  listItem.classList.add('editing');
  e.target.addEventListener('change', handleEdit);

  function handleEdit(e) {
    e.stopPropagation();
    e.target.readOnly = true;
    listItem.classList.remove('editing');

    const todoChanged = todoGroups[currentGroup].find((todo) => todo.id === id);
    todoChanged.label = e.target.value;
    saveToStorage();
  }
}

function deleteTodo(e) {
  if (e.target.nodeName !== 'BUTTON') return;
  const listItem = e.target.parentNode;
  const todoLabel = listItem.querySelector('input[type="text"]');
  if (confirm(`¿Eliminar "${todoLabel.value}"?`)) {
    const id = parseInt(listItem.getAttribute('data-id'));
    todoGroups[currentGroup] = todoGroups[currentGroup].filter((todo) => todo.id !== id);
    list.removeChild(listItem);
    updateCounter();
    saveToStorage();
  }
}

function deleteSelected() {
  const todosSelected = list.querySelectorAll('.todo-complete');
  if (todosSelected.length === 0) return;
  if (confirm(`¿Eliminar ${todosSelected.length} tareas?`)) {
    todosSelected.forEach((todo) => list.removeChild(todo));
    todoGroups[currentGroup] = todoGroups[currentGroup].filter((todo) => !todo.checked);
    updateCounter();
    saveToStorage();
  }
}

function checkButtonDisplay() {
  const anyTrue = todoGroups[currentGroup].some((value) => value.checked);
  clear.style.display = anyTrue ? 'inline' : 'none';
}

function updateCounter() {
  count.innerText = todoGroups[currentGroup].filter((todo) => !todo.checked).length;
}

function changeTab(e) {
  if (e.target.classList[0] !== 'todo-tab' || e.target.classList[1] === 'tab-active') return;
  const groups = [...tabs.children];
  groups.forEach((group) => group.classList.remove('tab-active'));

  currentGroup = e.target.id;
  saveToStorage();
  render(todoGroups[currentGroup]);
}
