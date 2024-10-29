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
            {selectedSubsystem === "Accumulator" || selectedSubsystem === 0 ? (
                <div className={"flex flex-row justify-evenly"}>
                    <ModalContainer>
                        <CardLineChart title={"Avg Tire Pressure"} color={"cornflowerblue"} range={40} speed={800} dataPoints={50} />
                    </ModalContainer>
                    <ModalContainer>
                        <CardLineChart title={"Temperature"} color={"red"} range={120} speed={400} dataPoints={100} />
                    </ModalContainer>
                </div>
            ) : null}
            {selectedSubsystem === "Electrical" || selectedSubsystem === 1 ? (
                <div className={"flex flex-row justify-evenly"}>
                    <ModalContainer>
                        <CardLineChart title={"Voltage"} color={"red"} range={15} speed={800} dataPoints={10} />
                    </ModalContainer>
                    <ModalContainer>
                        <CardLineChart title={"Current"} color={"#00FF00"} range={250} speed={400} dataPoints={100} />
                    </ModalContainer>
                </div>
            ) : null}
            {selectedSubsystem === "Dynamics" || selectedSubsystem === 2 ? (
                <div className={"flex flex-row justify-evenly"}>
                    <ModalContainer>
                        <CardLineChart title={"Speed (MPH)"} color={"blue"} range={110} speed={800} dataPoints={10} />
                    </ModalContainer>
                    <ModalContainer>
                        <CardLineChart title={"Voltage"} color={"#00FF00"} range={15} speed={400} dataPoints={100} />
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
        <footer className="absolute row-start-3 flex gap-6 flex-wrap items-center justify-center bottom-0 right-0 left-0">
            <p className={"text-center"}>FS Live Visualization Demo</p>
        </footer>
    </div>
  );
}
