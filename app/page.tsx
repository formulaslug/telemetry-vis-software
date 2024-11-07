"use client"

import React, { useEffect, useRef, useState } from "react";
import ModalContainer from "@/app/components/ModalContainer";
import SubsystemPicker from "@/app/components/SubsystemPicker";
import CardLineChart from "@/app/components/TestChart";
import Image from "next/image";
import initWebSocket from "./websocket";
import DataFrame from "./message";

import Papa from 'papaparse';

const subsystems = [
    'Accumulator',
    'Electrical',
    'Dynamics',
]

export default function Home() {
    const [selectedSubsystem, setSelectedSubsystem] = useState<number>(0)
    const [dataFrames, setDataFrames] = useState<DataFrame[]>([]);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [originalDataFrames, setOriginalDataFrames] = useState<DataFrame[]>([]); // To store original dataframes
    const [startTime, setStartTime] = useState<number | string>("");
    const [endTime, setEndTime] = useState<number | string>("");
        
    // Initializes WebSocket with proper hooks to update dataFrames and isConnected
    useEffect(() => initWebSocket(setIsConnected, setDataFrames), []);

    useEffect(() => {
        if (!isRecording && dataFrames.length > 0) {
            setOriginalDataFrames(dataFrames);
            const csv = Papa.unparse(dataFrames);
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
                            <CardLineChart title={"Acc Temperature (C)"} color={"#ff6347"} range={120} speed={400}
                                dataPoints={50} data={
                                    //@ts-ignore
                                    dataFrames.map((message) => message["Acc Temp 1(Cel)"])
                                } />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Acc Voltage (V)"} color={"#4682b4"} range={40} speed={800}
                                dataPoints={50} data={
                                    //@ts-ignore
                                    dataFrames.map((message) => message["Acc Voltage 1(V)"])
                                } />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Acc Air Intake Temp (C)"} color={"#ffa07a"} range={100} speed={400}
                                dataPoints={50} data={
                                    //@ts-ignore
                                    dataFrames.map((message) => message["Acc Temp 2(Cel)"])
                                } />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Acc Air Exhaust Temp (C)"} color={"#ffd700"} range={100} speed={400}
                                dataPoints={50} data={
                                    //@ts-ignore
                                    dataFrames.map((message) => message["Acc Temp 16(Cel)"])
                                } />
                        </ModalContainer>
                    </div>
                ) : null}

                {selectedSubsystem === 1 ? (
                    <div className={"grid grid-cols-2 gap-6 p-6"}>
                        {/* Electrical Subsystem */}
                        <ModalContainer>
                            <CardLineChart title={"Brake Pressure Front (PSI)"} color={"#8b4513"} range={100}
                                speed={400} dataPoints={50} data={
                                    //@ts-ignore
                                    dataFrames.map((message) => message.blibblog)
                                } />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Brake Pressure Rear (PSI)"} color={"#a52a2a"} range={100} speed={400}
                                dataPoints={50} data={
                                    //@ts-ignore
                                    dataFrames.map((message) => message.blibblog)
                                } />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Current to Acc (A)"} color={"#4682b4"} range={300} speed={400}
                                dataPoints={50} data={
                                    //@ts-ignore
                                    dataFrames.map((message) => message.blibblog)
                                } />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Steering (Deg)"} color={"#ff69b4"} range={180} speed={400}
                                dataPoints={50} data={
                                    //@ts-ignore
                                    dataFrames.map((message) => message.blibblog)
                                } />
                        </ModalContainer>
                    </div>
                ) : null}

                {selectedSubsystem === 2 ? (
                    <div className={"flex flex-col md:flex-row md:flex-wrap gap-4 p-4"}>
                        {/* Dynamics Subsystem */}
                        <ModalContainer>
                            <CardLineChart title={"Speed (MPH)"} color={"#4169e1"} range={120} speed={800}
                                dataPoints={50} data={
                                    //@ts-ignore
                                    dataFrames.map((message) => message.speed)
                                } />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"Altitude (ft)"} color={"#696969"} range={1000} speed={400}
                                dataPoints={50} data={
                                    //@ts-ignore
                                    dataFrames.map((message) => message.blibblog)
                                } />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"x Acceleration (m/s^2)"} color={"#228b22"} range={15} speed={400}
                                dataPoints={50} data={
                                    //@ts-ignore
                                    dataFrames.map((message) => message.blibblog)
                                } />
                        </ModalContainer>
                        <ModalContainer>
                            <CardLineChart title={"y Acceleration (m/s^2)"} color={"#ff8c00"} range={15} speed={400}
                                dataPoints={50} data={
                                    //@ts-ignore
                                    dataFrames.map((message) => message.blibblog)
                                } />
                        </ModalContainer>
                    </div>
                ) : null} {/*    <ModalContainer>*/}
                {/*        <CardLineChart title={"Speed"} color={"cornflowerblue"} range={10} speed={800} dataPoints={10} />*/}
                {/*    </ModalContainer>*/}
                {/*    <ModalContainer>*/}
                {/*        <CardLineChart title={"Voltage"} color={"red"} range={10} speed={400} dataPoints={100} />*/}
                {/*    </ModalContainer>*/}
                {/*</div>*/}
                {/*<div className={"flex flex-row justify-evenly"}>*/}
                {/*    <ModalContainer>*/}
                {/*        <CardLineChart title={"Power Used"} color={"#00FF00"} range={10} speed={1000} dataPoints={20} />*/}
                {/*    </ModalContainer>*/}
                {/*    <ModalContainer>*/}
                {/*        <CardLineChart title={"Air Resistance"} color={"#ff7700"} range={10} speed={1000} dataPoints={20} />*/}
                {/*    </ModalContainer>*/}
                {/*</div>*/}
            </main>
            <footer
                className="absolute row-start-3 flex gap-6 flex-wrap items-center justify-center bottom-0 right-0 left-0">
                <p className={"text-center"}>FS Live Visualization Demo {dataFrames.length}</p>
            </footer>
        </div>
    );
}
