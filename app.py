import socket
from flask import Flask
from flask import request
from flask import render_template
import pyautogui

app = Flask(__name__)


def get_ipv4_address():
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as st:
        st.connect(("8.8.8.8", 80))
        ipv4_address = st.getsockname()[0]
    return ipv4_address


ip_address = get_ipv4_address()
port = 5000


@app.route("/")
def index():
    return render_template('index.html', ip_address=ip_address, port=port)


@app.get('/move-mouse')
def move_mouse():
    x = request.args.get('x', type=int)
    y = request.args.get('y', type=int)
    # moveRel(xOffset=x, yOffset=y)
    pyautogui.moveTo(x, y)
    return f"x: {x} , y: {y}"


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


if __name__ == "__main__":
    app.run(host=ip_address, port=port)
