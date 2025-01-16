// The original goal of this file was to test the performance of various
// different methods of reading record batches from the arry ipc stream and
// storing the values for later use. My main error, which I discovered later,
// was that I was creating *separate* ipc streams for each record batch
// (including the start/end length metadata), which would prevent the
// RecordBatchStreamReader from reading past the first batch (see
// https://github.com/apache/arrow/issues/32593#issuecomment-1378117262). I
// never fixed that in this test file as I learned plenty about the performance
// of arrow-js objects in the process, but if I wanted to I'd likely just have
// to use a single long-standing RecordBatchStreamWriter like I did in the
// python backend.

"use client"

import React, { useEffect } from "react";
import { Float, RecordBatch, RecordBatchStreamReader, RecordBatchStreamWriter, Table, tableFromArrays, tableFromIPC } from "apache-arrow";
import assert from "assert";
import DataFrame from "./dataframe";

type Temp = {
  "1": Float, "2": Float, "3": Float, "4": Float, "5": Float, "6": Float, "7": Float, "8": Float, "9": Float, "10": Float,
  "11": Float, "12": Float, "13": Float, "14": Float, "15": Float, "16": Float, "17": Float, "18": Float, "19": Float, "20": Float,
  "21": Float, "22": Float, "23": Float, "24": Float, "25": Float, "26": Float, "27": Float, "28": Float, "29": Float, "30": Float,
  "31": Float, "32": Float, "33": Float, "34": Float, "35": Float, "36": Float, "37": Float, "38": Float, "39": Float, "40": Float,
  "41": Float, "42": Float, "43": Float, "44": Float, "45": Float, "46": Float, "47": Float, "48": Float, "49": Float, "50": Float,
  "51": Float, "52": Float, "53": Float, "54": Float, "55": Float, "56": Float, "57": Float, "58": Float, "59": Float, "60": Float,
  "61": Float, "62": Float, "63": Float, "64": Float, "65": Float, "66": Float, "67": Float, "68": Float, "69": Float, "70": Float,
  "71": Float, "72": Float, "73": Float, "74": Float, "75": Float, "76": Float, "77": Float, "78": Float, "79": Float, "80": Float,
  "81": Float, "82": Float, "83": Float, "84": Float, "85": Float, "86": Float, "87": Float, "88": Float, "89": Float, "90": Float,
  "91": Float, "92": Float, "93": Float, "94": Float, "95": Float, "96": Float, "97": Float, "98": Float, "99": Float, "100": Float,
}

