"use client";
import CarWireframe from "../components/CarWireframe";
import GForceGauge from "../components/GForceGauge";
import SuspensionGauge from "../components/SuspensionGauge";
import Navbar from "./Navbar";
import { Layout, Model, TabNode } from "flexlayout-react";
import "./dark-rounded.css";
import { RangeSlider } from "@mantine/core";
import { Play } from "@phosphor-icons/react";
import LineChart from "../components/LineChart";
import { useEffect, useRef, useState } from "react";

function DemoChart() {
    return (
        <>
            <LineChart
                title="Demo"
                numRows={10}
                dataX={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                dataY={[[10, 20, 30, 5, 10, 14, 13, 4, 2, 30]]}
                dataXUnits={"Time (s)"}
                dataYUnits={"Num"}
            />
        </>
    );
}

const model = Model.fromJson({
    global: {},
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "row",
                weight: 30,
                children: [
                    {
                        type: "tabset",
                        weight: 50,
                        children: [
                            {
                                type: "tab",
                                name: "Suspension",
                                component: "suspension-gauge",
                            },
                        ],
                    },
                    {
                        type: "tabset",
                        weight: 50,
                        children: [
                            {
                                type: "tab",
                                name: "CarWireframe",
                                component: "car-wireframe",
                            },
                            { type: "tab", name: "G-Force Gauge", component: "g-force-gauge" },
                        ],
                    },
                ],
            },
            {
                type: "row",
                weight: 70,
                children: [
                    {
                        type: "tabset",
                        weight: 33,
                        children: [
                            {
                                type: "tab",
                                name: "Chart 1",
                                component: "demo-chart",
                            },
                        ],
                    },
                    {
                        type: "tabset",
                        weight: 33,
                        children: [
                            {
                                type: "tab",
                                name: "Chart 2",
                                component: "demo-chart",
                            },
                        ],
                    },
                    {
                        type: "tabset",
                        weight: 33,
                        children: [
                            {
                                type: "tab",
                                name: "Chart 3",
                                component: "demo-chart",
                            },
                        ],
                    },
                ],
            },
        ],
    },
});

export function DraggableRangeSlider() {
    const [range, setRange] = useState<[number, number]>([30, 70]); // Initial range
    const draggingRef = useRef(false);
    const lastMouseX = useRef(0);
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const width = range[1] - range[0];

    const handleMouseDown = (event: React.MouseEvent) => {
        draggingRef.current = true;
        lastMouseX.current = event.clientX;
    };

    const handleMouseUp = () => {
        draggingRef.current = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!draggingRef.current || !sliderRef.current) return;

        const deltaX = event.clientX - lastMouseX.current;
        lastMouseX.current = event.clientX;

        // Convert pixels to range values proportionally
        const sliderWidth = sliderRef.current.clientWidth;
        const rangeWidth = 100; // Assuming the slider goes from 0 to 100
        const scaleFactor = rangeWidth / sliderWidth; // Converts pixels to value change

        const deltaValue = deltaX * scaleFactor; // Smooth movement

        setRange(([start, end]) => {
            let newStart = start + deltaValue;
            let newEnd = end + deltaValue;

            // Prevent exceeding min/max limits
            if (newStart < 0) {
                newStart = 0;
                newEnd = end - start; // Maintain width
            }
            if (newEnd > 100) {
                newEnd = 100;
                newStart = newEnd - (end - start); // Maintain width
            }

            return [newStart, newEnd];
        });
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <div ref={sliderRef} className="relative w-full">
            <RangeSlider
                value={range}
                onChange={setRange}
                min={0}
                max={100}
                step={1}
                size={3}
                thumbSize={6}
                styles={{
                    track: { cursor: "pointer" },
                    bar: { cursor: "pointer" },
                }}
            />
            {/* Invisible overlay to detect middle drag */}
            <div
                className="absolute top-0 left-0 h-full bg-red-300"
                style={{
                    cursor: "grab",
                    width: `${width - width * 0.1}%`,
                    left: `${range[0] + width * 0.05}%`,
                    height: "20px", // Make it easy to grab
                    backgroundColor: "transparent",
                    zIndex: 10,
                    top: -(20 - (sliderRef.current ? sliderRef.current.offsetHeight : 0)) / 2,
                }}
                onMouseDown={handleMouseDown}
            />
        </div>
    );
}

function TimelineBar() {
    return (
        <>
            <div className="flex flex-row w-full items-center">
                <div
                    className="p-2"
                    onClick={() => {
                        console.log("clicked");
                    }}
                >
                    <Play />
                </div>
                <div className="grow">
                    <DraggableRangeSlider />
                </div>
            </div>
        </>
    );
}

export default function Page() {
    const [sinNum, setSinNum] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSinNum(Math.sin(Date.now() * 0.001));
        }, 16);

        // return () => clearInterval(interval);
    }, []);

    function factory(node: TabNode) {
        const components = {
            "suspension-gauge": (
                <SuspensionGauge
                    s1={sinNum}
                    s2={sinNum ** 2}
                    s3={sinNum ** 3}
                    s4={sinNum ** 4}
                />
            ),
            "car-wireframe": <CarWireframe x={sinNum} y={sinNum} z={sinNum} />,
            "g-force-gauge": <GForceGauge x={sinNum} y={sinNum} z={sinNum} />,
            "demo-chart": <DemoChart />,
            skeleton: <div className="w-full h-full bg-neutral-500"></div>,
        };

        type componentKey = keyof typeof components;

        const component = node.getComponent();

        return components[
            (component && component in components ? component : "skeleton") as componentKey
        ];
    }

    return (
        <>
            <div className="w-[100vw] h-[100vh] flex flex-col">
                <Navbar />
                <div className="grow w-[100vw] overflow-hidden">
                    <Layout realtimeResize={true} model={model} factory={factory} />
                </div>
                <div className="p-3">
                    <TimelineBar />
                </div>
            </div>
        </>
    );
}
