import mysql.connector as mysql

def get_connection():
    mydb = mysql.connect(
        host = "localhost",
        user = "root",
        passwd = "sql@1234",
        database = "todo_db"
        )
    return mydb



    







