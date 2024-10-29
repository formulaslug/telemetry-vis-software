"use client"

import React, {useState} from "react";
import ModalContainer from "@/app/components/ModalContainer";
import SubsystemPicker from "@/app/components/SubsystemPicker";
import CardLineChart from "@/app/components/TestChart";


const subsystems = [
    'Accumulator',
    'Electrical',
    'Dynamics',
]


export default function Home() {
    const [selectedSubsystem, setSelectedSubsystem] = useState(0)

    return (
    <div className="pt-6">
        <header>
            <SubsystemPicker subsystems={subsystems} selectedSubsystem={selectedSubsystem} onSelectSubsystem={(a) => setSelectedSubsystem(a)}/>
        </header>
        <main>
            <div className={"flex flex-row justify-evenly"}>
                <ModalContainer>
                    <CardLineChart title={"Speed"} color={"cornflowerblue"} range={10} speed={800} dataPoints={10} />
                </ModalContainer>
                <ModalContainer>
                    <CardLineChart title={"Voltage"} color={"red"} range={10} speed={400} dataPoints={100} />
                </ModalContainer>
            </div>
            <div className={"flex flex-row justify-evenly"}>
                <ModalContainer>
                    <p>Example 3</p>
                </ModalContainer>
                <ModalContainer>
                    <p>Example 4</p>
                </ModalContainer>
            </div>
        </main>
        <footer className="absolute row-start-3 flex gap-6 flex-wrap items-center justify-center bottom-0 right-0 left-0">
            <p className={"text-center"}>FS Live Visualization Demo</p>
        </footer>
    </div>
  );
}
