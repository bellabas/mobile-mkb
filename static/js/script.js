//=========================================== V A R I A B L E S ===========================================

const keyboard = document.getElementById("keyboard-input");
const leftMouseButton = document.getElementById("left-click-button-input");
const rightMouseButton = document.getElementById("right-click-button-input");
const touchpad = document.getElementById("touchpad");

const mouseSensitivityMinusButton = document.getElementById("mouse-sensitivity-multiplier-minus");
const mouseSensitivityPlusButton = document.getElementById("mouse-sensitivity-multiplier-plus");
const scrollSensitivityMinusButton = document.getElementById("scroll-sensitivity-multiplier-minus");
const scrollSensitivityPlusButton = document.getElementById("scroll-sensitivity-multiplier-plus");
const mouseSensitivityMultiplier = document.getElementById("mouse-sensitivity-multiplier");
const scrollSensitivityMultiplier = document.getElementById("scroll-sensitivity-multiplier");

let clickAllowed = true;

const socket = io();



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


//=========================================== S E T T I N G S ===========================================

const handleMouseSensitivityMinus = function (evt) {
    let currValue = parseInt(mouseSensitivityMultiplier.innerHTML);
    if (currValue > 1) {
        mouseSensitivityMultiplier.innerHTML = currValue - 1;
    }
    //button state managements
    if (currValue - 1 == 1) {
        mouseSensitivityMinusButton.classList.add("disabled");
    }
    if (currValue == 9) {
        mouseSensitivityPlusButton.classList.remove("disabled");
    }
};

const handleMouseSensitivityPlus = function (evt) {
    let currValue = parseInt(mouseSensitivityMultiplier.innerHTML);
    if (currValue < 9) {
        mouseSensitivityMultiplier.innerHTML = currValue + 1;
    }
    //button state managements
    if (currValue + 1 == 9) {
        mouseSensitivityPlusButton.classList.add("disabled");
    }
    if (currValue == 1) {
        mouseSensitivityMinusButton.classList.remove("disabled");
    }
};

const handleScrollSensitivityMinus = function (evt) {
    let currValue = parseInt(scrollSensitivityMultiplier.innerHTML);
    if (currValue > 1) {
        scrollSensitivityMultiplier.innerHTML = currValue - 1;
    }
    //button state managements
    if (currValue - 1 == 1) {
        scrollSensitivityMinusButton.classList.add("disabled");
    }
    if (currValue == 9) {
        scrollSensitivityPlusButton.classList.remove("disabled");
    }
};

const handleScrollSensitivityPlus = function (evt) {
    let currValue = parseInt(scrollSensitivityMultiplier.innerHTML);
    if (currValue < 9) {
        scrollSensitivityMultiplier.innerHTML = currValue + 1;
    }
    //button state managements
    if (currValue + 1 == 9) {
        scrollSensitivityPlusButton.classList.add("disabled");
    }
    if (currValue == 1) {
        scrollSensitivityMinusButton.classList.remove("disabled");
    }
};


//=========================================== K E Y B O A R D ===========================================

const handleKeyDownIOS = function (evt) {
    //alert(`keydown full: ${evt.target.value}`);
    //alert(`keydown evt.key: ${evt.key}`);

    if (evt.key != "Unidentified") {
        postToServer("/type-character", { character: evt.key });
    }
};

let pastAndroidKeyUpLength = null;
let pastAndroidKeyUpValue = null;

const handleKeyUpAndroid = function (evt) {
    //alert(`keyup full: '${evt.target.value}'`);
    //alert(`keyup evt.key: '${evt.key}'`);

    const currentAndroidKeyUpLength = evt.target.value.length;
    const currentAndroidKeyUpValue = evt.target.value;

    if (evt.key === "Enter") {
        postToServer("/type-character", { character: evt.key });
    }
    else if (currentAndroidKeyUpLength < pastAndroidKeyUpLength || evt.key === "Backspace") {
        postToServer("/type-character", { character: "Backspace" });
    }
    else if (evt.key === "Unidentified" && currentAndroidKeyUpLength != pastAndroidKeyUpLength) {
        const currChar = findDiff(pastAndroidKeyUpValue, currentAndroidKeyUpValue);
        postToServer("/type-character", { character: currChar });
    }

    pastAndroidKeyUpLength = currentAndroidKeyUpLength;
    pastAndroidKeyUpValue = currentAndroidKeyUpValue;
};

