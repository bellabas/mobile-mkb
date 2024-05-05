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

let previousCoordinates = null;
let touchId = null;

const handleStart = function (evt) {
    evt.preventDefault();
    const touches = evt.touches;
    touchId = touches[0].identifier;

    for (let i = 0; i < touches.length; i++) {
        previousCoordinates = { x: Math.trunc(touches[i].screenX), y: Math.trunc(touches[i].screenY) };
    }
};

const handleMove = function (evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        if (touches[i].identifier === touchId) {
            const currentCoordinates = { x: Math.trunc(touches[i].screenX), y: Math.trunc(touches[i].screenY) };
            postMoveMouse(currentCoordinates.x - previousCoordinates.x, currentCoordinates.y - previousCoordinates.y);
            previousCoordinates = currentCoordinates;
        }
    }
};

const handleEnd = function (evt) {
    evt.preventDefault();
    //previousCoordinates = null;
    touchId = null;
};

const handleCancel = function (evt) {
    evt.preventDefault();
    //previousCoordinates = null;
    touchId = null;
};

/* const handleClick = function (evt) {
    postClick("right");
} */

const startup = function () {
    const keyboard = document.getElementById("keyboard-input");
    const touchpad = document.getElementById("touchpad");

    touchpad.addEventListener("touchstart", handleStart);
    touchpad.addEventListener("touchend", handleEnd);
    touchpad.addEventListener("touchcancel", handleCancel);
    touchpad.addEventListener("touchmove", handleMove);
    //touchpad.addEventListener("click", handleClick);
};

document.addEventListener("DOMContentLoaded", startup);