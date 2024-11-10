import React, { useEffect, useRef, useState } from "react";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

interface CardLineChartProps {
    title: string;
    color: string;
    range: number;
    speed: number;
    dataPoints: number;
    data?: number[];
}

const MAX_LENGTH = 1000

export default function CardLineChart({ title, color, range, speed, dataPoints, data }: CardLineChartProps) {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [dataMockup, setDataMockup] = useState<number[]>([]);
    const [generateRandom, setGenerateRandom] = useState<boolean>(true);

    // useEffect(() => {
    //     if (data && data.length > 0) {
    //         setGenerateRandom(false);
    //         setDataMockup(data);
    //     } else {
    //         setDataMockup(Array.from({ length: dataPoints }, () => Math.floor(Math.random() * range)));
    //     }
    // }, []);

    // Update dataMockup every second
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         if (generateRandom) {
    //             setDataMockup(Array.from({length: dataPoints}, () => Math.floor(Math.random() * range)));
    //         }
    //     }, speed);
    //
    //     return () => clearInterval(interval);
    // }, []);

    useEffect(() => {
        if (data) {
            let copy = [...dataMockup]
            if (copy.length > MAX_LENGTH) {
                copy.shift()
            }
            copy.push(data[data!.length - 1])

            setDataMockup(copy);
        }
    }, [data]);

    // Initialize chart
    useEffect(() => {
        if (!chartInstanceRef.current) {
            const config = {
                type: "line",
                data: {
                    labels: Array.from({ length: MAX_LENGTH }, (_, i) => (i + 1).toString()),
                    datasets: [
                        {
                            label: new Date().getFullYear(),
                            backgroundColor: "#0bb600",
                            borderColor: color,
                            data: dataMockup,
                            fill: false,
                            tension: 0.0,
                            pointRadius: 0,
                        },
                    ],
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                    animation: false,
                    // animation: {
                    //     duration: speed,
                    //     easing: 'cubic', // Smoother easing
                    // },
                    plugins: {
                        title: {
                            display: false,
                            text: "",
                            color: "white",
                        },
                        legend: {
                            labels: {
                                color: "white",
                            },
                            align: "end",
                            position: "bottom",
                        },
                        tooltip: {
                            mode: "index",
                            intersect: false,
                        },
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: "rgba(255,255,255,.7)",
                            },
                            grid: {
                                display: false,
                                color: "rgba(33, 37, 41, 0.3)",
                            },
                        },
                        y: {
                            ticks: {
                                color: "rgba(255,255,255,.7)",
                            },
                            grid: {
                                color: "rgba(255, 255, 255, 0.15)",
                            },
                            // max: 1,
                            // min: -1,
                        },
                    },
                },
            };

            // @ts-ignore
            chartInstanceRef.current = new Chart(chartRef.current, config);
        }
    }, []);

    // Update chart data on dataMockup change
    useEffect(() => {
        if (chartInstanceRef.current) {
            // @ts-ignore
            chartInstanceRef.current.data.datasets[0].data = dataMockup;
            // @ts-ignore
            chartInstanceRef.current.update();
        }
    }, [dataMockup]);

    return (
        <>
            <div className="flex flex-col break-words rounded">
                <h6 className="uppercase text-blueGray-100 text-lg font-semibold">
                    {title}
                </h6>
                <div className="flex-auto">
                    {/* Chart */}
                    <div className="relative h-350-px">
                        <canvas ref={chartRef}></canvas>
                    </div>
                    <p className={"transition-transform duration-500 font-mono select-none"}> Current
                        Value: {dataMockup && dataMockup.length > 2 ? dataMockup[dataMockup.length - 1].toFixed(3) : 0.000}</p>
                    {/*<p>{data}</p>*/}
                    {/*<p>{dataMockup.length}</p>*/}
                </div>
            </div>
        </>
    );
}
