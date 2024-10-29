import React, { useEffect, useRef, useState } from "react";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

export default function CardLineChart({ title, color, range, speed, dataPoints }) {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [dataMockup, setDataMockup] = useState([]);

    useEffect(() => {
        setDataMockup(Array.from({ length: dataPoints }, () => Math.floor(Math.random() * range)));
    }, []);

    // Update dataMockup every second
    useEffect(() => {
        const interval = setInterval(() => {
            setDataMockup((prev) => {
                const next = [...prev];
                next.push(Math.floor(Math.random() * range));
                next.shift();
                return next;
            });
        }, speed);

        return () => clearInterval(interval);
    }, []);

    // Initialize chart
    useEffect(() => {
        if (!chartInstanceRef.current) {
            const config = {
                type: "line",
                data: {
                    labels: Array.from({ length: dataPoints }, (_, i) => (i + 1).toString()),
                    datasets: [
                        {
                            label: new Date().getFullYear(),
                            backgroundColor: "#0bb600",
                            borderColor: color,
                            data: dataMockup,
                            fill: false,
                            tension: 0.4,
                            pointRadius: 0,
                        },
                    ],
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                    animation: {
                        duration: speed,
                        easing: 'easeInOutQuad', // Smoother easing
                    },
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
                        },
                    },
                },
            };

            chartInstanceRef.current = new Chart(chartRef.current, config);
        }
    }, []);

    // Update chart data on dataMockup change
    useEffect(() => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.data.datasets[0].data = dataMockup;
            chartInstanceRef.current.update();
        }
    }, [dataMockup]);

    return (
        <>
            <div className="flex flex-col break-words shadow-lg rounded mx-auto">
                <h6 className="uppercase text-blueGray-100 text-lg font-semibold">
                    {title}
                </h6>
                <div className="flex-auto">
                    {/* Chart */}
                    <div className="relative h-350-px">
                        <canvas ref={chartRef}></canvas>
                    </div>
                    <p className={"transition-transform duration-500 font-mono"}> Current Value: {dataMockup[dataMockup.length-1]}</p>
                </div>
            </div>
        </>
    );
}