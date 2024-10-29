import React, { useEffect, useRef } from "react";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

export default function CardLineChart({title}: {title: string}) {
    const chartRef = useRef(null);

    useEffect(() => {
        const config = {
            type: "line",
            data: {
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [
                    {
                        label: new Date().getFullYear(),
                        backgroundColor: "#3182ce",
                        borderColor: "#3182ce",
                        data: [65, 78, 66, 44, 56, 67, 75],
                        fill: false,
                    },
                    {
                        label: new Date().getFullYear() - 1,
                        backgroundColor: "#edf2f7",
                        borderColor: "#edf2f7",
                        data: [40, 68, 86, 74, 56, 60, 87],
                        fill: false,
                    },
                ],
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'linear',
                        from: 1,
                        to: 0,
                        loop: true
                    }
                },

                plugins: {
                    title: {
                        display: false,
                        text: "Sales Charts",
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

        const chartInstance = new Chart(chartRef.current, config);

        return () => chartInstance.destroy();
    }, []);

    return (
        <>
            <div className="flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded">
                <div className="rounded-t mb-0 px-4 py-3 bg-blue-600">
                    <div className="flex flex-wrap items-center">
                        <div className="relative w-full max-w-full flex-grow flex-1">
                            <h6 className="uppercase text-blueGray-100 mb-1 text-xs font-semibold">
                                {title}
                            </h6>
                        </div>
                    </div>
                </div>
                <div className="p-4 flex-auto">
                    {/* Chart */}
                    <div className="relative h-350-px">
                        <canvas ref={chartRef}></canvas>
                    </div>
                </div>
            </div>
        </>
    );
}