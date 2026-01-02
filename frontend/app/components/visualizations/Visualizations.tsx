import { StackedLineChart } from "./lightning-charts/StackedLineChart";
import { GPS } from "./GPS/GPS";
import LapsTable from "./LapsTable";
import SuspensionGauge from "./SuspensionGauge";
import { VisualizationProps } from "../FlexLayoutComponent";
import { JSX } from "react";
// import { LapCounter } from "./LapCounter";
import AccumulatorTemperature from "./AccumulatorTemperature";

export const visualizations: Record<string, (props: VisualizationProps<any>) => JSX.Element> =
    {
        "stacked-line-chart": StackedLineChart,
        gps: GPS,
        "suspension-gauge": SuspensionGauge,
        // "timings-box": LapsTable,
        // "lap-counter": LapCounter, // doesn't work without AEMdash lap calculations (not on fs-3)
        "accumulator-temp": AccumulatorTemperature,

        skeleton: () => <div className="w-full h-full bg-neutral-500"></div>,
    };

// skeleton: <div className="w-full h-full bg-neutral-500"></div>,
