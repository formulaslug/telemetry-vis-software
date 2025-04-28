import { StackedLineChart } from "./lightning-charts/StackedLineChart";
import { GPS } from "./GPS/GPS";
import LapsTable from "./LapsTable";
import GForceGauge from "./GForceGauge";
import CarWireframe from "./CarWireframe";
import SuspensionGauge from "./SuspensionGauge";
import { VisualizationProps } from "../FlexLayoutComponent";
import { JSX } from "react";
import { LapCounter } from "./LapCounter";

export const visualizations: Record<string, (props: VisualizationProps<any>) => JSX.Element> =
    {
        "stacked-line-chart": StackedLineChart,
        gps: GPS,
        "suspension-gauge": SuspensionGauge,
        "car-wireframe": CarWireframe,
        "g-force-gauge": GForceGauge,
        "timings-box": LapsTable,
        "lap-counter": LapCounter,

        skeleton: () => <div className="w-full h-full bg-neutral-500"></div>,
    };

// skeleton: <div className="w-full h-full bg-neutral-500"></div>,
