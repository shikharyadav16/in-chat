const input = document.getElementById('message');

document.addEventListener('keydown', () => {
    if (e.key === "Enter") {
        console.log(input.value)
        socket.emit("message", input.value.trim())
        input.value = ""
    }
})