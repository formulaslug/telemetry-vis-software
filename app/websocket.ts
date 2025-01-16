import { AsyncByteStream, AsyncRecordBatchStreamReader } from "apache-arrow";
import { columnNames, DataArrays, DataRow } from "./datatypes";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { AsyncQueue } from "apache-arrow/io/interfaces";

let socket: WebSocket | null;
let messageQueue = new AsyncQueue<ArrayBuffer>();
// let recordBatches: RecordBatch[] = []; // not needed atm

async function processData(
  data: MutableRefObject<DataArrays>,
  dataTrimmed: MutableRefObject<DataArrays>,
  setNumRows: Dispatch<SetStateAction<number>>,
  viewLength: number,
) {
  const byteStream = new AsyncByteStream(messageQueue);
  const recordBatchReader =
    await AsyncRecordBatchStreamReader.from<DataRow>(byteStream);

  // This async loop essentially awaits for each websocket message to arrive
  for await (const batch of recordBatchReader) {
    // recordBatches.push(batch);
    console.log(batch.getChild(":Time")?.toArray());
    

    // TODO(jack): start trimming dataTrimmed using viewLength!!
    for (const [i, key] of columnNames.entries()) {
      data.current[key].push(...batch.getChildAt(i)?.toArray());
      dataTrimmed.current[key].push(...batch.getChildAt(i)?.toArray());

      dataTrimmed.current[key].splice(
        0,
        Math.max(0, dataTrimmed.current[key].length - viewLength),
      );
    }

    setNumRows((prev) => prev + batch.numRows);

    // console.log(dataColArrays.current);
    // console.log(batch.numRows);

    // const start1 = performance.now();
    // const tbl = new Table(recordBatches);
    // const end1 = performance.now();
    // console.log(`const tbl = new Table(rbs): ${end1 - start1}ms`);

    // const start1_5 = performance.now();
    // const end1_5 = performance.now();
    // console.log(`: ${end1_5 - start1_5}ms`);

    // const start2 = performance.now();
    // const arr = tbl.getChild("Timestamp(s)")!.toArray();
    // const end2 = performance.now();
    // console.log(`tbl.getChild(): ${end2 - start2}ms, len: ${arr.length}`);
  }
}

