from flask import Flask, render_template

app = Flask(__name__) # El objeto debe llamarse 'app' exactamente.

@app.route('/')
def index():
    return render_template('index.html')

# CRÍTICO: Sin espacios dentro de las comillas
if __name__ == "__main__":
    app.run()