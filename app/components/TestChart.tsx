import React, { RefObject, useEffect, useRef } from "react";
import { Chart, ChartItem, ChartConfiguration, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, ScatterController, ChartData, ChartDataset, ChartType } from "chart.js";
Chart.register(LineController, ScatterController, LineElement, PointElement, LinearScale, Title, CategoryScale);

interface CardLineChartProps {
    title: string;
    color: string;
    dataX: ArrayLike<any>; // eg. timestamps
    dataY: ArrayLike<any>[]; // 1 or more y-value sets
}

const CHART_TYPE: ChartType = 'scatter'

function initChart(chartRef: RefObject<ChartItem>, props: CardLineChartProps) {
    const config: ChartConfiguration<ChartType, typeof props.dataY[0], typeof props.dataX> = {
        type: CHART_TYPE,
        data: {
            // labels: Array.from({ length: MAX_LENGTH }, (_, i) => (i + 1).toString()),
            datasets: [],
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

export default function CardLineChart(props: CardLineChartProps) {
    const {title, color, dataX, dataY} = props;

    const chartRef = useRef<ChartItem>(null);
    const chartInstanceRef = useRef<Chart<ChartType, typeof dataY[0], typeof dataX> | null>(null);

    // // The chart's own list of stored points, of length MAX_LENGTH.
    // // Keeping our chart points in a useState requires reassigning a
    // // new copy of the list to it on each render. Works for now
    // const [dataPoints, setDataPoints] = useState<[number, number][]>([]);

    useEffect(() => {
        chartInstanceRef.current = initChart(chartRef, props);
        return () => {
            chartInstanceRef.current?.destroy();
            chartInstanceRef.current = null;
        }
    }, []);

    // useMemo(() => {
    //     if (data.length > 0) {
    //         let newPoint = data[data.length - 1];
    //         if (newPoint !== dataPoints[dataPoints.length - 1]) {
    //             // TODO: some kind of check here to refill dataPoints fully
    //             // when switching back tabs (currently it starts from scratch)
    //             setDataPoints((prev) => {
    //                 let updated = [...prev, newPoint];
    //                 if (updated.length >= MAX_LENGTH) {
    //                     updated.shift();
    //                 }
    //                 return updated;
    //             });
    //         }
    //     }
    // }, [data]);

    useEffect(() => {
        if (chartInstanceRef.current && dataX && dataY) {
            chartInstanceRef.current.data = {
                // List of Y-value sets
                // datasets: dataY.map((arr) => Array.from(arr).map((v, i) => ({ x: dataX[i], y: v }))),
                datasets: dataY.map((set) => ({ data: set })),
                // X-values, eg. timestamps
                labels: Array.from(dataX).map((n) => n.toString()),
            };

            // @ts-ignore-next // We know this exists already from the config above. smh
            chartInstanceRef.current.config.options.scales.x = {
                // TODO: setting the min/max on each update causes a sort of
                // visual flickering and is probably very laggy.
                min: dataY[0][0],
                max: dataY[0][dataX.length - 1],
                // min: Math.floor(dataPoints[0][0]),
                // max: Math.ceil(dataPoints[dataPoints.length - 1][0]),
            };

            chartInstanceRef.current.update();
        }
    }, [dataX, dataY])

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
                        Value: {dataY[0] && dataY[0].length > 2
                            ? dataY[0][dataY[0].length - 1].toFixed(3)
                            : 0.000}
                    </p>
                </div>
            </div>
        </>
    );
}
