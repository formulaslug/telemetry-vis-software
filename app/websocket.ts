import { Data, tableFromArrays, tableFromIPC } from "apache-arrow";
import DataFrame from "./dataframe";
import { Dispatch, SetStateAction } from "react";

let socket: WebSocket | null;
function initWebSocket(
  setConnected: Dispatch<SetStateAction<boolean>>,
  setDataFrames: Dispatch<SetStateAction<DataFrame[]>>,
) {
  const hostname = window.location.hostname;
  // TODO: In the future user's should be shown a list of sources and which
  // ones are active, and should be able to switch between them
  const urls: string[] =
    hostname == "localhost"
      ? ["ws://localhost", "ws://localhost:8000"]
      : [`wss://${hostname}`, "wss://live-vis.bvngee.com"];

  const tryUrl = () => {
    const url = urls.pop();
    if (!url) {
      console.log("All attempts failed to connect to WebSocket!");
      return;
    }
    console.log("Trying URL: " + url.toString());
    socket = new WebSocket(url);
    socket.binaryType = "arraybuffer";
    socket.onopen = (_) => {
      setConnected(true);
      console.log(`Successfully connected to WebSocket at ${url}!`);
    };
    socket.onclose = (event) => {
      setConnected(false);
      if (!event.wasClean) {
        console.log(
          `Websocket at ${url} closed unexpectedly: ${event.reason}`,
        );
      } else {
        console.log(`WebSocket at ${url} closed.`);
      }
    };
    socket.onerror = (_) => {
      setConnected(false);
      console.log(`Error occured with WebSocket at ${url}!`);
      tryUrl();
    };
    socket.onmessage = (event) => {
      const tbl = tableFromIPC(new Uint8Array(event.data));
      // console.log(tbl);
      const newFrames: DataFrame[] = [];
      for (let i = 0; i < tbl.numRows; i++) {
        const row = tbl.get(i)!.toArray() as number[];
        // This is probably wildly inefficient, but we can investigate that later
        newFrames.push(new DataFrame(row));
      }
      setDataFrames((prevDataFrames) => [...prevDataFrames, ...newFrames]);
      // const row = tbl.get(0)!.toArray() as number[];
    };
  };
  tryUrl();

  return () => {
    socket?.close();
  };
}

export default initWebSocket;