export default function Home() {
  useEffect(() => {
    const arrs: Uint8Array[] = [];
    const tbls: Table[] = [];

    // build base tables/batches; 1000 batches with 100 columns and 10 rows each
    console.log("generating test data...");
    for (const n of Array.from({ length: 1000 }, (_, i) => i + 1)) {
      let obj: Record<string, number[]> = {};
      for (const k of Array.from({ length: 100 }, (_, i) => i + 1)) {
        obj[k.toString()] = [];
        for (const v of Array.from({ length: 10 }, (_, i) => i + 1)) {
          obj[k.toString()].push(Math.random() * v);
        }
      }
      const tbl = tableFromArrays(obj);

      assert(tbl.numCols == 100);
      assert(tbl.numRows == 10);
      tbls.push(tbl);

      // // This does the same as:
      // // const arr = RecordBatchStreamWriter.writeAll(tbl).toUint8Array(true)
      // // arrs.push(arr);
      // const arr = tableToIPC(tbl);
      // arrs.push(arr);
      // // Which is likely also the same as:
      // // const smallRBWriter = new RecordBatchStreamWriter<Temp>();
      // // smallRBWriter.writeAll(tbl);
      // // const arr = smallRBWriter.toUint8Array(true);
    }
    console.log("finished generating test data!");
    // const rbw = RecordBatchFileWriter.writeAll(tbls.map((t) => t.batches).flat());
    // downloadBlob(rbw.toUint8Array(true), "t1.arrow", "application/vnd.apache.arrow.file");

    // const bigRBWriter = new RecordBatchStreamWriter(); // {autoDestroy: true} is automatically passed
    // tbls.forEach((t) => {
    //   bigRBWriter.write(t)
    // }); // Write each table (recordbatch) to a big Uint8Array
    // const arrbig = bigRBWriter.toUint8Array(true)
    tbls.forEach((t) => {
      const writer = RecordBatchStreamWriter.writeAll(t);
      const arr = writer.toUint8Array(true);
      arrs.push(arr);
    });
    const arrbig = new Uint8Array(1000 * arrs[0].byteLength);
    arrs.forEach((arr, i) => arrbig.set(arr, i * arrs[0].byteLength));
    assert(arrbig.length == arrs.length * arrs[0].byteLength);
    assert(arrs.length == 1000);
    assert(tbls.length == 1000);

    {
      const start1 = performance.now();
      const arrs2: Uint8Array[] = [];
      let tbl: Table<Temp> | null = null;
      for (let i = 0; i < arrs.length; i++) {
        arrs2.push(arrs[i]);
        // const rbr: RecordBatchStreamReader = RecordBatchStreamReader.from(arrs2);
        // rbr.open();
        // const batches = rbr.readAll();
        // console.log(arrs2.length, rbr.numRecordBatches, batches.length, rbr.isSync(), rbr.isStream());
        const batches: RecordBatch[] = []
        const readers = RecordBatchStreamReader.readAll(arrs.slice(0, i));
        let q = 0;
        for (const reader of readers) {
          batches.push(reader.next().value);
          q++;
        }
        tbl = new Table<Temp>(batches);
        console.log(arrs2.length, q, batches.length);
      }
      const end1 = performance.now();
      console.log(`1: tableFromIPC on increasing Uint8Array[] of record batches using RecordBatchStreamReader: ${end1 - start1}ms`);
      console.log("tbl: ", tbl!.numRows, tbl!.numCols, arrbig.length, arrs.length, arrs[0].length);
      assert(tbl!.numRows == 10000);
      const start2 = performance.now();
      const vec = tbl!.getChild("37");
      assert(vec!.length == 10000);
      const end2 = performance.now();
      console.log(`1: tbl.getChild("37"): ${end2 - start2}ms`);
    }

    {
      const start1 = performance.now();
      let tbl: Table<Temp> | null = null;
      for (let i = 0; i < arrs.length; i++) {
        tbl = tableFromIPC<Temp>(arrbig.subarray(0, (i + 1) * arrs[0].length));
      }
      const end1 = performance.now();
      console.log(`1.5: tableFromIPC on slice of arrbig: ${end1 - start1}ms`);
      console.log("tbl: ", tbl!.numRows, tbl!.numCols, arrbig.length, arrs.length, arrs[0].length);
      assert(tbl!.numRows == 10000);
      const start2 = performance.now();
      const vec = tbl!.getChild("37");
      assert(vec!.length == 10000);
      const end2 = performance.now();
      console.log(`1.5: tbl.getChild("37"): ${end2 - start2}ms`);
    }

    {
      const start1 = performance.now();
      const dataFrames: DataFrame[] = []
      for (let i = 0; i < arrs.length; i++) {
        const tbl = tableFromIPC<Temp>(arrs[i]);
        const newFrames = Array.from({ length: tbl.numRows }, (_, i) => {
          const row = tbl.get(i)!.toArray() as number[];
          return new DataFrame(row);
        });
        dataFrames.push(...newFrames);
      }
      assert(dataFrames.length == 10000);
      const end1 = performance.now();
      console.log(`2: Storing a DataFrame[]: ${end1 - start1}ms`);
      const start2 = performance.now();
      const vec2 = dataFrames.map((d) => d["37"]);
      assert(vec2.length == 10000);
      const end2 = performance.now();
      console.log(`2: dataFrames.map((d) => d["37"]): ${end2 - start2}ms`);
    }

    {
      const start1 = performance.now();
      let soa: Record<string, Float32Array> = {};
      for (let k = 0; k < 100; k++) {
        soa[k.toString()] = new Float32Array(10000);
      }
      for (let i = 0; i < arrs.length; i++) {
        const tbl = tableFromIPC<Temp>(arrs[i]);
        for (let k = 0; k < 100; k++) {
          const arr = tbl.getChildAt(k)!.toArray();
          soa[k.toString()].set(arr, i * 10);
        }
      }
      const end1 = performance.now();
      console.log(`3: Creating a Record<string, Float32Array>: ${end1 - start1}ms`);
      const start2 = performance.now();
      const vec3 = soa["37"];
      assert(vec3.length == 10000);
      const end2 = performance.now();
      console.log(`3: soa["37"]: ${end2 - start2}ms`);
    }
  })

  return (
    <>
      <p>
        Performance tests...
      </p>
      <br />
      {/* <p>1: tbl.getChild("37"): {end1_2 - start1_2}ms</p> */}
      {/* <p>2: Storing a DataFrame[]: {end2_1 - start2_1}ms</p> */}
      {/* <p>2: dataFrames.map((d) = d["37"]): {end2_2 - start2_2}ms</p> */}
      {/* <p>3: Storing a DataFrame[]: {end3_1 - start3_1}ms</p> */}
      {/* <p>1: tableFromIPC on increasing Uint8Array[] of record batches: {end1_1 - start1_1}ms</p> */}
    </>
  );
}
