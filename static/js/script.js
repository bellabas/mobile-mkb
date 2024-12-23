//=========================================== V A R I A B L E S ===========================================

const fullscreenButton = document.getElementById("fullscreen-mode-button");

const keyboard = document.getElementById("keyboard-input");
const keyboardButton = document.getElementById("keyboard-input-button");
const leftMouseButton = document.getElementById("left-click-button-input");
const rightMouseButton = document.getElementById("right-click-button-input");
const touchpad = document.getElementById("touchpad");

const settingModal = document.getElementById("settings-modal");
const openMenuButton = document.getElementById("settings-button-open");
const closeMenuButton = document.getElementById("settings-button-close");
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

const handleToggleMenuButton = function (evt) {
    if (settingModal.classList.contains("modal-disabled")) {
        settingModal.classList.remove("modal-disabled");
    }
    else {
        settingModal.classList.add("modal-disabled");
    }
};

const handleMinusButton = function (evt, htmlValueElement, htmlMinusButtonElement, htmlPlusButtonElement) {
    let currValue = parseInt(htmlValueElement.innerHTML);
    if (currValue > 1) {
        currValue -= 1;
        htmlValueElement.innerHTML = currValue;
        postToServer("/multiplier-change", { "mouseMultiplier": parseInt(mouseSensitivityMultiplier.innerHTML), "scrollMultiplier": parseInt(scrollSensitivityMultiplier.innerHTML) })
    }
    //button state managements
    if (currValue === 1) {
        htmlMinusButtonElement.classList.add("disabled-button");
    }
    if (currValue < 9) {
        htmlPlusButtonElement.classList.remove("disabled-button");
    }
};

const handlePlusButton = function (evt, htmlValueElement, htmlMinusButtonElement, htmlPlusButtonElement) {
    let currValue = parseInt(htmlValueElement.innerHTML);
    if (currValue < 9) {
        currValue += 1;
        htmlValueElement.innerHTML = currValue;
        postToServer("/multiplier-change", { "mouseMultiplier": parseInt(mouseSensitivityMultiplier.innerHTML), "scrollMultiplier": parseInt(scrollSensitivityMultiplier.innerHTML) })
    }
    //button state managements
    if (currValue === 9) {
        htmlPlusButtonElement.classList.add("disabled-button");
    }
    if (currValue > 1) {
        htmlMinusButtonElement.classList.remove("disabled-button");
    }
};

const checkSettingsButtonAvailability = function (evt) {
    const mouseValue = parseInt(mouseSensitivityMultiplier.innerHTML);
    const scrollValue = parseInt(scrollSensitivityMultiplier.innerHTML);
    if (mouseValue < 2) {
        mouseSensitivityMinusButton.classList.add("disabled-button");
    }
    else if (mouseValue > 8) {
        mouseSensitivityPlusButton.classList.add("disabled-button");
    }
    if (scrollValue < 2) {
        scrollSensitivityMinusButton.classList.add("disabled-button");
    }
    else if (scrollValue > 8) {
        scrollSensitivityPlusButton.classList.add("disabled-button");
    }
};

//=========================================== M I S C =======================================================

const switchButtonIcon = function (buttonElement) {
    const svgIcons = buttonElement.getElementsByTagName("svg");
    for (let i = 0; i < svgIcons.length; i++) {
        const currIcon = svgIcons[i];
        if (currIcon.classList.contains("icon-disabled")) {
            currIcon.classList.remove("icon-disabled");
        }
        else {
            currIcon.classList.add("icon-disabled");
        }
    }
};


//=========================================== F U L L S C R E E N ===========================================

const handleFullscreenButtonClick = function (evt) {
    if (!(document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement)) {
        const docElem = document.documentElement;
        if (docElem.requestFullscreen) {
            docElem.requestFullscreen();
        } else if (docElem.webkitRequestFullscreen) {
            /* Safari */
            docElem.webkitRequestFullscreen();
        } else if (docElem.msRequestFullscreen) {
            /* IE11 */
            docElem.msRequestFullscreen();
        }

    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
};

const handleFullscreenChange = function (evt) {
    switchButtonIcon(fullscreenButton);
};



//=========================================== K E Y B O A R D ===========================================

const handleKeyboardButtonClick = function (evt) {
    keyboard.focus();
    switchButtonIcon(keyboardButton);
};

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
    switchButtonIcon(keyboardButton);
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

    //remove keyboard focus
    keyboard.blur();
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
            socket.emit("move-mouse", { "x": deltaCoordinates.deltaX, "y": deltaCoordinates.deltaY });
            pastCoordinates = currentCoordinates;
        }
        else if (touches.length == 2 && Math.abs(deltaCoordinates.deltaY) >= scrollThreshold) {
            socket.emit("scrolling", { "y": deltaCoordinates.deltaY });
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
    window.addEventListener("load", checkSettingsButtonAvailability);
    openMenuButton.addEventListener("click", handleToggleMenuButton);
    closeMenuButton.addEventListener("click", handleToggleMenuButton);

    fullscreenButton.addEventListener("click", handleFullscreenButtonClick);
    document.documentElement.addEventListener("fullscreenchange", handleFullscreenChange);

    keyboardButton.addEventListener("click", handleKeyboardButtonClick);
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

    mouseSensitivityPlusButton.addEventListener("click", (evt) => { handlePlusButton(evt, mouseSensitivityMultiplier, mouseSensitivityMinusButton, mouseSensitivityPlusButton) });
    mouseSensitivityMinusButton.addEventListener("click", (evt) => { handleMinusButton(evt, mouseSensitivityMultiplier, mouseSensitivityMinusButton, mouseSensitivityPlusButton) });
    scrollSensitivityPlusButton.addEventListener("click", (evt) => { handlePlusButton(evt, scrollSensitivityMultiplier, scrollSensitivityMinusButton, scrollSensitivityPlusButton) });
    scrollSensitivityMinusButton.addEventListener("click", (evt) => { handleMinusButton(evt, scrollSensitivityMultiplier, scrollSensitivityMinusButton, scrollSensitivityPlusButton) });
};

document.addEventListener("DOMContentLoaded", startup);
