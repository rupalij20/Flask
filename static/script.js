const todoForm = document.getElementById("todoForm");
const todoTableBody = document.getElementById("todoTableBody");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("desc");
let editIndex = null;

// Your precise backend URL definition
const BACKEND_URL = "https://my-flask-todo-15eu.onrender.com";

let todos = JSON.parse(localStorage.getItem("todos")) || [];

todoForm.addEventListener("submit", (e) => {
    e.preventDefault();       // stops the webpage from reloading
    
    const todoData = {      //create object to hold current task
        title: titleInput.value,
        desc: descInput.value,
        date: new Date().toDateString()
    };

    if (editIndex !== null) {
        // Extract the absolute database ID stored with this todo item
        const dbId = todos[editIndex].id;
        
        // Update local memory and preserve its id
        todos[editIndex] = { ...todoData, id: dbId };
        localStorage.setItem("todos", JSON.stringify(todos));
        DisplayTable();
        
        // Sync update with database
        updateTodoInMongoDB(dbId, todoData);
        editIndex = null;
    } else {
        // Create new todo item via database first
        addTodo(todoData);
    }
    
    todoForm.reset();
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

async function addTodo(todoData) {
    try {
        const response = await fetch(
            `${BACKEND_URL}/todo`, 
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(todoData)
            }
        );

        const serverData = await response.json();

        if (response.ok && serverData.status === "success") {
            todoData.id = serverData.id;
            todos.push(todoData);
            localStorage.setItem("todos", JSON.stringify(todos));
            DisplayTable();
        } else {
            console.error(serverData.message);
        }
    } catch (err) {
        console.error("Failed to sync with backend:", err);
    }
}

function deleteTodo(index) {
    const dbId = todos[index].id;

    todos.splice(index, 1);
    localStorage.setItem("todos", JSON.stringify(todos));
    DisplayTable();

    fetch(`${BACKEND_URL}/todo/${dbId}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => console.log("Deleted from MongoDB:", data))
        .catch(err => console.error("MongoDB delete error:", err));
}

function editTodo(index) {
    titleInput.value = todos[index].title;
    descInput.value = todos[index].desc;
    editIndex = index;
}

function updateTodoInMongoDB(dbId, todoData) {
    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
    };

    fetch(`${BACKEND_URL}/todo/${dbId}`, options)
        .then(response => response.json())
        .catch(err => console.error("Failed to update backend server:", err));
}

DisplayTable();
