"use client"

import React, {useEffect, useState} from "react";
import ModalContainer from "@/app/components/ModalContainer";
import SubsystemPicker from "@/app/components/SubsystemPicker";
import CardLineChart from "@/app/components/TestChart";

import io from 'socket.io-client';
const sock = new WebSocket("wss://localhost");


const subsystems = [
    'Accumulator',
    'Electrical',
    'Dynamics',
]

import initWebSockets from "./websocket"

interface Message {
    timestamp: number;
    x: number;
    y: number;
}

export default function Home() {
    const [selectedSubsystem, setSelectedSubsystem] = useState<number>(0)
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        initWebSockets(sock)
    }, []);

    // on message received
    sock.onmessage = function (event) {
        console.log(event.data);
        const split = event.data.split('\n');
        setMessages([...messages, split])
    };

    return (
    <div className="pt-6">
        <header>
            <SubsystemPicker subsystems={subsystems} selectedSubsystem={selectedSubsystem} onSelectSubsystem={(a) => setSelectedSubsystem(a)}/>
        </header>
        <main>
            <div>
                {messages.length}
                {/*{messages.map((message, index) => (*/}
                {/*    <div key={index}>*/}
                {/*        <p>{message}</p>*/}
                {/*        <p>{message.timestamp}</p>*/}
                {/*        <p>{message.x}</p>*/}
                {/*        <p>{message.y}</p>*/}
                {/*    </div>*/}
                {/*))}*/}
            </div>

            {selectedSubsystem === 0 ? (
                <div className={"flex flex-row justify-evenly"}>
                    <ModalContainer>
                        <CardLineChart title={"Avg Tire Pressure"} color={"cornflowerblue"} range={40} speed={800} dataPoints={50} />
                    </ModalContainer>
                    <ModalContainer>
                        <CardLineChart title={"Temperature"} color={"red"} range={120} speed={400} dataPoints={100} />
                    </ModalContainer>
                </div>
            ) : null}
            {selectedSubsystem === 1 ? (
                <div className={"flex flex-row justify-evenly"}>
                    <ModalContainer>
                        <CardLineChart title={"Voltage"} color={"red"} range={15} speed={800} dataPoints={10}/>
                    </ModalContainer>
                    <ModalContainer>
                        <CardLineChart title={"Current"} color={"#00FF00"} range={250} speed={400} dataPoints={100}/>
                    </ModalContainer>
                </div>
            ) : null}
            {selectedSubsystem === 2 ? (
                <div className={"flex flex-row justify-evenly"}>
                    <ModalContainer>
                        <CardLineChart title={"Speed (MPH)"} color={"blue"} range={110} speed={800} dataPoints={10}/>
                    </ModalContainer>
                    <ModalContainer>
                        <CardLineChart title={"Voltage"} color={"#00FF00"} range={15} speed={400} dataPoints={100}/>
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
