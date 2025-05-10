import wasmInit, { readParquet, wasmMemory } from "parquet-wasm/esm";

// Enables zero-copy transer of Arrow data from wasm memory to JS
import * as arrowJSFFI from "arrow-js-ffi";

import { DataRow, schema } from "./datatypes";

async function tryFetch(path: string, isProduction: boolean) {
    const url = isProduction ? "https://telemetry.formulaslug.com" : "http://localhost:9000";
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

export async function getDBCForRecording(
    filepath: string,
    isProduction: boolean,
): Promise<string[] | null> {
    return tryFetch(`/api/get-dbc-for-recording/${filepath}`, isProduction).then((resp) =>
        resp?.json(),
    );
}

// ???
export async function getRecording(file: string | File) {
    // Initializes WebAssembly memory for parquet-wasm, and gets a reference to it
    await wasmInit();
    const WASM_MEMORY = wasmMemory();

    let arrayBuffer: ArrayBuffer | undefined;

    if (typeof file == "string") { // string (pathname)
        const resp = await tryFetch(`/api/get-recording/${file}`, false)
        arrayBuffer = await resp?.arrayBuffer();
    } else { // File object
        arrayBuffer = await file.arrayBuffer();
    }

    if (!arrayBuffer) {
        console.error("file is not a valid ArrayBuffer!");
        return;
    }

    const arrowTableWasm = readParquet(new Uint8Array(arrayBuffer)).intoFFI();
    const arrowTable = arrowJSFFI.parseTable<DataRow>(
        WASM_MEMORY.buffer,
        arrowTableWasm.arrayAddrs(),
        arrowTableWasm.schemaAddr(),
    );

    // Free arrow table in wasm memory
    arrowTableWasm.drop();

    // TODO: instead of comparing schemas, use the incoming schema instead of our hardcoded one
    // if (arrowTable.schema !== schema) {
    //     console.warn(`schema of ${filepath} differs from datatypes.schema!`);
    // } else {
    //     console.log(`schema of ${filepath} == datatypes.schema :)`);
    // }

    return arrowTable;
}

export async function availableRecordings(isProduction: boolean) {
    const resp = await tryFetch(`/api/available-recordings`, isProduction);
    return resp?.json();
}

// export async function initRecordingSource(
//     filepath: string,
//     data: RefObject<DataArrays>,
//     dataTrimmed: RefObject<DataArrays>,
//     setNumRows: Dispatch<SetStateAction<number>>,
//     viewLength: number,
// ) {
//     const arrowTable = (await getRecording(filepath))!;
//
//     // Completely reset data, so keys unused by the recording are left as null
//     data.current = nullDataArrays();
//     dataTrimmed.current = nullDataArrays();
//
//     for (const [i, key] of arrowTable.schema.names.entries()) {
//         // Get Arrow vector from table
//         const vec = arrowTable.getChildAt(i);
//         // Extract JS array from Arrow vector
//         let dataArr = vec?.toArray();
//         let dataArrTrimmed = vec
//             ?.slice(Math.max(0, arrowTable.numRows - viewLength - 1))
//             .toArray();
//
//         // Chartjs doesn't support bigints ootb. The easiest solution for now is
//         // just to replace them with supported TypedArrays
//         if (dataArr instanceof BigInt64Array || dataArr instanceof BigUint64Array) {
//             dataArr = convertToInt32Array(dataArr);
//             dataArrTrimmed = convertToInt32Array(dataArrTrimmed);
//         }
//
//         // Set the data arrays directly
//         data.current[key] = dataArr;
//         dataTrimmed.current[key] = dataArrTrimmed;
//     }
//
//     setNumRows(arrowTable.numRows);
// }

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
