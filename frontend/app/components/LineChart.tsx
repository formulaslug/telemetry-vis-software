import React, { RefObject, useEffect, useRef } from "react";
import ZoomPlugin from "chartjs-plugin-zoom";
import {
    Chart,
    ChartItem,
    ChartConfiguration,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    ChartType,
    Legend,
    Decimation,
    Tooltip,
} from "chart.js";

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Legend,
    Decimation,
    Tooltip,
    ZoomPlugin,
);

// ArrayLike<any> is used for data because chartjs supports TypedArrays and we
// might use those too down the line
interface LineChartProps {
    title: string;
    numRows: number; // total number of rows of data. Used to rerender the chart on updates
    dataX: ArrayLike<any>; // eg. timestamps
    dataY: ArrayLike<any>[]; // 1 or more y-value sets
    datasetNames?: string[]; // optional list of names to give each y-value set
    dataXUnits: string;
    dataYUnits: string;
}

const CHART_TYPE: ChartType = "line";

const unique_colors: (keyof DefaultColors)[] = [
    "red",
    "amber",
    "lime",
    "cyan",
    "blue",
    "violet",
    "fuchsia",
    "pink",
];
import colors from "tailwindcss/colors";
import { DefaultColors } from "tailwindcss/types/generated/colors";

function initChart(
    chartRef: RefObject<ChartItem>,
    { dataY, datasetNames, dataXUnits, dataYUnits }: LineChartProps,
) {
    const config: ChartConfiguration<ChartType, (typeof dataY)[0], number> = {
        type: CHART_TYPE,
        data: {
            datasets: dataY.map((_, i) => ({
                data: [],
                label: datasetNames ? datasetNames[i] : `Dataset ${i}`,
                backgroundColor: `${colors[unique_colors[i]]["900"]}`,
                borderColor: `${colors[unique_colors[i]]["700"]}`,
                radius: 0,
            })),
            // labels: [],
        },
        options: {
            datasets: {
                line: {
                    indexAxis: "x",
                    parsing: false,
                    normalized: true,
                    pointRadius: 0, // too noisy
                    borderWidth: 2,
                    borderDash: [],
                    spanGaps: true,
                    tension: 0,
                    stepped: false,
                },
            },
            maintainAspectRatio: false,
            responsive: true,
            animation: false,
            parsing: false,
            interaction: {
                mode: "index",
                // mode: "nearest",
                // axis: "x",
                intersect: true,
            },
            plugins: {
                decimation: {
                    enabled: true,
                    // algorithm: "min-max",
                    algorithm: "lttb",
                    // samples: 50,
                    // threshold: 50,
                },
                legend: {
                    display: true,
                    position: "top",
                    align: "center",
                    labels: {
                        font: { size: 12 },
                        boxWidth: 8,
                        boxHeight: 8,
                        color: colors.neutral[400],
                    },
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: "x",
                    },
                    limits: {
                        y: { min: "original", max: "original" },
                    },
                    zoom: {
                        mode: "x",
                        wheel: {
                            enabled: true,
                        },
                        drag: {
                            enabled: true,
                            maintainAspectRatio: false,
                            modifierKey: "shift",
                        },
                        pinch: {
                            enabled: true,
                        },
                    },
                },
                title: {
                    // We'll use ItemContainer's title instead
                    display: false,
                },
                tooltip: {
                    enabled: true,
                    animation: {
                        duration: 100,
                    },
                },
            },
            aspectRatio: 1.3,
            scales: {
                x: {
                    title: {
                        display: dataXUnits != null,
                        text: dataXUnits,
                        font: { size: 14 },
                        color: colors["neutral"][500],
                    },
                    type: "linear",
                    ticks: {
                        color: "rgba(255,255,255,.7)",
                        maxRotation: 0, // Disabled rotation for performance
                        autoSkip: true,
                    },
                    grid: { display: false },
                },
                y: {
                    title: {
                        display: dataYUnits != null,
                        text: dataYUnits,
                        font: { size: 14 },
                        color: colors["neutral"][500],
                    },
                    type: "linear",
                    ticks: {
                        color: "rgba(255,255,255,.7)",
                        maxRotation: 0, // Disabled rotation for performance
                        autoSkip: true,
                    },
                    grid: { color: "rgba(255, 255, 255, 0.15)" },
                },
            },
        },
    };

    return new Chart(chartRef.current!, config);
}

export default function LineChart(props: LineChartProps) {
    const { dataX, dataY, numRows, datasetNames: names } = props;

    for (const ySet of dataY) {
        if (ySet.length != dataX.length) {
            throw Error("dataY lists must have the same length as dataX!");
        }
    }

    if (names && dataY.length != names.length) {
        throw Error("names list must have the same length as dataY");
    }

    const chartRef = useRef<ChartItem>(null);
    const chartInstanceRef = useRef<Chart<ChartType, (typeof dataY)[0], number> | null>(null);

    // // The chart's own list of stored points, of length MAX_LENGTH.
    // // Keeping our chart points in a useState requires reassigning a
    // // new copy of the list to it on each render. Works for now
    // const [dataPoints, setDataPoints] = useState<[number, number][]>([]);

    useEffect(() => {
        chartInstanceRef.current = initChart(chartRef, props);

        return () => {
            chartInstanceRef.current?.destroy();
            chartInstanceRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (chartInstanceRef.current && dataX && dataX.length > 0) {
            // assemble data
            for (const [idx, ySet] of dataY.filter((d) => d.length > 0).entries()) {
                chartInstanceRef.current.data.datasets[idx].data = [
                    ...Array.from(dataX).map((v, i) => ({
                        x: v,
                        y: ySet[i],
                    })),
                ];
            }
            //todo: make 10s the min width somehow?
            // let data = chartInstanceRef.current.data.datasets[0].data;
            // if (data[0][0] - data[0][data.length - 1] < 10) {
            // }

            // console.log(chartInstanceRef.current.config.options?.indexAxis)
            // console.log(chartInstanceRef.current.data.datasets[0].parsing)

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

            chartInstanceRef.current.update('none');
        }
    }, [numRows]);

    return (
        <div className="break-words">
            <div className="relative">
                {/* for some reason tsserver gets confused here... not idea why */}
                <canvas ref={chartRef as any}></canvas>
            </div>
        </div>
    );
}