function initWebSocketConnection(
  setIsConnected: Dispatch<SetStateAction<boolean>>,
  data: MutableRefObject<DataArrays>,
  dataTrimmed: MutableRefObject<DataArrays>,
  setNumRows: Dispatch<SetStateAction<number>>,
  viewLength: number,
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
      console.warn("All attempts failed to connect to WebSocket server!");
      return;
    }
    console.debug("Trying URL: ", url.toString());
    socket = new WebSocket(url);
    socket.binaryType = "arraybuffer"; // this means event.data is an ArrayBuffer
    socket.onopen = (_) => {
      setIsConnected(true);
      console.debug(`Successfully connected to WebSocket at ${url}!`);

      // Once the socket is open, begin processing data in the queue
      processData(data, dataTrimmed, setNumRows, viewLength).catch((err) =>
        console.error("Error processing websocket data:", err),
      );
    };
    socket.onclose = (event) => {
      setIsConnected(false);
      if (!event.wasClean) {
        console.warn(`Websocket at ${url} closed unexpectedly:`, event.reason);
      } else {
        console.debug(`WebSocket at ${url} closed.`);
      }
    };
    socket.onerror = (_) => {
      setIsConnected(false);
      console.warn(`Error occured with WebSocket at ${url}!`);
      tryUrl();
    };
    socket.onmessage = (event) => {
      // Every time a message arrives, add it to the async queue. The queue will
      // be processed in processData()
      messageQueue.write(event.data as ArrayBuffer);

      // -------------------------------------------------------
      //              OLD CODE    (to be removed soon)
      // -------------------------------------------------------
      // First we turn the binary arrow data into an arrow Table
      // let rb: RecordBatch;
      // {
      //   // const start = performance.now();
      //   const uint8Arr = new Uint8Array(event.data as ArrayBuffer);
      //   recordBatchesIPC.push(uint8Arr);
      //   // const reader = RecordBatchStreamReader.from<DataRow>(uint8Arr.buffer);
      //   // recordBatches.push(...reader.readAll());
      //   // const end = performance.now();
      //   // console.log(
      //   //   `RecordBatchStreamReader.from(uint8Arr).readAll(): ${end - start}ms`,
      //   // );
      //   // rb = recordBatches[recordBatches.length - 1];
      // }
      // {
      //   const start = performance.now();
      //   const tbl = new Table(recordBatches);
      //   const end = performance.now();
      //   console.log(`new Table(recordBatches): ${end - start}ms, rows: ${tbl.numRows}`);
      //
      //   const start2 = performance.now();
      //   const arr = tbl.getChild("Timestamp(s)")!.toArray();
      //   const end2 = performance.now();
      //   console.log(`tbl.getChild(): ${end2 - start2}ms, rows: ${arr.length}`);
      // }
      // {
      //   const start1 = performance.now();
      //   const reader = RecordBatchStreamReader.from<DataRow>(recordBatchesIPC);
      //   const end1 = performance.now();
      //   console.log(
      //     `const reader = RecordBatchReader.from(rbsIPC): ${end1 - start1}ms`,
      //   );
      //
      //   const start2 = performance.now();
      //   const rbs = reader.readAll();
      //   const end2 = performance.now();
      //   console.log(`const rbs = reader.readAll(): ${end2 - start2}ms`);
      //
      //   const start3 = performance.now();
      //   const tbl = new Table(rbs);
      //   const end3 = performance.now();
      //   console.log(`const tbl = new Table(rbs): ${end3 - start3}ms`);
      //
      //   const start4 = performance.now();
      //   const arr = tbl.getChild("Timestamp(s)")!.toArray();
      //   const end4 = performance.now();
      //   console.log(`tbl.getChild(): ${end4 - start4}ms, len: ${arr.length}`);
      // }

      // Getting minimal-copy columns/slices out of arrow tables is super easy!
      // This is what that can look like:
      // const tbl2 = tbl.select(["Timestamp(s)", "Acc Voltage 1(V)"])!;
      // const colVec = tbl.getChild("Acc Voltage 1(V)")!;
      // const arr = colVec.slice(n, m);

      // // Then we append the new table to our main dataTable. This is likely the
      // // most expensive operation left in the chain of operations (performs
      // // full copy afaict)
      // {
      //   const start = performance.now();
      //   dataTable.current = dataTable.current.concat(tbl);
      //   const end = performance.now();
      //   console.log(`dataTable concat(): ${end - start}ms`);
      // }

      // console.log(dataTable.current.numRows);
      // console.log(dataTable.current.get(dataTable.current.numRows-1)!.toArray().toString());

      // // Lastly we go through the separate column dictionary and replace all
      // // vectors with new zero-copy slices pointing to the updated main table.
      // {
      //   const start = performance.now();
      //   const keys = dataTable.current.schema.names;
      //   // for (const key of keys as ColumnName[]) { // using Float32Array
      //   //   if (currentColumnDictLen.current >= maxRows) {
      //   //     columnDict.current["Timestamp(s)"]
      //   //   }
      //   //   columnDict.current[key].set(
      //   //     rb.getChild(key)!.toArray(),
      //   //     currentColumnDictLen.current,
      //   //   );
      //   // }
      //   // for (const key of keys as ColumnName[]) { // using number[]
      //   //   if (currentColumnDictLen.current >= maxRows) {
      //   //     columnDict.current["Timestamp(s)"]
      //   //   }
      //   //   columnDict.current[key].set(
      //   //     rb.getChild(key)!.toArray(),
      //   //     currentColumnDictLen.current,
      //   //   );
      //   // }
      //
      //   // const dataTableNumRows = dataTable.current.numRows;
      //   // const keys = schema.names;
      //   // for (const key of keys) {
      //   //   const keyName = key as keyof DataColDict;
      //   //   (columnDict.current[keyName] as DataColDict[typeof keyName]) =
      //   //     dataTable.current
      //   //       .getChild(keyName)!
      //   //       .slice(
      //   //         Math.max(0, dataTableNumRows - columnLen),
      //   //         dataTableNumRows + 1,
      //   //       )
      //   //       .toArray();
      //   // }
      //   const end = performance.now();
      //   // console.log(`columnDict recreation: ${end - start}ms`);
      // }

      // OLD OLD (original) CODE:
      // const newFrames = Array.from({ length: tbl.numRows }, (_, i) => {
      //   const row = tbl.get(i)!.toArray() as number[];
      //   return new DataRow(row);
      // });
      // setDataFrames((prevDataFrames) => [...prevDataFrames, ...newFrames]);

      // -------------------------------------------------------
      //                    END OLD CODE
      // -------------------------------------------------------
    };
  };
  tryUrl();

  return () => {
    socket?.close();
  };
}

export default initWebSocketConnection;
