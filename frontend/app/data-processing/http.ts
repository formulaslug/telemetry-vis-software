import wasmInit, { readParquet, wasmMemory } from "parquet-wasm/esm";

// Enables zero-copy transer of Arrow data from wasm memory to JS
import * as arrowJSFFI from "arrow-js-ffi";

import { DataArrays, DataRow, nullDataArrays, schema } from "./datatypes";
import { Dispatch, RefObject, SetStateAction } from "react";
import { RESPONSE_LIMIT_DEFAULT } from "next/dist/server/api-utils";

// TODO(jack): this setup is kinda bad cuz every time the function is called it
// tried all URLs, including bad ones, which cause Network Errors to be thrown
// to the console. Idrk how to fix this yet
// TODO: In the future user's should be shown a list of sources and which
// ones are active, and should be able to switch between them
// async function tryFetch<T>(
//     path: string,
//     callback: (data: Response) => Promise<T>
// ): Promise<T | null> {
//     const hostname = window.location.hostname;
//     const urls: string[] =
//         hostname == "localhost"
//             ? // prettier-ignore
//               [ "https://live-vis.bvngee.com", "http://localhost", "http://localhost:9000" ]
//             : ["https://live-vis.bvngee.com", `https://${hostname}`];

//     // this is awful lmao omg (I nested functions because having window.location
//     // in the global scope causes SSR issues...)
//     const tryUrl = async (
//         p: string,
//         cb: (data: Response) => Promise<T>
//     ): Promise<T | null> => {
//         const url = urls.pop();
//         if (!url) {
//             console.warn("All attempts failed to call to HTTP API!");
//             return null;
//         }
//         console.debug("Trying HTTP API URL: ", url);
//         return fetch(`${url}${p}`)
//             .then(async (resp) => {
//                 if (!resp.ok) {
//                     console.debug("fetch(", url, ") failed (ok==false).");
//                     return tryUrl(p, cb);
//                 }
//                 console.debug("fetch(", url, ") succeeded!");
//                 return await cb(resp);
//             })
//             .catch((e) => {
//                 console.debug("A network error occured fetching ", url, ": ", e);
//                 return tryUrl(p, cb);
//             });
//     };
//     return tryUrl(path, callback);
// }

async function tryFetch(path: string, production: boolean) {
    const url = production ? "https://telemetry.formulaslug.com" : "http://localhost:9000";
    try {
        const result = await fetch(`${url}${path}`);
        if (!result.ok) {
            return null;
        }
        return result;
    } catch (e) {
        console.log("Error fetching:", e);
        return null;
    }
}

export async function availableRecordings(production: boolean): Promise<string[] | null> {
    // console.log(process.env.NODE_ENV);
    return tryFetch("/api/available-recordings", production).then((response) =>
        response != null ? response.json() : null
    );
}

export async function getRecording(filepath: string) {
    // Initializes WebAssembly memory for parquet-wasm, and gets a reference to it
    await wasmInit();
    const WASM_MEMORY = wasmMemory();

    const parquet = await tryFetch(`/api/get-recording/${filepath}`, true).then((resp) =>
        resp ? resp.arrayBuffer() : null
    );
    const arrowTableWasm = readParquet(new Uint8Array(parquet!)).intoFFI();
    const arrowTable = arrowJSFFI.parseTable<DataRow>(
        WASM_MEMORY.buffer,
        arrowTableWasm.arrayAddrs(),
        arrowTableWasm.schemaAddr()
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

export async function initRecordingSource(
    filepath: string,
    data: RefObject<DataArrays>,
    dataTrimmed: RefObject<DataArrays>,
    setNumRows: Dispatch<SetStateAction<number>>,
    viewLength: number
) {
    const arrowTable = (await getRecording(filepath))!;

    // Completely reset data, so keys unused by the recording are left as null
    data.current = nullDataArrays();
    dataTrimmed.current = nullDataArrays();

    for (const [i, key] of arrowTable.schema.names.entries()) {
        // Get Arrow vector from table
        const vec = arrowTable.getChildAt(i);
        // Extract JS array from Arrow vector
        let dataArr = vec?.toArray();
        let dataArrTrimmed = vec
            ?.slice(Math.max(0, arrowTable.numRows - viewLength - 1))
            .toArray();

        // Chartjs doesn't support bigints ootb. The easiest solution for now is
        // just to replace them with supported TypedArrays
        if (dataArr instanceof BigInt64Array || dataArr instanceof BigUint64Array) {
            dataArr = convertToInt32Array(dataArr);
            dataArrTrimmed = convertToInt32Array(dataArrTrimmed);
        }

        // Set the data arrays directly
        data.current[key] = dataArr;
        dataTrimmed.current[key] = dataArrTrimmed;
    }

    setNumRows(arrowTable.numRows);
}

// Thanks claude
function convertToInt32Array(bigIntArray: BigInt64Array | BigUint64Array) {
    const int32Array = new Int32Array(bigIntArray.length);
    const INT32_MIN = -2147483648;
    const INT32_MAX = 2147483647;

    for (let i = 0; i < bigIntArray.length; i++) {
        const num = Number(bigIntArray[i]);
        int32Array[i] = Math.max(INT32_MIN, Math.min(INT32_MAX, num));
    }
    return int32Array;
}
