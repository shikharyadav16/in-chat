const input = document.getElementById('message');
const receiverUserId = 'use-1773855248777';

document.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        console.log(input.value)
        socket.emit("message", { message: input.value.trim(), userId: receiverUserId });
        input.value = ""
    }
})