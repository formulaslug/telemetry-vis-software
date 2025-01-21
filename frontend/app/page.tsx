"use client"

import React, { useEffect, useRef, useState } from "react";
import ModalContainer from "@/app/components/ModalContainer";
import SubsystemPicker from "@/app/components/SubsystemPicker";
import CardLineChart from "@/app/components/TestChart";
import Image from "next/image";
import initWebSocketConnection from "./websocket";
import { emptyDataArrays as emptyDataArrays, DataArrays } from "./datatypes";

import Papa from 'papaparse';
import availableRecordings from "./http";

const subsystems = [
    'Accumulator',
    'Electrical',
    'Dynamics',
]

// The default number of rows of data to keep in the dataTrimmed arrays for use
// in 2d charts.
// TODO: Instead of this use setViewLength w/ something like startTime/endTime
// or a timeline UI
const DEFAULT_VIEW_LENGTH = 1300

export default function Home() {
    const [selectedSubsystem, setSelectedSubsystem] = useState<number>(0)

    // // We store one main arrow Table which we concatenate all new data rows
    // // onto.
    // const dataTable = useRef<Table<DataRow>>(new Table(schema));

    // A simple integer incremented when a new row is added to data. Used to
    // force chart rerenders
    const [numRows, setNumRows] = useState(0);
    // A dictionary of column names to arrays, which are updated with all values
    // received over the websocket (organized by columns). This is the single
    // source of truth of telemetry data.
    const data = useRef<DataArrays>(emptyDataArrays());
    // A shorter copy that's kept to length viewLength for easier use
    // in creating 2d charts.
    const dataTrimmed = useRef<DataArrays>(emptyDataArrays());
    // Number of points of data to display in 2D graphs. 
    // // The last point shown corresponds to data at viewTimestamp.
    const [viewLength, setViewLength] = useState<number>(DEFAULT_VIEW_LENGTH);
    // // Current timestamp (in seconds) of data to visualize.
    // const [viewTimestamp, setViewTimestamp] = useState<number>(0);

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);

    // Initializes WebSocket connection with proper hooks and refs etc
    useEffect(() => {
        availableRecordings().then(d => console.log(d));
        return initWebSocketConnection(
            setIsConnected, data, dataTrimmed, setNumRows, viewLength
        )
    }, []);


    useEffect(() => {
        if (!isRecording && numRows > 0) {
            // not sure how to "transpose" obj of arrays to array of objs. Plus,
            // this should use parquet anyways
            // const csv = Papa.unparse(dataColArrays);
            // const blob = new Blob([csv], { type: 'text/csv' });
            // const link = document.createElement('a');
            // link.href = URL.createObjectURL(blob);
            // link.download = 'FS-Data.csv';
            // link.click();

            // const handleFilterData = () => {
            //     if (startTime && endTime) {
            //       // Filter messages within the specified range
            //       const filtered = originalMessages.filter((message) => {
            //         return (
            //           message.timestamp >= Number(startTime) && message.timestamp <= Number(endTime)
            //         );
            //       });
            //
            //       // Convert the filtered messages to CSV and trigger download
            //       const csv = Papa.unparse(filtered);
            //       const blob = new Blob([csv], { type: "text/csv" });
            //       const link = document.createElement("a");
            //       link.href = URL.createObjectURL(blob);
            //       link.download = `filtered_messages_${startTime}_${endTime}.csv`;
            //       link.click();
            //     } else {
            //       alert("Please enter a valid start and end time.");
            //     }
            //   };
            //
            //   const timeRangeInterface = (
            //     <div className="m-4">
            //       <h2>Filter Data by Time Range</h2>
            //       <div className="flex flex-col">
            //         <label htmlFor="start-time">Start Time</label>
            //         <input
            //           id="start-time"
            //           type="number"
            //           value={startTime}
            //           onChange={(e) => setStartTime(e.target.value)}
            //           placeholder="Enter start time"
            //           className="p-2 border"
            //         />
            //         <label htmlFor="end-time" className="mt-2">End Time</label>
            //         <input
            //           id="end-time"
            //           type="number"
            //           value={endTime}
            //           onChange={(e) => setEndTime(e.target.value)}
            //           placeholder="Enter end time"
            //           className="p-2 border"
            //         />
            //       </div>
            //       <button
            //         onClick={handleFilterData}
            //         className="mt-4 bg-blue-600 text-white p-2 rounded"
            //       >
            //         Download Filtered CSV
            //       </button>
            //     </div>
            //   );
        }

    }, [isRecording]);


    return (
        <div className="pt-4">
            <div className={"pl-6 flex justify-between flex-row"}>
                <Image src="/fs_logo.png" alt="logo" width={200} height={50} />
                <button onClick={() => {
                    if (isRecording) {
                        setIsRecording(false)
                        // setEndTime(messages[messages.length - 1].timestamp);
                    } else {
                        setIsRecording(true)
                        // setStartTime(messages[messages.length - 1].timestamp);
                    }
                }}
                    className={`m-4 p-2 px-4 rounded-xl ${isRecording ? "bg-red-600" : "bg-black"} flex items-center border-white border-2 border-opacity-40`}>
                    {isRecording ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            className="bi bi-record-fill animate-pulse" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            className="bi bi-record" viewBox="0 0 16 16">
                            <path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8m0 1A5 5 0 1 0 8 3a5 5 0 0 0 0 10" />
                        </svg>
                    )
                    }
                    <p className={"ml-1"}>Record</p>
                </button>
            </div>
            <header className={"flex items-center justify-between"}>
                <SubsystemPicker subsystems={subsystems} selectedSubsystem={selectedSubsystem}
                    onSelectSubsystem={(a) => setSelectedSubsystem(a)} />
            </header>
            <main>
                <div className={"flex absolute bottom-0 right-0 m-2"}>
                    <div
                        className={`rounded-full p-2 ${isConnected ? `bg-green-800` : 'bg-red-600'} text-center border-white border-2 border-opacity-20 text-opacity-80 font-bold text-white text-xs`}>
                        {isConnected ? (
                            <p>Connected</p>
                        ) : (
                            <p>Not Connected</p>
                        )}
                    </div>
                </div>

                {selectedSubsystem === 0 ? (
                    <div className={"grid grid-cols-1 md:grid-cols-2 gap-4 p-4"}>
                        {/* Accumulator Subsystem */}

                        <CardLineChart title={"Acc Temperature (C)"} color={"#ff6347"} numRows={numRows}
                            dataX={dataTrimmed.current[":Time"]}
                            dataY={[dataTrimmed.current["APPS_1"],]}
                        />
                        <CardLineChart title={"Acc Temperature (C)"} color={"#4682b4"} numRows={numRows}
                            dataX={dataTrimmed.current[":Time"]}
                            dataY={[dataTrimmed.current["APPS_2"],]}
                        />
                        <CardLineChart title={"Acc Temperature (C)"} color={"#ffa07a"} numRows={numRows}
                            dataX={dataTrimmed.current[":Time"]}
                            dataY={[dataTrimmed.current["BMS_Fault"],]}
                        />
                        <CardLineChart title={"Acc Temperature (C)"} color={"#ffd700"} numRows={numRows}
                            dataX={dataTrimmed.current[":Time"]}
                            dataY={[dataTrimmed.current["GPSi_NumHighCNo"],]}
                        />

                    </div>
                ) : null}

                {/* {selectedSubsystem === 1 ? ( */}
                {/*     <div className={"grid grid-cols-2 gap-6 p-6"}> */}
                {/* Electrical Subsystem */}
                {/*         <ModalContainer> */}
                {/*             <CardLineChart title={"Brake Pressure Front (PSI)"} color={"#8b4513"} numRows={numRows} */}
                {/*                 dataX={dataTrimmed.current["Timestamp(s)"]} */}
                {/*                 dataY={[dataTrimmed.current["Brake Pressure Front(PSI)"],]} */}
                {/*             /> */}
                {/*         </ModalContainer> */}
                {/*         <ModalContainer> */}
                {/*             <CardLineChart title={"Brake Pressure Rear (PSI)"} color={"#a52a2a"} numRows={numRows} */}
                {/*                 dataX={dataTrimmed.current["Timestamp(s)"]} */}
                {/*                 dataY={[dataTrimmed.current["Brake Pressure Rear(PSI)"],]} */}
                {/*             /> */}
                {/*         </ModalContainer> */}
                {/*         <ModalContainer> */}
                {/*             <CardLineChart title={"Current to Acc (A)"} color={"#4682b4"} numRows={numRows} */}
                {/*                 dataX={dataTrimmed.current["Timestamp(s)"]} */}
                {/*                 dataY={[dataTrimmed.current["Current to Acc(A)"],]} */}
                {/*             /> */}
                {/*         </ModalContainer> */}
                {/*         <ModalContainer> */}
                {/*             <CardLineChart title={"Steering (Deg)"} color={"#ff69b4"} numRows={numRows} */}
                {/*                 dataX={dataTrimmed.current["Timestamp(s)"]} */}
                {/*                 dataY={[dataTrimmed.current["Steering(Deg)"],]} */}
                {/*             /> */}
                {/*         </ModalContainer> */}
                {/*     </div> */}
                {/* ) : null} */}

                {/* {selectedSubsystem === 2 ? ( */}
                {/*     <div className={"flex flex-col md:flex-row md:flex-wrap gap-4 p-4"}> */}
                {/* Dynamics Subsystem */}
                {/*         <ModalContainer> */}
                {/*             <CardLineChart title={"Speed (MPH)"} color={"#4169e1"} numRows={numRows} */}
                {/*                 dataX={dataTrimmed.current["Timestamp(s)"]} */}
                {/*                 dataY={[dataTrimmed.current["Speed(mph)"],]} */}
                {/*             /> */}
                {/*         </ModalContainer> */}
                {/*         <ModalContainer> */}
                {/*             <CardLineChart title={"Altitude (ft)"} color={"#696969"} numRows={numRows} */}
                {/*                 dataX={dataTrimmed.current["Timestamp(s)"]} */}
                {/*                 dataY={[dataTrimmed.current["Altitude(ft)"],]} */}
                {/*             /> */}
                {/*         </ModalContainer> */}
                {/*         <ModalContainer> */}
                {/*             <CardLineChart title={"x Acceleration (m/s^2)"} color={"#228b22"} numRows={numRows} */}
                {/*                 dataX={dataTrimmed.current["Timestamp(s)"]} */}
                {/*                 dataY={[dataTrimmed.current["x acceleration(m/s^2)"],]} */}
                {/*             /> */}
                {/*         </ModalContainer> */}
                {/*         <ModalContainer> */}
                {/*             <CardLineChart title={"y Acceleration (m/s^2)"} color={"#ff8c00"} numRows={numRows} */}
                {/*                 dataX={dataTrimmed.current["Timestamp(s)"]} */}
                {/*                 dataY={[dataTrimmed.current["y acceleration(m/s^2)"],]} */}
                {/*             /> */}
                {/*         </ModalContainer> */}
                {/*     </div> */}
                {/* ) : null} */}
            </main>
            <footer
                className="absolute row-start-3 flex gap-6 flex-wrap items-center justify-center bottom-0 right-0 left-0">
                <p className={"text-center"}>FS Live Visualization Demo ({numRows})</p>
            </footer>
        </div>
    );
}
