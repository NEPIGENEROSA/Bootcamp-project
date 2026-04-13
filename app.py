from flask import Flask, render_template

app = Flask(__name__)

# Ruta principal: sirve el archivo index.html de la carpeta /templates
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    # El modo debug permite que la web se actualice sola cuando cambies el código
    app.run(debug=True)