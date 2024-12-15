"use client"

import React, { useEffect, useRef, useState } from "react";
import ModalContainer from "@/app/components/ModalContainer";
import SubsystemPicker from "@/app/components/SubsystemPicker";
import CardLineChart from "@/app/components/TestChart";
import Image from "next/image";
import initWebSocketConnection from "./websocket";
import { DataColDict, DataRow } from "./datatypes";

import Papa from 'papaparse';
import { Table } from "apache-arrow";

const subsystems = [
    'Accumulator',
    'Electrical',
    'Dynamics',
]

// This is how many rows from the main table are kept in each column vector in
// columnDict.
// TODO: Instead of this use something like startTime/endTime or a timeline UI
const NUM_ROWS = 1300

export default function Home() {
    const [selectedSubsystem, setSelectedSubsystem] = useState<number>(0)

    // const [dataFrames, setDataFrames] = useState<DataRow[]>([]);

    // We store one main arrow Table which we concatenate all new data rows
    // onto.
    // const dataTable = useRef<Table<DataRow>>(new Table(new Schema<DataRow>([Field.new({name: "test", type: new Float32()})])));
    const dataTable = useRef<Table<DataRow>>(new Table());

    // In addition to the main arrow Table, we store a dictionary of column_name
    // to an arrow Vector of that column's data type. These vectors are simply
    // small windows (slices) into the main Table that are then used to render
    // charts.
    // const columnDict = useRef<DataColDict>(Object.fromEntries(Array.from({length: NUM_ROWS}, (_, i) => [, new Vector()])));
    const columnDict = useRef<DataColDict>({} as DataColDict);

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<number | string>("");
    const [endTime, setEndTime] = useState<number | string>("");

    // Initializes WebSocket with proper hooks to update dataFrames and isConnected
    useEffect(() => initWebSocketConnection(setIsConnected, dataTable, columnDict, NUM_ROWS), []);


    useEffect(() => {
        if (!isRecording && dataTable.current.numRows > 0) {
            const csv = Papa.unparse(dataTable.current.toArray());
            const blob = new Blob([csv], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'FS-Data.csv';
            link.click();
            //
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
                {/*<div>*/}
                {/*    {messages.length}*/}
                {/*    /!*{messages.map((message, index) => (*!/*/}
                {/*    /!*    <div key={index}>*!/*/}
                {/*    /!*        /!*<p>{message}</p>*!/*!/*/}
                {/*    /!*        /!*<p>{message.timestamp}</p>*!/*!/*/}
                {/*    /!*        /!*<p>{message.x}</p>*!/*!/*/}
                {/*    /!*        /!*<p>{message.y}</p>*!/*!/*/}
                {/*    /!*    </div>*!/*/}
                {/*    /!*))}*!/*/}
                {/*</div>*/}

                {selectedSubsystem === 0 ? (
                    <div className={"grid grid-cols-1 md:grid-cols-2 gap-4 p-4"}>
                        {/* Accumulator Subsystem */}
                        <ModalContainer>
                            <CardLineChart title={"Acc Temperature (C)"} color={"#ff6347"}
                                dataX={columnDict.current["Timestamp(s)"]}
                                dataY={[columnDict.current["Acc Temp 1(Cel)"],]}
                            />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Acc Voltage (V)"} color={"#4682b4"}
                                dataX={columnDict.current["Timestamp(s)"]}
                                dataY={[columnDict.current["Acc Voltage 1(V)"],]}
                            />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Acc Air Intake Temp (C)"} color={"#ffa07a"}
                                dataX={columnDict.current["Timestamp(s)"]}
                                dataY={[columnDict.current["Acc Air Intake Temp(C)"],]}
                            />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Acc Air Exhaust Temp (C)"} color={"#ffd700"}
                                dataX={columnDict.current["Timestamp(s)"]}
                                dataY={[columnDict.current["Acc Air Exhaust Temp(C)"],]}
                            />
                        </ModalContainer>
                    </div>
                ) : null}

                {selectedSubsystem === 1 ? (
                    <div className={"grid grid-cols-2 gap-6 p-6"}>
                        {/* Electrical Subsystem */}
                        <ModalContainer>
                            <CardLineChart title={"Brake Pressure Front (PSI)"} color={"#8b4513"}
                                dataX={columnDict.current["Timestamp(s)"]}
                                dataY={[columnDict.current["Brake Pressure Front(PSI)"],]}
                            />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Brake Pressure Rear (PSI)"} color={"#a52a2a"}
                                dataX={columnDict.current["Timestamp(s)"]}
                                dataY={[columnDict.current["Brake Pressure Rear(PSI)"],]}
                            />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Current to Acc (A)"} color={"#4682b4"}
                                dataX={columnDict.current["Timestamp(s)"]}
                                dataY={[columnDict.current["Current to Acc(A)"],]}
                            />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Steering (Deg)"} color={"#ff69b4"}
                                dataX={columnDict.current["Timestamp(s)"]}
                                dataY={[columnDict.current["Steering(Deg)"],]}
                            />
                        </ModalContainer>
                    </div>
                ) : null}

                {selectedSubsystem === 2 ? (
                    <div className={"flex flex-col md:flex-row md:flex-wrap gap-4 p-4"}>
                        {/* Dynamics Subsystem */}
                        <ModalContainer>
                            <CardLineChart title={"Speed (MPH)"} color={"#4169e1"}
                                dataX={columnDict.current["Timestamp(s)"]}
                                dataY={[columnDict.current["Speed(mph)"],]}
                            />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Altitude (ft)"} color={"#696969"}
                                dataX={columnDict.current["Timestamp(s)"]}
                                dataY={[columnDict.current["Altitude(ft)"],]}
                            />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"x Acceleration (m/s^2)"} color={"#228b22"}
                                dataX={columnDict.current["Timestamp(s)"]}
                                dataY={[columnDict.current["x acceleration(m/s^2)"],]}
                            />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"y Acceleration (m/s^2)"} color={"#ff8c00"}
                                dataX={columnDict.current["Timestamp(s)"]}
                                dataY={[columnDict.current["y acceleration(m/s^2)"],]}
                            />
                        </ModalContainer>
                    </div>
                ) : null}
            </main>
            <footer
                className="absolute row-start-3 flex gap-6 flex-wrap items-center justify-center bottom-0 right-0 left-0">
                <p className={"text-center"}>FS Live Visualization Demo ({dataTable.current.numRows} rows)</p>
            </footer>
        </div>
    );
}
