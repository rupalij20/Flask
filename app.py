import json
from flask_cors import CORS
from flask import Flask, render_template, request, jsonify
from sql_connection import get_connection

app = Flask(__name__)
CORS(app)

todos = []

@app.route("/about")
def about():
    return render_template('about.html')

@app.route('/')
def home():
    conn = get_connection()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute(
                '''
                CREATE TABLE IF NOT EXISTS Todos(
                    ID INT AUTO_INCREMENT PRIMARY KEY,
                    TITLE VARCHAR(200) NOT NULL,
                    DESCRIPTION VARCHAR(500) NOT NULL,
                    DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                '''
            )
            conn.commit()
            cur.close()
            conn.close()
            return render_template('index.html')
        except Exception as e:
            return f"Error : {str(e)}"
    else:
        return "Failed to connect"

@app.route('/todo', methods=['POST'])
def data():
    request_data = request.get_json()
    if not request_data:
        return jsonify({"status": "error", "message": "No JSON data received"}), 400
        
    title = request_data.get('title')
    desc = request_data.get('desc')
    
    conn = get_connection()
    if conn:
        try:
            cur = conn.cursor()
            query = '''
                INSERT INTO Todos (TITLE, DESCRIPTION) VALUES (%s, %s)
            '''
            cur.execute(query, (title, desc))
            conn.commit()
            inserted_id = cur.lastrowid  # Grab the newly generated database ID
            cur.close()
            conn.close()
            
            # FIXED: Added "id": inserted_id to the response dictionary below
            return jsonify({
                "status": "success", 
                "message": "Todo added successfully!",
                "id": inserted_id 
            }), 201
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    else:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500

@app.route('/todo/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    conn = get_connection()
    if conn:
        try:
            cur = conn.cursor()
            query = '''
                DELETE FROM Todos WHERE ID = %s
            '''
            cur.execute(query, (todo_id,))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"status": "success", "message": "Todo deleted successfully!"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    else:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500

@app.route('/todo/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    request_data = request.get_json()
    title = request_data.get('title')
    desc = request_data.get('desc')
    
    conn = get_connection()
    if conn:
        try:
            cur = conn.cursor()
            query = '''
                UPDATE Todos SET TITLE = %s, DESCRIPTION = %s WHERE ID = %s
            '''
            cur.execute(query, (title, desc, todo_id))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"status": "success", "message": "Todo updated successfully!"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    else:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500

if __name__ == "__main__":
    app.run(debug=True)


