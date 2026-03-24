function sendMessage() {
    const text = input.value.trim();

    if (!text || !activeUser) return;

    socket.emit("message", {
        message: input.value.trim(),
        userId: receiverUserId,
        // tempId: 
        // status:
    });

    input.value = "";
}

function getMessage() {
    // get message according to the tempId logic here
    // Code----
}

function retryMessage() {
    // Retry if the message is failed to sent logic here
    // Code----
}

function startTimeout(temp) {
    // Timer for every message sent for checking the status of message
    // Code----
}

socket.on("message_sent", (data) => {
    addMessage(data.message, "sent")
});

socket.on('message', (data) => {
    addMessage(data.message, "received")
});

document.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        sendMessage(receiverUserId);
        input.value = ""
    }
});

// function receiveMessage

function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.innerText = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}