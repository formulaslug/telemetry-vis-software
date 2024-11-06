"use client"

import React, {useEffect, useState} from "react";
import ModalContainer from "@/app/components/ModalContainer";
import SubsystemPicker from "@/app/components/SubsystemPicker";
import CardLineChart from "@/app/components/TestChart";

import io from 'socket.io-client';

const subsystems = [
    'Accumulator',
    'Electrical',
    'Dynamics',
]

import initWebSockets from "./websocket"
import {tableFromIPC} from "apache-arrow";

interface Message {
    timestamp: number;
    voltage: number;
    temperature: number
    speed: number;
    blibblog: number;
}

export default function Home() {
    const [selectedSubsystem, setSelectedSubsystem] = useState<number>(0)
    const [messages, setMessages] = useState<Message[]>([]);
    const [connected, setConnected] = useState<boolean>(false);

    const [isRecording, setIsRecording] = useState<boolean>(false);

    // const [socketURL, setSocketURL] = useState<string>("localhost");
    const [socket, setSocket] = useState<WebSocket>(new WebSocket("wss://localhost"));

    useEffect(() => {
        // const url = process.env['HOST'] ?? "http://localhost";
        // setSocketURL(window.location.hostname);
        setSocket(new WebSocket("wss://" + window.location.hostname));
        initWebSockets(socket);
    }, []);

    useEffect(() => {
        if (!isRecording) {
            // code here to save to CSV

        }

    }, [isRecording]);

    socket.onopen = function (event) {
        setConnected(true)
    }

    socket.onclose = function (event) {
        setConnected(false)
    }

    // on message received
    socket.onmessage = function (event) {
        // console.log(event.data);

        const split_data = tableFromIPC(new Uint8Array(event.data)).get(0)!.toJSON() as Message
        console.log(split_data)
        // let copy = [...messages];
        // if (messages.length > 20) {
        //     copy.shift()
        // }
        setMessages([...messages, split_data])
    };

    return (
    <div className="pt-6">
        <header className={"flex items-center justify-between"}>
            <SubsystemPicker subsystems={subsystems} selectedSubsystem={selectedSubsystem} onSelectSubsystem={(a) => setSelectedSubsystem(a)}/>
            <button onClick={() => setIsRecording(prevState => !prevState)} className={`m-4 p-2 px-4 rounded-full ${isRecording ? "bg-red-600" : "bg-black"} flex items-center border-white border-2 border-opacity-40`}>
                {isRecording ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                             className="bi bi-record-fill animate-pulse" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10"/>
                        </svg>
                    ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                         className="bi bi-record" viewBox="0 0 16 16">
                        <path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8m0 1A5 5 0 1 0 8 3a5 5 0 0 0 0 10"/>
                    </svg>
                )
                }
                <p className={"ml-1"}>Record</p>
            </button>
        </header>
        <main>
            <div className={"flex absolute bottom-0 right-0 m-2"}>
                <div className={`rounded-full p-2 ${connected ? `bg-green-800` : 'bg-red-600'} text-center border-white border-2 border-opacity-20 text-opacity-80 font-bold text-white text-xs`}>
                    {connected ? (
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
                <div className={"flex flex-row justify-evenly"}>
                    <ModalContainer>
                        <CardLineChart title={"Voltage"} color={"cornflowerblue"} range={40} speed={800} dataPoints={50} data={
                            messages.map((message) => message.voltage)
                        }/>
                    </ModalContainer>
                    <ModalContainer>
                        <CardLineChart title={"Temperature"} color={"red"} range={120} speed={400} dataPoints={100} data={
                            messages.map((message) => message.temperature)
                        }/>
                    </ModalContainer>
                </div>
            ) : null}
            {selectedSubsystem === 1 ? (
                <div className={"flex flex-row justify-evenly"}>
                    <ModalContainer>
                        <CardLineChart title={"Voltage"} color={"red"} range={15} speed={800} dataPoints={10} data={
                            messages.map((message) => message.voltage)
                        }/>
                    </ModalContainer>
                    <ModalContainer>
                        <CardLineChart title={"Current"} color={"#00FF00"} range={250} speed={400} dataPoints={100} data={[]}/>
                    </ModalContainer>
                </div>
            ) : null}
            {selectedSubsystem === 2 ? (
                <div className={"flex flex-row justify-evenly"}>
                    <ModalContainer>
                        <CardLineChart title={"Speed (MPH)"} color={"blue"} range={110} speed={800} dataPoints={10} data={[]}/>
                    </ModalContainer>
                    <ModalContainer>
                        <CardLineChart title={"Voltage"} color={"#00FF00"} range={15} speed={400} dataPoints={100} data={[]}/>
                    </ModalContainer>
                </div>
            ) : null}
            {/*<div className={"flex flex-row justify-evenly"}>*/}
            {/*    <ModalContainer>*/}
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
        <p className={"text-center"}>FS Live Visualization Demo</p>
        </footer>
    </div>
  );
}
