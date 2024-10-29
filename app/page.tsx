"use client"

import Image from "next/image";
import React, {useEffect, useRef, useState} from "react";
import ModalContainer from "@/app/components/ModalContainer";
import SubsystemPicker from "@/app/components/SubsystemPicker";
import Chart from 'chart.js/auto';
import CardLineChart from "@/app/components/TestChart";


const data = {
    labels: [
        'Eating',
        'Drinking',
        'Sleeping',
        'Designing',
        'Coding',
        'Cycling',
        'Running'
    ],
    datasets: [{
        label: 'My First Dataset',
        data: [65, 59, 90, 81, 56, 55, 40],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)'
    }, {
        label: 'My Second Dataset',
        data: [28, 48, 40, 19, 96, 27, 100],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)'
    }]
};
// </block:setup>

// <block:config:0>
const config = {
    type: 'radar',
    data: data,
    options: {
        elements: {
            line: {
                borderWidth: 3
            }
        }
    },
};
// </block:config>

const subsystems = [
    'Accumulator',
    'Electrical',
    'Dynamics',
]


export default function Home() {
    const [selectedSubsystem, setSelectedSubsystem] = useState(0)
    // const chartRef = useRef<HTMLCanvasElement | null>(null);
    // const radarChartRef = useRef<Chart | null>(null);

    //
    // useEffect(() => {
    //     const initializeChart = () => {
    //         if (!chartRef.current) return;
    //
    //         // Destroy the previous chart instance if it exists
    //         radarChartRef.current?.destroy();
    //
    //         // Create a new radar chart
    //         radarChartRef.current = new Chart(chartRef.current, {
    //             type: "radar",
    //             data: data,
    //             options: {
    //                 responsive: true,
    //                 maintainAspectRatio: false,
    //                 elements: {
    //                     line: {
    //                         borderWidth: 3,
    //                     },
    //                 },
    //             },
    //         });
    //     };

        // Initialize the chart
    //     initializeChart();
    //
    //     // Cleanup function on component unmount
    //     return () => radarChartRef.current?.destroy();
    // }, []);

    return (
    <div className="pt-6">
        <header>
            <SubsystemPicker subsystems={subsystems} selectedSubsystem={selectedSubsystem} onSelectSubsystem={(a) => setSelectedSubsystem(a)}/>
        </header>
        <main>
            <div className={"flex flex-row justify-evenly"}>
                <ModalContainer>
                    <CardLineChart title={"Speed"} />
                </ModalContainer>
                <ModalContainer>
                    <p>Example 2</p>
                    <p>Example</p>
                    <p>Example</p>
                    <p>Example</p>
                    <p>Example</p>
                    <p>Example</p>
                    <p>Example</p>
                    <p>Example</p>
                    <p>Example</p>
                    <p>Example</p>
                    <p>Example</p>
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
