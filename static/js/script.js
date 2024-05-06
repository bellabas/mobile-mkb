//=========================================== V A R I A B L E S ===========================================
const keyboard = document.getElementById("keyboard-input");
const touchpad = document.getElementById("touchpad");

let clickAllowed = true;


//=========================================== A P I C A L L ===========================================

const postToServer = function (endpoint, data) {
    let formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }

    fetch(endpoint, {
        method: "POST",
        body: formData,
    }).catch(error => {
        console.error('Error:', error);
    });
};



//=========================================== K E Y B O A R D ===========================================

const handleKeyDown = function (evt) {
    //alert(`keydown full: ${evt.target.value}`);
    //alert(`keydown evt.key: ${evt.key}`);

    if (evt.key != "Unidentified") {
        postToServer("/type-character", { character: evt.key });
    }
};

const handleKeyUp = function (evt) {
    //alert(`keyup full: ${evt.target.value}`);
    //alert(`keyup evt.key: ${evt.key}`);

    if (evt.key === "Unidentified") {
        const fullValue = evt.target.value;
        const currChar = fullValue[fullValue.length - 1];
        postToServer("/type-character", { character: currChar });
    }
};

const handleKeyboardFocusOut = function (evt) {
    clickAllowed = false;
}



//=========================================== M O U S E ===========================================

let startCoordinates = null;
let pastCoordinates = null;
let startTouchId = null;

const handleTouchStart = function (evt) {
    const touches = evt.changedTouches;

    startTouchId = touches[0].identifier;
    startCoordinates = createCoordinateObj(touches[0]);

    pastCoordinates = startCoordinates;

    removeKeyboardFocus();
};

const handleTouchMove = function (evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;

    if (touches[0].identifier === startTouchId) {
        const currentCoordinates = createCoordinateObj(touches[0]);
        const deltaCoordinates = calculateIntDeltaCoordinates(currentCoordinates, pastCoordinates);

        const moveThreshold = 5;
        if (Math.abs(deltaCoordinates.deltaX) >= moveThreshold || Math.abs(deltaCoordinates.deltaY) >= moveThreshold) {
            postToServer("/move-mouse", { x: deltaCoordinates.deltaX, y: deltaCoordinates.deltaY });
            pastCoordinates = currentCoordinates;
        }
    }
};

const handleTouchEnd = function (evt) {
    const touches = evt.changedTouches;
    const endCoordinates = createCoordinateObj(touches[0]);

    if (clickAllowed) {
        checkLeftClick(startCoordinates, endCoordinates);
    }
    else {
        clickAllowed = true;
    }

    resetTouchVariables();
};

const handleTouchCancel = function (evt) {
    resetTouchVariables();
};

const checkLeftClick = function (startCoordinates, endCoordinates) {
    const deltaCoordinates = calculateIntDeltaCoordinates(startCoordinates, endCoordinates);
    const CLICK_THRESHOLD = 1;
    if (Math.abs(deltaCoordinates.deltaX) <= CLICK_THRESHOLD && Math.abs(deltaCoordinates.deltaY) <= CLICK_THRESHOLD) {
        postToServer("/click", { button: "left" });
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
    keyboard.addEventListener("focusout", handleKeyboardFocusOut);
    keyboard.addEventListener("keydown", handleKeyDown);
    keyboard.addEventListener("keyup", handleKeyUp);

    touchpad.addEventListener("touchstart", handleTouchStart);
    touchpad.addEventListener("touchmove", handleTouchMove, { passive: false });
    touchpad.addEventListener("touchend", handleTouchEnd);
    touchpad.addEventListener("touchcancel", handleTouchCancel);
};

document.addEventListener("DOMContentLoaded", startup);
