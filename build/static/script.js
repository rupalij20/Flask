const todoForm = document.getElementById("todoForm");
const todoTableBody = document.getElementById("todoTableBody");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("desc");
let editIndex = null;

let todos = JSON.parse(localStorage.getItem("todos")) || [];

todoForm.addEventListener("submit", (e) => {
    e.preventDefault();     //stop the webpage from reloading
    
    const todoData = {         // create a object to hold current task
        title: titleInput.value,
        desc: descInput.value,
        date: new Date().toDateString()
    };

    if (editIndex !== null) {        //It is for checking if you changing the old task or adding new.
        
        const dbId = todos[editIndex].id;
        
        todos[editIndex] = { ...todoData, id: dbId };
        localStorage.setItem("todos", JSON.stringify(todos));
        DisplayTable();
           
        updateTodoInMongoDB(dbId, todoData);    //It sends req to update task in your backend.
        editIndex = null;
    } else {
       
        addTodo(todoData);    // Create new todo item via database first
    }
    
    todoForm.reset();    //reset empty field 
});

function DisplayTable() {
    todoTableBody.innerHTML = "";
    todos.forEach((todo, index) => {
        const row = document.createElement("tr");     //create HTML <tr> item.
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
        `;            //sends dynamic data directly into row using backticks. 
        todoTableBody.appendChild(row);
    });
}

function addTodo(todoData) {
    const options = {         //config rule.
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
    };

    fetch('https://my-flask-todo-15eu.onrender.com/todo', options)      //sends req to python server.
        .then(response => response.json())          //Waits for response.
        .then(serverData => {            //checks if backend successfully save the task without error.
            if (serverData.status === "success") {
                // Read the database generated ID sent by the fixed server response.
                todoData.id = serverData.id;
                todos.push(todoData);
                localStorage.setItem("todos", JSON.stringify(todos));   //save task in localstorage in list.
                DisplayTable();
            } else {
                console.error("Server validation failed:", serverData.message);
            }
        })
        .catch(err => console.error("Failed to sync with backend server:", err));
}

function deleteTodo(index) {
    const dbId = todos[index].id;
    
    if (!dbId) {
        console.error("Action denied: This entry doesn't have an MongoDB Id.");
        return;
    }

    todos.splice(index, 1);
    localStorage.setItem("todos", JSON.stringify(todos));
    DisplayTable();

    fetch(`https://my-flask-todo-15eu.onrender.com/todo/${dbId}`, { method: 'DELETE' })
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
    if (!dbId) {
        console.error("Action denied: Missing MongoDB ID.");
        return;
    }

    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
    };

    fetch(`https://my-flask-todo-15eu.onrender.com/todo/${dbId}`, options)
        .then(response => response.json())
        .then(serverData => console.log("MongoDB updated data:", serverData))
        .catch(err => console.error("Failed to update backend server:", err));
}

DisplayTable();
