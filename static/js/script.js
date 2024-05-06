//=========================================== V A R I A B L E S ===========================================
const keyboard = document.getElementById("keyboard-input");
const touchpad = document.getElementById("touchpad");



//=========================================== A P I C A L L S ===========================================

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



//=========================================== K E Y B O A R D ===========================================

const handleKeyDown = function (evt) {
    //evt.preventDefault();

    //alert(`keydown full: ${evt.target.value}`);
    //alert(`keydown evt.key: ${evt.key}`);

    if (evt.key != "Unidentified") {
        postTypeCharacter(evt.key);
    }
};

const handleKeyUp = function (evt) {
    //evt.preventDefault();

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



//=========================================== M O U S E ===========================================

let startCoordinates = null;
let pastCoordinates = null;
let startTouchId = null;

const handleStart = function (evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;

    startTouchId = touches[0].identifier;
    startCoordinates = createCoordinateObj(touches[0]);

    pastCoordinates = startCoordinates;

    removeKeyboardFocus();
};

const handleMove = function (evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;

    if (touches[0].identifier === startTouchId) {
        const currentCoordinates = createCoordinateObj(touches[0]);
        const deltaCoordinates = calculateIntDeltaCoordinates(currentCoordinates, pastCoordinates);

        if (deltaCoordinates.deltaX != 0 || deltaCoordinates.deltaY != 0) {
            postMoveMouse(deltaCoordinates.deltaX, deltaCoordinates.deltaY);
        }

        pastCoordinates = currentCoordinates;
    }
};

const handleEnd = function (evt) {
    //evt.preventDefault();
    const touches = evt.changedTouches;
    const endCoordinates = createCoordinateObj(touches[0]);

    checkLeftClick(startCoordinates, endCoordinates);

    resetTouchVariables();
};

const handleCancel = function (evt) {
    //evt.preventDefault();
    resetTouchVariables();
};

const checkLeftClick = function (startCoordinates, endCoordinates) {
    const deltaCoordinates = calculateIntDeltaCoordinates(startCoordinates, endCoordinates);

    if (deltaCoordinates.deltaX == 0 && deltaCoordinates.deltaY == 0) {
        postClick("left");
    }
};

const createCoordinateObj = function (touchObj) {
    return { x: touchObj.screenX, y: touchObj.screenY };
};

const calculateIntDeltaCoordinates = function (current, past) {
    const deltaX = Math.trunc(current.x - past.x);
    const deltaY = Math.trunc(current.y - past.y);
    return { deltaX: deltaX, deltaY: deltaY };
};

const resetTouchVariables = function () {
    pastCoordinates = null;
    startTouchId = null;
};

const removeKeyboardFocus = function () {
    keyboard.blur();
};



//=========================================== S T A R T U P ===========================================

const startup = function () {
    keyboard.addEventListener("keydown", handleKeyDown);
    keyboard.addEventListener("keyup", handleKeyUp);

    touchpad.addEventListener("touchstart", handleStart);
    touchpad.addEventListener("touchend", handleEnd);
    touchpad.addEventListener("touchcancel", handleCancel);
    touchpad.addEventListener("touchmove", handleMove);
};

document.addEventListener("DOMContentLoaded", startup);
