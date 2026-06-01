import json

from flask_cors import CORS
from flask import Flask, render_template, request , jsonify

app = Flask(__name__)
CORS(app) 
JSON_FILE = 'todo.json'

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/about")
def about():
    return render_template('about.html')


todos = []

#GET all todos
@app.route('/todo', methods=['GET'])
def get_todos():

    with open("/Users/fmg/Desktop/flask/data/todo.json",'r') as file:
        file_data = json.load(file)
    
    print(file_data)

    return jsonify({
        "todos": file_data,
        "total": len(file_data)
    })


# GET a single user by ID
@app.route('/todo/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):

    with open('/Users/fmg/Desktop/flask/data/todo.json', 'r') as file:
        file_todos = json.load(file)
    
    todo = next((t for t in file_todos if t['id'] == todo_id), None)

    if not todo:
        return jsonify({"error": "todo not found"}), 404

    return jsonify({"todo": todo}), 200



# POST Method
@app.route('/todo', methods=['POST'])

def create_todo():
    # 1. Get the JSON data from the request
    data = request.get_json()
    
    # 2. Validate the data
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if 'title' not in data or 'desc' not in data:
        return jsonify({
            "error": "Missing required fields",
            "required": ["title", "desc"]
        }), 400
        
    # 3. Create new user and append to list
    new_todo = {
        "id": len(todos) + 1,
        "title": data['title'],
        "desc": data['desc']
    }
    todos.append(new_todo)
    
    # 4. Save to the JSON file FIRST
    with open("/Users/fmg/Desktop/flask/data/todo.json", "w", encoding="utf-8") as f:
        json.dump(todos, f, indent=4)

    # 5. FINALLY, return the response to the user
    return jsonify({
        "message": "User created successfully!",
        "todos": new_todo
    }), 201




#   DELETE METHOD

@app.route('/todo/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    
    with open('/Users/fmg/Desktop/flask/data/todo.json', 'r') as file:
        file_todos = json.load(file)
        
    todo_to_delete = next((t for t in file_todos if t['id'] == todo_id), None)
    
    if not todo_to_delete:
        return jsonify({"error": "todo not found"}), 404
        
    updated_todos = [t for t in file_todos if t['id'] != todo_id]
    
    with open('/Users/fmg/Desktop/flask/data/todo.json', 'w') as file:
        json.dump(updated_todos, file, indent=4)
        
    return jsonify({
        "message": f"{todo_id} deleted successfully",
        "deleted_todo": todo_to_delete
    }), 200


if __name__ == "__main__":
    app.run(debug=True)
