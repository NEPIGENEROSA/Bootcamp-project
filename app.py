from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# No pongas nada más por ahora, Vercel solo necesita el objeto "app"