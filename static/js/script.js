const postMoveMouse = function (x, y) {
    const endpoint = "/move-mouse";

    let data = new FormData();
    data.append("x", x);
    data.append("y", y);

    fetch(endpoint, {
        "method": "POST",
        "body": data,
    });
};

const postTypeCharacter = function (character) {
    const endpoint = "/type-character";

    let data = new FormData();
    data.append("character", character);

    fetch(endpoint, {
        "method": "POST",
        "body": data,
    });
};

const postClick = function (button) {
    const endpoint = "/click";

    let data = new FormData();
    data.append("click", button);

    fetch(endpoint, {
        "method": "POST",
        "body": data,
    });
};

//==========KEYBOARD==========

const handleKeyDown = function (evt) {
    //evt.preventDefault();
    const keyboard = document.getElementById("keyboard-input");

    //alert(`keydown full: ${evt.target.value}`);
    //alert(`keydown evt.key: ${evt.key}`);

    if (evt.key != "Unidentified") {
        postTypeCharacter(evt.key);
    }
};

const handleKeyUp = function (evt) {
    //evt.preventDefault();
    const keyboard = document.getElementById("keyboard-input");

    //alert(`keyup full: ${evt.target.value}`);
    //alert(`keyup evt.key: ${evt.key}`);

    // if (evt.key === "Unidentified" && evt.key != "Enter" && evt.key != "Backspace") {
    //     const fullValue = evt.target.value;
    //     const currChar = fullValue[fullValue.length - 1];
    //     postTypeCharacter(currChar);
    // }
    // else if (evt.key != "Unidentified" && evt.key != "Enter" && evt.key != "Backspace") {
    //     postTypeCharacter(evt.key);
    // }
};

//==========MOUSE==========

let startCoordinates = null;
let previousCoordinates = null;
let touchId = null;

const handleStart = function (evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;
    touchId = touches[0].identifier;

    previousCoordinates = { x: Math.trunc(touches[0].screenX), y: Math.trunc(touches[0].screenY) };
    startCoordinates = previousCoordinates;
};

const handleMove = function (evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;

    if (touches[0].identifier === touchId) {
        const currentCoordinates = { x: Math.trunc(touches[0].screenX), y: Math.trunc(touches[0].screenY) };
        postMoveMouse(currentCoordinates.x - previousCoordinates.x, currentCoordinates.y - previousCoordinates.y);
        previousCoordinates = currentCoordinates;
    }
};

const handleEnd = function (evt) {
    //evt.preventDefault();
    const touches = evt.changedTouches;
    const endCoordinates = { x: Math.trunc(touches[0].screenX), y: Math.trunc(touches[0].screenY) };
    if (Math.abs(startCoordinates.x - endCoordinates.x) <= 2 && Math.abs(startCoordinates.y - endCoordinates.y) <= 2) {
        postClick("left");
    }
    //previousCoordinates = null;
    touchId = null;
};

const handleCancel = function (evt) {
    //evt.preventDefault();
    //previousCoordinates = null;
    touchId = null;
};

const startup = function () {
    const keyboard = document.getElementById("keyboard-input");
    const touchpad = document.getElementById("touchpad");

    keyboard.addEventListener("keydown", handleKeyDown);
    keyboard.addEventListener("keyup", handleKeyUp);

    touchpad.addEventListener("touchstart", handleStart);
    touchpad.addEventListener("touchend", handleEnd);
    touchpad.addEventListener("touchcancel", handleCancel);
    touchpad.addEventListener("touchmove", handleMove);
};

document.addEventListener("DOMContentLoaded", startup);