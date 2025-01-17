import React, { RefObject, useEffect, useRef } from "react";
import { Chart, ChartItem, ChartConfiguration, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, ScatterController, ChartData, ChartDataset, ChartType, BarController, BarElement } from "chart.js";
Chart.register(LineController, BarController, BarElement, ScatterController, LineElement, PointElement, LinearScale, Title, CategoryScale);

// ArrayLike<any> is used for data because chartjs supports TypedArrays and we
// might use those too down the line
interface CardLineChartProps {
    title: string;
    color: string;
    datasetNames?: string[]; // optional list of names to give each y-value set
    numRows: number; // total number of rows of data. Used to rerender the chart on updates
    dataX: ArrayLike<any>; // eg. timestamps
    dataY: ArrayLike<any>[]; // 1 or more y-value sets
}

const CHART_TYPE: ChartType = 'line'

function initChart(chartRef: RefObject<ChartItem>, { title, color, dataY, datasetNames: names }: CardLineChartProps) {

    const config: ChartConfiguration<ChartType, typeof dataY[0], string> = {
        type: CHART_TYPE,
        data: {
            datasets: dataY.map((_, i) => ({
                data: [],
                label: names ? names[i] : (dataY.length > 1 ? `Dataset ${i}` : title),
                backgroundColor: color,
                borderColor: color,
                pointStyle: false, // too noisy
                spanGaps: true,
                borderWidth: 2,
            })),
            labels: [],
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            animation: false,
            scales: {
                x: {
                    ticks: {
                        color: "rgba(255,255,255,.7)",
                    },
                    grid: {
                        display: false,
                        // color: "rgba(33, 37, 41, 0.3)",
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
    const { title, dataX, dataY, numRows, datasetNames: names } = props;

    for (const ySet of dataY) {
        if (ySet.length != dataX.length) {
            throw Error("dataY lists must have the same length as dataX!");
        };
    }

    if (names && dataY.length != names.length) {
        throw Error("names list must have the same length as dataY");
    }

    const chartRef = useRef<ChartItem>(null);
    const chartInstanceRef = useRef<Chart<ChartType, typeof dataY[0], string> | null>(null);

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

    useEffect(() => {
        if (chartInstanceRef.current && dataX && dataX.length > 0) {
            for (const [idx, ySet] of dataY.entries()) {
                chartInstanceRef.current.data.datasets[idx].data = ySet;
            }
            chartInstanceRef.current.data.labels =
                Array.from(dataX).map(n => (typeof n == "number") ? n.toFixed(2) : n.toString());

            // TODO: do we want to set scales manually? It should do this for us
            // just fine
            // // @ts-ignore-next // We know this exists already from the config above. smh
            // chartInstanceRef.current.config.options.scales.y = {
            //     TODO: setting the min/max on each update causes a sort of
            //     visual flickering and is probably very laggy.
            //     min: dataY[0][0],
            //     max: dataY[0][dataX.length - 1],
            //     min: Math.floor(dataPoints[0][0]),
            //     max: Math.ceil(dataPoints[dataPoints.length - 1][0]),
            // };

            chartInstanceRef.current.update();
        }
    }, [numRows]);

    return (
        <>
            <div className="flex flex-col break-words rounded">
                <h6 className="uppercase text-blueGray-100 text-lg font-semibold">
                    {title}
                </h6>
                <div className="flex-auto">
                    {/* Chart */}
                    <div className="relative ">
                        {/* for some reason tsserver gets confused here... not idea why */}
                        <canvas ref={chartRef as any}></canvas>
                    </div>
                    <p className={"transition-transform duration-500 font-mono select-none"}> Current
                        Value: {dataY[0] && dataY[0].length > 2 ? dataY[0][dataY[0].length - 1].toFixed(2) : 0.000}
                    </p>
                </div>
            </div>
        </>
    );
}
