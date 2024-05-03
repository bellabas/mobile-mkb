//const IP_ADDRESS = {{ IP_ADDRESS| tojson }}
//const PORT = {{ PORT| tojson }}

const moveMouse = function (x, y) {
    const endpoint = `/move-mouse`
    let data = new FormData()
    data.append("x", x)
    data.append("y", y)

    fetch(endpoint, {
        "method": "POST",
        "body": data,
    })
}

moveMouse(0, 0)