const handleKeyboardFocusAndroid = function (evt) {
    pastAndroidKeyUpLength = evt.target.value.length;
    pastAndroidKeyUpValue = evt.target.value;
};

const findDiff = function (pastStr, currentStr) {
    let i = 0;
    while (i < pastStr.length && i < currentStr.length && pastStr[i] === currentStr[i]) {
        i++;
    }
    if (i < currentStr.length) {
        return currentStr[i];
    }
    return null;
};

const handleKeyboardFocusOut = function (evt) {
    clickAllowed = false;
};



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

    let index = 0;
    for (let i = 0; i < touches.length; i++) {
        if (touches[i].identifier === startTouchId) {
            index = i;
        }
    }

    if (touches[index].identifier === startTouchId) {
        const currentCoordinates = createCoordinateObj(touches[index]);
        const deltaCoordinates = calculateIntDeltaCoordinates(currentCoordinates, pastCoordinates);

        const moveThreshold = 1;
        const scrollThreshold = 5;
        if (touches.length == 1 && (Math.abs(deltaCoordinates.deltaX) >= moveThreshold || Math.abs(deltaCoordinates.deltaY) >= moveThreshold)) {
            //postToServer("/move-mouse", { x: deltaCoordinates.deltaX, y: deltaCoordinates.deltaY });
            socket.emit("move-mouse", { "x": deltaCoordinates.deltaX, "y": deltaCoordinates.deltaY, "multiplier": parseInt(mouseSensitivityMultiplier.innerHTML) });
            pastCoordinates = currentCoordinates;
        }
        else if (touches.length == 2 && Math.abs(deltaCoordinates.deltaY) >= scrollThreshold) {
            socket.emit("scrolling", { "y": deltaCoordinates.deltaY, "multiplier": parseInt(scrollSensitivityMultiplier.innerHTML) });
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
    const clickThreshold = 1;
    if (Math.abs(deltaCoordinates.deltaX) <= clickThreshold && Math.abs(deltaCoordinates.deltaY) <= clickThreshold) {
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



//====================================== M O U S E  B U T T O N ======================================

const handleLeftMouseButtonClick = function () {
    postToServer("/click", { button: "left" });
};

const handleRightMouseButtonClick = function () {
    postToServer("/click", { button: "right" });
};



//=========================================== S T A R T U P ===========================================

const getOperatingSystem = function () {
    const userAgent = navigator.userAgent || window.opera;
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }
    if (/android/i.test(userAgent)) {
        return "Android";
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }
    return "unknown";
};

const startup = function () {
    keyboard.addEventListener("focusout", handleKeyboardFocusOut);
    const clientOS = getOperatingSystem();
    if (clientOS === "Android") {
        keyboard.addEventListener("focus", handleKeyboardFocusAndroid);
        keyboard.addEventListener("keyup", handleKeyUpAndroid);
    } else if (clientOS === "iOS") {
        keyboard.addEventListener("keydown", handleKeyDownIOS);
    }

    leftMouseButton.addEventListener("click", handleLeftMouseButtonClick);
    rightMouseButton.addEventListener("click", handleRightMouseButtonClick);

    touchpad.addEventListener("touchstart", handleTouchStart);
    touchpad.addEventListener("touchmove", handleTouchMove, { passive: false });
    touchpad.addEventListener("touchend", handleTouchEnd);
    touchpad.addEventListener("touchcancel", handleTouchCancel);

    mouseSensitivityPlusButton.addEventListener("click", handleMouseSensitivityPlus);
    mouseSensitivityMinusButton.addEventListener("click", handleMouseSensitivityMinus);
    scrollSensitivityPlusButton.addEventListener("click", handleScrollSensitivityPlus);
    scrollSensitivityMinusButton.addEventListener("click", handleScrollSensitivityMinus);
};

document.addEventListener("DOMContentLoaded", startup);
