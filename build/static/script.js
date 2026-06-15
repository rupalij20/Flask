const todoForm = document.getElementById("todoForm");
const todoTableBody = document.getElementById("todoTableBody");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("desc");
let editIndex = null;

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

function addTodo(todoData) {
    const options = {                //sets the config req for sending web req
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
    };

    fetch('https://my-flask-todo-15eu.onrender.com', options)
        .then(response => response.json())
        .then(serverData => {
            if (serverData.status === "success") {
                // Read the database generated ID sent by the fixed server response
                todoData.id = serverData.id;
                todos.push(todoData);
                localStorage.setItem("todos", JSON.stringify(todos));
                DisplayTable();
            } else {
                console.error("Server validation failed:", serverData.message);
            }
        })
        .catch(err => console.error("Failed to sync with backend server:", err));
}

function deleteTodo(index) {
    const dbId = todos[index].id;

    todos.splice(index, 1);
    localStorage.setItem("todos", JSON.stringify(todos));
    DisplayTable();

    fetch(`http://localhost:5000/todo/${dbId}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => console.log("Deleted from MongoDB:", data))
        .catch(err => console.error("MongoDB delete error:", err));
}

function editTodo(index) {
    titleInput.value = todos[index].title;
    descInput.value = todos[index].desc;
    editIndex = index;
}

function updateTodoInMongoDB(dbId, todoData) {            //when editing is over and click submit this function triggers.It sends the put req to backend and replace old data to new in mongoDB

    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
    };

    fetch(`http://localhost:5000/todo/${dbId}`, options)
        .then(response => response.json())
        .catch(err => console.error("Failed to update backend server:", err));
}


DisplayTable();





