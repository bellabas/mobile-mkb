from flask import Flask
from flask import request
from flask import render_template

app = Flask(__name__)


@app.route("/")
def index():
    return render_template('index.html')


@app.post('/move-mouse')
def move_mouse():
    x = request.args.get('x', type=int)
    y = request.args.get('y', type=int)
    return


@app.post('/type-character')
def type_character():
    char = request.args.get('char', type=str)
    return


@app.post('/click')
def send_click():
    return


@app.get('/click')
def click_response():
    return
