const postMoveMouse = function (x, y) {
    const endpoint = "/move-mouse"

    let data = new FormData()
    data.append("x", x)
    data.append("y", y)

    fetch(endpoint, {
        "method": "POST",
        "body": data,
    })
}

const postTypeCharacter = function (character) {
    const endpoint = "/type-character"

    let data = new FormData()
    data.append("character", character)

    fetch(endpoint, {
        "method": "POST",
        "body": data,
    })
}

const postClick = function (button) {
    const endpoint = "/click"

    let data = new FormData()
    data.append("click", button)

    fetch(endpoint, {
        "method": "POST",
        "body": data,
    })
}

