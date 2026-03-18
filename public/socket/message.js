socket.on('message', (data) => {
    messagesDiv.innerHTML += `<span>${data.username} : </span><p>${data.message}</p>`;
});