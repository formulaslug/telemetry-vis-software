"use client"

import React, { useEffect, useRef, useState } from "react";
import SubsystemPicker from "@/app/components/SubsystemPicker";
import CardLineChart from "@/app/components/TestChart";
import Image from "next/image";

import { closeWebSocketConnection, initWebSocketConnection } from "./websocket";
import { availableRecordings, initRecordingSource } from './http';
import {DataArrays, ColumnName, nullDataArrays } from "./datatypes";

import StreamType from "@/models/StreamType";
import StreamTypePicker from "@/app/components/StreamTypePicker";
import { Record } from "@phosphor-icons/react";
import ItemContainer from "./components/ItemContainer";


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
        if (streamType == StreamType.LIVE) {
            initWebSocketConnection(setWebsocketConnected, data, dataTrimmed, setNumRows, viewLength);
        }
        // It is REQUIRED that this useEffect returns the socket close function,
        // otherwise for some reason it will never initiate. I have no idea why.
        return closeWebSocketConnection;
        
    }, [streamType])
    useEffect(() => {
        if (chosenRecording != null && chosenRecording != "") {
            initRecordingSource(chosenRecording!, data, dataTrimmed, setNumRows, viewLength);
        }
    }, [chosenRecording]);

    // A simple integer incremented when a new row is added to data. Used to
    // force chart rerenders
    const [numRows, setNumRows] = useState(0);
    // A dictionary of column names to arrays, which are updated with all values
    // received over the websocket (organized by columns). This is the single
    // source of truth of telemetry data.
    const data = useRef<DataArrays>(nullDataArrays());
    // A shorter copy that's kept to length viewLength for easier use
    // in creating 2d charts.
    const dataTrimmed = useRef<DataArrays>(nullDataArrays());
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

    const LineChart: React.FC<{
        title: string,
        dataXKey?: ColumnName,
        dataYKeys: ColumnName[],
        dataXUnits?: string,
        dataYUnits: string,
    }> = ({ title, dataXKey, dataYKeys, dataXUnits, dataYUnits }) => {
        const dataYArrs = dataYKeys.map(k => dataTrimmed.current[k]).filter(a => a != null);
        const dataXArr = dataTrimmed.current[dataXKey ?? ":Time"] ?? [];
        return <ItemContainer>
            <CardLineChart title={title} numRows={numRows}
                dataX={dataXArr}
                dataY={dataYArrs}
                datasetNames={dataYKeys
                    .filter(k => dataTrimmed.current[k] != null)
                    .map(k => k.toString())
                }
                dataXUnits={dataXUnits ?? "Time (s)"}
                dataYUnits={dataYUnits}
            />
        </ItemContainer>;
    };

    return (
        <div className="pt-4 bg-background-1">
            <div className={"pl-6 flex justify-between flex-row items-center"}>
                <Image src="/fs_logo.png" alt="fs-logo" width={100} height={40} />
                {streamType == StreamType.LIVE && (
                    <button onClick={() => setIsRecording(!isRecording)}
                        className={`m-4 p-2 px-4 rounded-xl ${isRecording ? "bg-red-600" : "bg-black"} flex items-center border-white border-2 border-opacity-40`}>
                        <Record />
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
                        <LineChart
                            title={"Acc Seg 0"}
                            dataYKeys={["Seg0_TEMP_0", "Seg0_TEMP_1", "Seg0_TEMP_2", "Seg0_TEMP_3", "Seg0_TEMP_4", "Seg0_TEMP_5", "Seg0_TEMP_6"]}
                            dataYUnits={"Temperature (°C)"}
                        />
                        <LineChart
                            title={"Acc Seg 1"}
                            dataYKeys={["Seg1_TEMP_0", "Seg1_TEMP_1", "Seg1_TEMP_2", "Seg1_TEMP_3", "Seg1_TEMP_4", "Seg1_TEMP_5", "Seg1_TEMP_6"]}
                            dataYUnits={"Temperature (°C)"}
                        />
                        <LineChart
                            title={"Acc Seg 2"}
                            dataYKeys={["Seg2_TEMP_0", "Seg2_TEMP_1", "Seg2_TEMP_2", "Seg2_TEMP_3", "Seg2_TEMP_4", "Seg2_TEMP_5", "Seg2_TEMP_6"]}
                            dataYUnits={"Temperature (°C)"}
                        />
                        <LineChart
                            title={"Acc Seg 3"}
                            dataYKeys={["Seg3_TEMP_0", "Seg3_TEMP_1", "Seg3_TEMP_2", "Seg3_TEMP_3", "Seg3_TEMP_4", "Seg3_TEMP_5", "Seg3_TEMP_6"]}
                            dataYUnits={"Temperature (°C)"}
                        />
                    </div>
                ) : null}
            </main>
            <footer>
                <p className={"text-center"}>FS Live Visualization Demo ({numRows} rows)</p>
            </footer>
        </div>
    );
}
