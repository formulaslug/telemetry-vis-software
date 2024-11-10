import { tableFromIPC } from "apache-arrow";
import DataFrame from "./message";
import { Dispatch, SetStateAction } from "react";

let socket: WebSocket | null;
function initWebSocket(
  setConnected: Dispatch<SetStateAction<boolean>>,
  setMessages: Dispatch<SetStateAction<DataFrame[]>>,
) {
  const hostname = window.location.hostname;
  const urls: string[] =
    // TODO: In the future user's should be shown a list of sources and which
    // ones are active, and should be able to switch between them
    hostname == "localhost"
      ? ["ws://localhost", "ws://localhost:8000"]
      : [`wss://${hostname}`, "wss://live-vis.bvngee.com"];

  const tryUrl = () => {
    const url = urls.pop();
    if (!url) {
      console.log("All attempts failed to connect to WebSocket!");
      return;
    }
    console.log("Trying URL: " + urls.toString());
    socket = new WebSocket(url);
    socket.binaryType = "arraybuffer";
    socket.onopen = (_) => {
      setConnected(true);
      console.log(
        `Successfully connected to Websocketet at ${url}!`,
      );
    };
    socket.onclose = (event) => {
      setConnected(false);
      if (!event.wasClean) {
        console.log(
          `Websocketet at ${url} closed unexpectedly: ${event.reason}`,
        );
      } else {
        console.log(`Websocketet at ${url} closed.`);
      }
    };
    socket.onerror = (_) => {
      setConnected(false);
      console.log(`Error occured with Websocketet at ${url}!`);
      tryUrl();
    };
    socket.onmessage = (event) => {
      const tbl = tableFromIPC(new Uint8Array(event.data));
      console.table(tbl);
      // We assume we're getting 1 row at a time, *for now*
      const split_data = tbl.get(0)!.toJSON() as DataFrame;
      setMessages((prevState) => [...prevState, split_data]);
    };
    // initWebsocketets(sock);
  };
  tryUrl();

  return () => {
    socket?.close();
  };
}

export default initWebSocket;
