"use client"

import React, { useEffect, useRef, useState } from "react";
import SubsystemPicker from "@/app/components/SubsystemPicker";
import CardLineChart from "@/app/components/TestChart";
import Image from "next/image";

import { closeWebSocketConnection, initWebSocketConnection } from "./websocket";
import { availableRecordings, initRecordingData } from './http';
import { emptyDataArrays, DataArrays } from "./datatypes";

import StreamType from "@/models/StreamType";
import StreamTypePicker from "@/app/components/StreamTypePicker";

const subsystems = [
    'Accumulator',
    'Electrical',
    'Dynamics',
]

// The default number of rows of data to keep in the dataTrimmed arrays for use
// in 2d charts.
// TODO: Instead of this use setViewLength w/ something like startTime/endTime
// or a timeline UI
const DEFAULT_VIEW_LENGTH = 99999999; // 1300

export default function Home() {
    const [selectedSubsystem, setSelectedSubsystem] = useState<number>(0)

    const [websocketConnected, setWebsocketConnected] = useState<boolean>(false);

    const [recordings, setRecordings] = useState<string[]>([]);
    const [streamType, setStreamType] = useState<StreamType>(StreamType.NONE);
    const [chosenRecording, setChosenRecording] = useState<string | null>(null);

    useEffect(() => {
        const resetData = () => {
            data.current = emptyDataArrays()
            dataTrimmed.current = emptyDataArrays()
        };
        switch (streamType) {
            case StreamType.LIVE:
                resetData();
                initWebSocketConnection(setWebsocketConnected, data, dataTrimmed, setNumRows, viewLength);
            case StreamType.RECORDED:
                resetData();
                closeWebSocketConnection();
            case StreamType.NONE:
                closeWebSocketConnection();
        }
    }, [streamType])
    useEffect(() => {
        if (chosenRecording != null && chosenRecording != "") {
            initRecordingData(chosenRecording!, data, dataTrimmed, setNumRows, viewLength);
        }
    }, [chosenRecording]);

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

    const [isRecording, setIsRecording] = useState<boolean>(false);

    useEffect(() => {
        availableRecordings().then(r => setRecordings(r));
    }, []);

    // // Initializes WebSocket connection with proper hooks and refs etc
    // useEffect(() => {
    //     return initWebSocketConnection(
    //         setIsConnected, data, dataTrimmed, setNumRows, viewLength
    //     )
    // }, []);

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
            <div className={"pl-6 flex justify-between flex-row items-center"}>
                <Image src="/fs_logo.png" alt="logo" width={200} height={50} />
                {streamType == StreamType.LIVE && (
                    <button onClick={() => {
                        if (isRecording) {
                            setIsRecording(false)
                        } else {
                            setIsRecording(true)
                        }
                    }}
                        className={`m-4 p-2 px-4 rounded-xl ${isRecording ? "bg-red-600" : "bg-black"} flex items-center border-white border-2 border-opacity-40`}>
                        {isRecording ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                className="bi bi-record-fill animate-pulse" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10" />
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
                )}
                <StreamTypePicker
                    websocketConnected={websocketConnected}
                    recordings={recordings}
                    streamType={streamType}
                    setStreamType={setStreamType}
                    chosenRecording={chosenRecording!}
                    setChosenRecording={setChosenRecording as React.Dispatch<React.SetStateAction<string>>}
                />
            </div>
            <header className={"flex items-center justify-between"}>
                <SubsystemPicker subsystems={subsystems} selectedSubsystem={selectedSubsystem}
                    onSelectSubsystem={(a) => setSelectedSubsystem(a)} />
            </header>
            <main>
                {selectedSubsystem === 0 ? (
                    <div className={"grid grid-cols-1 md:grid-cols-2 gap-4 p-4"}>
                        {/* Accumulator Subsystem */}

                        <CardLineChart title={"Acc Temperature (C)"} color={"#ff6347"} numRows={numRows}
                            dataX={dataTrimmed.current[":Time"]}
                            dataY={[dataTrimmed.current["Seg0_TEMP_0"], dataTrimmed.current["Seg0_TEMP_1"], dataTrimmed.current["Seg0_TEMP_2"], dataTrimmed.current["Seg0_TEMP_3"], dataTrimmed.current["Seg0_TEMP_4"], dataTrimmed.current["Seg0_TEMP_5"], dataTrimmed.current["Seg0_TEMP_6"]]}
                        />
                        <CardLineChart title={"Acc Temperature (C)"} color={"#4682b4"} numRows={numRows}
                            dataX={dataTrimmed.current[":Time"]}
                            dataY={[dataTrimmed.current["Seg1_TEMP_0"], dataTrimmed.current["Seg1_TEMP_1"], dataTrimmed.current["Seg1_TEMP_2"], dataTrimmed.current["Seg1_TEMP_3"], dataTrimmed.current["Seg1_TEMP_4"], dataTrimmed.current["Seg1_TEMP_5"], dataTrimmed.current["Seg1_TEMP_6"]]}
                        />
                        <CardLineChart title={"Acc Temperature (C)"} color={"#ffa07a"} numRows={numRows}
                            dataX={dataTrimmed.current[":Time"]}
                            dataY={[dataTrimmed.current["Seg2_TEMP_0"], dataTrimmed.current["Seg2_TEMP_1"], dataTrimmed.current["Seg2_TEMP_2"], dataTrimmed.current["Seg2_TEMP_3"], dataTrimmed.current["Seg2_TEMP_4"], dataTrimmed.current["Seg2_TEMP_5"], dataTrimmed.current["Seg2_TEMP_6"]]}
                        />
                        <CardLineChart title={"Acc Temperature (C)"} color={"#ffd700"} numRows={numRows}
                            dataX={dataTrimmed.current[":Time"]}
                            dataY={[dataTrimmed.current["Seg3_TEMP_0"], dataTrimmed.current["Seg3_TEMP_1"], dataTrimmed.current["Seg3_TEMP_2"], dataTrimmed.current["Seg3_TEMP_3"], dataTrimmed.current["Seg3_TEMP_4"], dataTrimmed.current["Seg3_TEMP_5"], dataTrimmed.current["Seg3_TEMP_6"]]}
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
                <p className={"text-center"}>FS Live Visualization Demo ({numRows} rows)</p>
            </footer>
        </div>
    );
}
