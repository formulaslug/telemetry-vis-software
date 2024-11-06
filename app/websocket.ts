// import { tableFromIPC } from "apache-arrow";
//
// function initWebSockets(sock: WebSocket) {
//   // const sock = new WebSocket("wss://localhost");
//   sock.binaryType = "arraybuffer";
//
//   // Connection opened
//   sock.addEventListener("open", (event) => {
//     sock.send("Hello Server!");
//   });
//
//   // Listen for messages
//   sock.addEventListener("message", (event) => {
//     const tbl = tableFromIPC(new Uint8Array(event.data));
//
//     tbl.toArray().forEach((arr) => {
//       console.log(JSON.parse(arr));
//     });
//   });
//
//   sock.addEventListener("error", (event) => {
//     console.log("WebSocket error: ", event);
//   });
// }
//
// export default initWebSockets;
