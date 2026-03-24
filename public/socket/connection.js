const socket = io("http://localhost:3000", {
    withCredentials: true
});

// const logsDiv = document.querySelector('.logs');
// const messagesDiv = document.querySelector('.messages');

socket.on('connect', () => {
    console.log("Connected")    
});

// socket.on('user-joins', (user) => {
//     logsDiv.innerHTML += `<p>User Connected to server with ID: ${user}</p>`
// })

socket.on('disconnect', () => {
    console.log("disconnected")
});

