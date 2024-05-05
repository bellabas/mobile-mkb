import socket
from flask import Flask, request, render_template
import pyautogui

app = Flask(__name__)


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


@app.post("/move-mouse")
def move_mouse():
    try:
        x = request.form.get("x", type=int)
        y = request.form.get("y", type=int)
        pyautogui.moveRel(xOffset=x, yOffset=y)
    except ValueError:
        return "Bad request"
    return "Ok"


@app.post("/type-character")
def type_character():
    try:
        character = request.form.get("character", type=str)
        print(character)
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
        button = request.form.get("click", type=str)
        pyautogui.click(button=button)
    except ValueError:
        return "Bad request"
    return "Ok"


if __name__ == "__main__":
    app.run(host=IP_ADDRESS, port=PORT, debug=True)
