from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3, hashlib

app = Flask(__name__)
app.secret_key = "super_secret_key"

# DB初期化

def init_db():
    conn = sqlite3.connect("app.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            club_id INTEGER
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ユーザー登録
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = hashlib.sha256(request.form["password"].encode()).hexdigest()
        role = request.form.get("role", "student")
        conn = sqlite3.connect("app.db")
        c = conn.cursor()
        try:
            c.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", (username, password, role))
            conn.commit()
        except:
            return "ユーザー名は既に使われています"
        conn.close()
        return redirect(url_for("login"))
    return render_template("register.html")

# ログイン
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = hashlib.sha256(request.form["password"].encode()).hexdigest()
        conn = sqlite3.connect("app.db")
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
        user = c.fetchone()
        conn.close()
        if user:
            session["user_id"] = user[0]
            session["username"] = user[1]
            session["role"] = user[3]
            return redirect(url_for("dashboard"))
        return "ログイン失敗"
    return render_template("login.html")

# ダッシュボード
@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return redirect(url_for("login"))
    conn = sqlite3.connect("app.db")
    c = conn.cursor()
    if session["role"] == "teacher":
        c.execute("SELECT r.title, r.content, u.username, r.created_at FROM records r JOIN users u ON r.user_id=u.id ORDER BY r.created_at DESC")
    else:
        c.execute("SELECT r.title, r.content, u.username, r.created_at FROM records r JOIN users u ON r.user_id=u.id WHERE r.user_id=? ORDER BY r.created_at DESC", (session["user_id"],))
    records = c.fetchall()
    conn.close()
    return render_template("dashboard.html", records=records)

# 記録追加
@app.route("/add_record", methods=["POST"])
def add_record():
    if "user_id" not in session:
        return redirect(url_for("login"))
    title = request.form["title"]
    content = request.form["content"]
    conn = sqlite3.connect("app.db")
    c = conn.cursor()
    c.execute("INSERT INTO records (user_id, title, content) VALUES (?, ?, ?)", (session["user_id"], title, content))
    conn.commit()
    conn.close()
    return redirect(url_for("dashboard"))

if __name__ == "__main__":
    app.run(debug=True)
