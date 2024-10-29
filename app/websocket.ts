function initWebSockets() {
  const sock = new WebSocket("wss://localhost");

  // Connection opened
  sock.addEventListener("open", (event) => {
    sock.send("Hello Server!");
  });

  // Listen for messages
  sock.addEventListener("message", (event) => {
    console.log(event.data);
  });
}

export default initWebSockets;
