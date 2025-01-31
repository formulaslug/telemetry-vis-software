import wasmInit, { readParquet, wasmMemory } from "parquet-wasm/esm";

// Enables zero-copy transer of Arrow data from wasm memory to JS
import * as arrowJSFFI from "arrow-js-ffi";

import { Table } from "apache-arrow";
import { columnNames, DataArrays, schema } from "./datatypes";
import { Dispatch, MutableRefObject, SetStateAction } from "react";

// TODO(jack): this setup is kinda bad cuz every time the function is called it
// tried all URLs, including bad ones, which cause Network Errors to be thrown
// to the console. Idrk how to fix this yet
// TODO: In the future user's should be shown a list of sources and which
// ones are active, and should be able to switch between them
async function tryFetch<T>(
  path: string,
  callback: (data: Response) => Promise<T>,
): Promise<T | null> {
  const hostname = window.location.hostname;
  const urls: string[] =
    hostname == "localhost"
      ? // prettier-ignore
        [ "https://live-vis.bvngee.com", "http://localhost", "http://localhost:9000" ]
      : ["https://live-vis.bvngee.com", `https://${hostname}`];

  // this is awful lmao omg (I nested functions because having window.location
  // in the global scope causes SSR issues...)
  const tryUrl = async (
    p: string,
    cb: (data: Response) => Promise<T>,
  ): Promise<T | null> => {
    const url = urls.pop();
    if (!url) {
      console.warn("All attempts failed to call to HTTP API!");
      return null;
    }
    console.debug("Trying HTTP API URL: ", url);
    return fetch(`${url}${p}`)
      .then(async (resp) => {
        if (!resp.ok) {
          console.debug("fetch(", url, ") failed (ok==false).");
          return tryUrl(p, cb);
        }
        console.debug("fetch(", url, ") succeeded!");
        return await cb(resp);
      })
      .catch((e) => {
        console.debug("A network error occured fetching ", url, ": ", e);
        return tryUrl(p, cb);
      });
  };
  return tryUrl(path, callback);
}

export async function availableRecordings(): Promise<string[]> {
  // console.log(process.env.NODE_ENV);
  return tryFetch("/api/available-recordings", (resp) => resp.json());
}

export async function getRecording(filepath: string) {
  // if (typeof window === "undefined") return;
  // Initializes WebAssembly memory for parquet-wasm, and gets a reference to it
  await wasmInit();
  const WASM_MEMORY = wasmMemory();

  const parquet = await tryFetch(`/api/get-recording/${filepath}`, (resp) =>
    resp.arrayBuffer(),
  );
  const arrowTableWasm = readParquet(new Uint8Array(parquet!)).intoFFI();
  const arrowTable: Table = arrowJSFFI.parseTable(
    WASM_MEMORY.buffer,
    arrowTableWasm.arrayAddrs(),
    arrowTableWasm.schemaAddr(),
  );

  // Free arrow table in wasm memory
  arrowTableWasm.drop();

  if (arrowTable.schema !== schema) {
    console.warn(`schema of ${filepath} differs from datatypes.schema!`);
  } else {
    console.log(`schema of ${filepath} == datatypes.schema :)`);
  }

  return arrowTable;
}

export async function initRecordingData(
  filepath: string,
  data: MutableRefObject<DataArrays>,
  dataTrimmed: MutableRefObject<DataArrays>,
  setNumRows: Dispatch<SetStateAction<number>>,
  viewLength: number,
) {
  const arrowTable = (await getRecording(filepath))!;

  for (const [i, key] of columnNames.entries()) {
    const vec = arrowTable.getChildAt(i);
    data.current[key] = vec?.toArray();
    dataTrimmed.current[key] = vec?.slice(Math.max(0, arrowTable.numRows-viewLength-1)).toArray();
    // dataTrimmed.current[key].slice(-viewLength);
  }

  setNumRows(arrowTable.numRows);
}
