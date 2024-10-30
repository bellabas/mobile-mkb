import socket
import webbrowser
import secrets
import pyautogui
from flask import Flask, request, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex()
socketio = SocketIO(app, async_mode="threading")
pyautogui.FAILSAFE = False


def get_ipv4_address():
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as st:
        st.connect(("8.8.8.8", 80))
        ipv4_address = st.getsockname()[0]
    return ipv4_address


IP_ADDRESS = get_ipv4_address()
PORT = 5000


@app.route("/")
def index():
    return render_template("index.html", IP_ADDRESS=IP_ADDRESS, PORT=PORT)


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


@socketio.on("move-mouse")
def handle_move_mouse(delta_coordinates):
    multiplier = int(delta_coordinates["multiplier"])
    x = int(delta_coordinates["x"]) * multiplier
    y = int(delta_coordinates["y"]) * multiplier
    pyautogui.moveRel(xOffset=x, yOffset=y)


@socketio.on("scrolling")
def handle_scrolling(delta_coordinates):
    multiplier = int(delta_coordinates["multiplier"])
    y = int(delta_coordinates["y"]) * multiplier
    pyautogui.scroll(y)


@socketio.on_error()
def error_handler(e):
    print(e)


if __name__ == "__main__":
    webbrowser.open(f"https://{IP_ADDRESS}:{PORT}", new=0, autoraise=True)
    socketio.run(app, host=IP_ADDRESS, port=PORT,
                 debug=True, allow_unsafe_werkzeug=True, ssl_context="adhoc")
