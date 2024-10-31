import logging
import socket
import webbrowser
import secrets
import pyautogui
import json
from flask import Flask, request, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex()
socketio = SocketIO(app, async_mode="threading")
log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)
pyautogui.FAILSAFE = False

IP_ADDRESS = ""
PORT = 5000
mouse_multiplier = 0
scroll_multiplier = 0


def get_ipv4_address():
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as st:
        st.connect(("8.8.8.8", 80))
        ipv4_address = st.getsockname()[0]
    return ipv4_address


def load_settings():
    global mouse_multiplier
    global scroll_multiplier
    try:
        with open("settings.json", "r") as file:
            data = json.load(file)
            mouse_multiplier = data.get("mouseMultiplier")
            scroll_multiplier = data.get("scrollMultiplier")
    except Exception:
        mouse_multiplier = 1
        scroll_multiplier = 1


@app.route("/")
def index():
    return render_template("index.html", IP_ADDRESS=IP_ADDRESS, PORT=PORT,
                           MOUSE_MULTIPLIER=mouse_multiplier, SCROLL_MULTIPLIER=scroll_multiplier)


@app.post("/type-character")
def type_character():
    try:
        character = request.form.get("character", type=str)
        if character == "Enter" or character == "Backspace":
            pyautogui.press(character.lower())
        else:
            pyautogui.write(character)
    except ValueError:
        return "Bad request"
    return "Ok"


@app.post("/click")
def click_response():
    try:
        button = request.form.get("button", type=str)
        pyautogui.click(button=button)
    except ValueError:
        return "Bad request"
    return "Ok"


@app.post("/multiplier-change")
def multiplier_change():
    global mouse_multiplier
    global scroll_multiplier
    try:
        mouse_multiplier = request.form.get("mouseMultiplier", type=int)
        scroll_multiplier = request.form.get("scrollMultiplier", type=int)
        jsonData = json.dumps(
            {"mouseMultiplier": mouse_multiplier, "scrollMultiplier": scroll_multiplier})
        with open("settings.json", "w") as file:
            file.write(jsonData)
    except Exception:
        return "Bad request"
    return "Ok"


@socketio.on("move-mouse")
def handle_move_mouse(delta_coordinates):
    x = int(delta_coordinates["x"]) * mouse_multiplier
    y = int(delta_coordinates["y"]) * mouse_multiplier
    pyautogui.moveRel(xOffset=x, yOffset=y)


@socketio.on("scrolling")
def handle_scrolling(delta_coordinates):
    y = int(delta_coordinates["y"]) * scroll_multiplier
    pyautogui.scroll(y)


@socketio.on_error()
def error_handler(e):
    print(e)


if __name__ == "__main__":
    IP_ADDRESS = get_ipv4_address()
    load_settings()
    webbrowser.open(f"https://{IP_ADDRESS}:{PORT}", new=0, autoraise=True)
    socketio.run(app, host=IP_ADDRESS, port=PORT,
                 debug=True, allow_unsafe_werkzeug=True, ssl_context="adhoc")
