const todoForm = document.getElementById("todoForm");
const todoTableBody = document.getElementById("todoTableBody");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("desc");
let editIndex = null;

// Load existing todos from localStorage
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// FIXED: Use a single "submit" event listener on the form itself
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTodo = {
    title: titleInput.value,
    desc: descInput.value,
    date: new Date().toDateString()
  };

  if (editIndex !== null) {
    todos[editIndex] = newTodo;
    editIndex = null;
  } else {
    todos.push(newTodo);
  }

  localStorage.setItem("todos", JSON.stringify(todos));
  todoForm.reset();
  DisplayTable();


  addTodo(newTodo);
});

function DisplayTable() {
  todoTableBody.innerHTML = "";

  todos.forEach((todo, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${todo.title}</td>
            <td>${todo.desc}</td>
            <td>${todo.date}</td>
            <td>
            <div class="d-flex flex-row gap-2 align-items-center">
                <button class="btn btn-danger btn-sm" onclick="deleteTodo(${index})">DELETE</button>
                <button class="btn btn-warning btn-sm" onclick="editTodo(${index})">EDIT</button>
            </div>
            </td>
            `;
    todoTableBody.appendChild(row);
  });
}

function deleteTodo(index) {
  todos.splice(index, 1);
  localStorage.setItem("todos", JSON.stringify(todos));
  DisplayTable();
}

function editTodo(index) {
  titleInput.value = todos[index].title;
  descInput.value = todos[index].desc;
  editIndex = index;
}

function addTodo(data) {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data)
  };

  fetch('http://localhost:5000/todo', options)
    .then(response => response.json())
    .then(serverData => {
      console.log("Server saved data:", serverData);
    })
    .catch(err => {
      console.error("Failed to sync with backend server:", err);
    });
}


DisplayTable();



