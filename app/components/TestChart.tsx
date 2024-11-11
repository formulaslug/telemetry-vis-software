import React, { MutableRefObject, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Chart, ChartItem, ChartConfiguration, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, ScatterController } from "chart.js";
Chart.register(LineController, ScatterController, LineElement, PointElement, LinearScale, Title, CategoryScale);

interface CardLineChartProps {
    title: string;
    color: string;
    range: number;
    speed: number;
    data: [number, number][]; // x, y aka t, f(t)
}

// Roughly the amount of points needed to display 10 seconds worth of graph.
// TODO: eventually we will make it purely based on how much time to show
// rather than this hardcoded dataPoints length.
const MAX_LENGTH = 1300

function initChart(chartRef: RefObject<ChartItem>, color: string) {
    const config: ChartConfiguration = {
        type: "scatter",
        data: {
            // labels: Array.from({ length: MAX_LENGTH }, (_, i) => (i + 1).toString()),
            datasets: [
                {
                    label: new Date().getFullYear().toString(),
                    // backgroundColor: "#0bb600",
                    backgroundColor: color,
                    // borderColor: color,
                    data: [],
                    // fill: false,
                    // tension: 0.0,
                    // pointRadius: 0,
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            animation: false,
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

    return new Chart(chartRef.current!, config);
}

export default function CardLineChart({ title, color, range, speed, data }: CardLineChartProps) {
    const chartRef = useRef<ChartItem>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    // The chart's own list of stored points, of length MAX_LENGTH.
    // Keeping our chart points in a useState requires reassigning a
    // new copy of the list to it on each render. Works for now
    const [dataPoints, setDataPoints] = useState<[number, number][]>([]);

    useMemo(() => {
        if (data.length > 0) {
            let newPoint = data[data.length - 1];
            if (newPoint !== dataPoints[dataPoints.length - 1]) {
                // TODO: some kind of check here to refill dataPoints fully
                // when switching back tabs (currently it starts from scratch)
                setDataPoints((prev) => {
                    let updated = [...prev, newPoint];
                    if (updated.length >= MAX_LENGTH) {
                        updated.shift();
                    }
                    return updated;
                });
            }
        }
    }, [data]);

    useEffect(() => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.data.datasets[0].data = dataPoints.map(([a, b]) => ({ x: a, y: b }));
            // @ts-ignore-next // We know this exists already from the config above. smh
            chartInstanceRef.current.config.options.scales.x = {
                // TODO: setting the min/max on each update causes a sort of
                // visual flickering and is probably very laggy.
                min: dataPoints[0][0],
                max: dataPoints[dataPoints.length - 1][0],
                // min: Math.floor(dataPoints[0][0]),
                // max: Math.ceil(dataPoints[dataPoints.length - 1][0]),
            };

            chartInstanceRef.current.update();
        }
    }, [dataPoints])

    useEffect(() => {
        chartInstanceRef.current = initChart(chartRef, color);
        return () => {
            chartInstanceRef.current?.destroy();
            chartInstanceRef.current = null;
        }
    }, []);

    return (
        <>
            <div className="flex flex-col break-words rounded">
                <h6 className="uppercase text-blueGray-100 text-lg font-semibold">
                    {title}
                </h6>
                <div className="flex-auto">
                    {/* Chart */}
                    <div className="relative h-350-px">
                        {/* for some reason type inference gets confused here? */}
                        <canvas ref={chartRef as any}></canvas>
                    </div>
                    <p className={"transition-transform duration-500 font-mono select-none"}> Current
                        Value: {dataPoints && dataPoints.length > 2
                            ? dataPoints[dataPoints.length - 1][1].toFixed(3)
                            : 0.000 }
                    </p>
                    {/*<p>{data}</p>*/}
                    {/*<p>{dataMockup.length}</p>*/}
                </div>
            </div>
        </>
    );
}
