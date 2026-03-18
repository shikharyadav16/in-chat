const socket = io("http://localhost:3000", {
    withCredentials: true
});

const logsDiv = document.querySelector('.logs');
const messagesDiv = document.querySelector('.messages');

socket.on('connect', () => {
    logsDiv.innerHTML += `<p>Connected to server with ID: ${socket.id}</p>`;
});

socket.on('user-joins', (user) => {
    logsDiv.innerHTML += `<p>User Connected to server with ID: ${user}</p>`
})

socket.on('disconnect', () => {
    logsDiv.innerHTML += `<p>Disconnected from server</p>`;
});

