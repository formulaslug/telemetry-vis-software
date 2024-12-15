import { Table, tableFromIPC } from "apache-arrow";
import { DataColDict, DataRow } from "./datatypes";
import { Dispatch, MutableRefObject, SetStateAction } from "react";

let socket: WebSocket | null;
function initWebSocketConnection(
  setIsConnected: Dispatch<SetStateAction<boolean>>,
  // setDataFrames: Dispatch<SetStateAction<DataRow[]>>,
  dataTable: MutableRefObject<Table<DataRow>>,
  columnDict: MutableRefObject<DataColDict>,
  columnLen: number,
) {
  const hostname = window.location.hostname;
  // TODO: In the future user's should be shown a list of sources and which
  // ones are active, and should be able to switch between them
  const urls: string[] =
    hostname == "localhost"
      ? ["wss://live-vis.bvngee.com", "ws://localhost", "ws://localhost:8000"]
      : ["wss://live-vis.bvngee.com", `wss://${hostname}`];

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
      setIsConnected(true);
      console.log(`Successfully connected to WebSocket at ${url}!`);
    };
    socket.onclose = (event) => {
      setIsConnected(false);
      if (!event.wasClean) {
        console.log(`Websocket at ${url} closed unexpectedly: ${event.reason}`);
      } else {
        console.log(`WebSocket at ${url} closed.`);
      }
    };
    socket.onerror = (_) => {
      setIsConnected(false);
      console.log(`Error occured with WebSocket at ${url}!`);
      tryUrl();
    };
    socket.onmessage = (event) => {
      // First we turn the binary arrow data into an arrow Table
      const tbl = tableFromIPC<DataRow>(new Uint8Array(event.data));

      // Getting minimal-copy columns/slices out of arrow tables is super easy!
      // This is what that can look like:
      // const tbl2 = tbl.select(["Timestamp(s)", "Acc Voltage 1(V)"])!;
      // const colVec = tbl.getChild("Acc Voltage 1(V)")!;
      // const arr = colVec.slice(n, m);

      // Then we append the new table to our main dataTable. This is likely the
      // most expensive operation left in the chain of operations (performs
      // full copy afaict)
      if (dataTable.current.numRows == 0) {
        // If the main dataTable hasn't been initialized yet, it doesn't have a
        // schema so concat() doesn't seem to work
        dataTable.current = tbl;
      } else {
        // This is the main code path (all but the first websocket message)
        const start = performance.now();
        dataTable.current = dataTable.current.concat(tbl);
        const end = performance.now();
        console.log(`dataTable concat(): ${end - start}ms`);
      }
      // console.log(dataTable.current.numRows);
      // console.log(dataTable.current.get(dataTable.current.numRows-1)!.toArray().toString());

      const dataTableNumRows = dataTable.current.numRows;
      const keys = dataTable.current.schema.names;
      // console.log(keys);

      // Lastly we go through the separate column dictionary and replace all
      // vectors with new zero-copy slices pointing to the updated main table.
      const start = performance.now();
      for (const key of keys) {
        const keyName = key as keyof DataColDict;
        (columnDict.current[keyName] as DataColDict[typeof keyName]) =
          dataTable.current
            .getChild(keyName)!
            .slice(
              Math.max(0, dataTableNumRows - columnLen),
              dataTableNumRows + 1,
            )
            .toArray();
      }
      const end = performance.now();
      console.log(`columnDict recreation: ${end - start}ms`);

      // console.log(columnDict.current["Timestamp(s)"].toString())

      // OLD CODE:
      // const newFrames = Array.from({ length: tbl.numRows }, (_, i) => {
      //   const row = tbl.get(i)!.toArray() as number[];
      //   return new DataRow(row);
      // });
      // setDataFrames((prevDataFrames) => [...prevDataFrames, ...newFrames]);
    };
  };
  tryUrl();

  return () => {
    socket?.close();
  };
}

export default initWebSocketConnection;
