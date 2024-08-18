import socket
import webbrowser
import json
import pyautogui
import secrets
from flask import Flask, request, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex()
socketio = SocketIO(app)


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


# @app.post("/move-mouse")
# def move_mouse():
#     try:
#         x = request.form.get("x", type=int)
#         y = request.form.get("y", type=int)
#         pyautogui.moveRel(xOffset=x, yOffset=y)
#     except ValueError:
#         return "Bad request"
#     return "Ok"


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
def handle_my_custom_event(json_data):
    parsed_json_data = json.loads(json_data)
    x = int(parsed_json_data["x"])
    y = int(parsed_json_data["y"])
    pyautogui.moveRel(xOffset=x, yOffset=y)


if __name__ == "__main__":
    webbrowser.open(f"https://{IP_ADDRESS}:{PORT}", new=0, autoraise=True)
    # app.run(host=IP_ADDRESS, port=PORT, ssl_context='adhoc')
    socketio.run(app, host=IP_ADDRESS, port=PORT,
                 allow_unsafe_werkzeug=True, ssl_context='adhoc')
