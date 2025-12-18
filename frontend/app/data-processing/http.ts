import wasmInit, { readParquet, wasmMemory } from "parquet-wasm/esm";

// Enables zero-copy transer of Arrow data from wasm memory to JS
import * as arrowJSFFI from "arrow-js-ffi";

// Tries to call one of the HTTP endpoints of the server, either local or remote
// depending on isProduction. Returns the Response, with some error handling.
// Internal; should be used by the public-facing functions below
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

// Fetch the DBC data associated with a given Recording (filepath). Contains a
// map of ColumnName to information like units, range, etc
export async function getDBCForRecording(
    filepath: string,
    isProduction: boolean,
): Promise<string[] | null> {
    return tryFetch(`/api/get-dbc-for-recording/${filepath}`, isProduction).then((resp) =>
        resp?.json(),
    );
}

// Fetch the recording data of a filepath (by querying the server) or from a
// directly uploaded file (drag-n-drop). Returned data is in Arrow Table format.
export async function getRecording(file: string | File, isProduction: boolean) {
    // Initializes WebAssembly memory for parquet-wasm, and gets a reference to it
    await wasmInit();
    const WASM_MEMORY = wasmMemory();

    let arrayBuffer: ArrayBuffer | undefined;

    // If `file` is a string, fetch it from the server. If it's a File, extract
    // the arraybuffer data from that directly
    if (typeof file == "string") {
        // string (pathname)
        const resp = await tryFetch(`/api/get-recording/${file}`, isProduction);
        arrayBuffer = await resp?.arrayBuffer();
    } else {
        // File object
        arrayBuffer = await file.arrayBuffer();
    }

    if (!arrayBuffer) {
        console.error("file is not a valid ArrayBuffer!");
        return;
    }

    const arrowTableWasm = readParquet(new Uint8Array(arrayBuffer)).intoFFI();
    const arrowTable = arrowJSFFI.parseTable(
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

export async function availableConfigs(isProduction: boolean): Promise<any[]> {
    const resp = await tryFetch(`/api/available-configs`, isProduction);
    return resp?.json()
}

export async function getConfig(file: string, isProduction: boolean){
    const resp = await tryFetch(`/api/get-config/${file}`, isProduction)
    return resp?.json()
}
