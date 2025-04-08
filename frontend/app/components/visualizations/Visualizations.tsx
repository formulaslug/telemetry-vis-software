import { JSX } from "react";
import { UpdateNodeConfig } from "../FlexLayoutComponent";
import { StackedLineChart } from "./lightning-charts/StackedLineChart";
import GPS from "./GPS/GPS";

export const Visualizations: {
    name: string;
    component: <C>(config: C, updateNodeConfig: UpdateNodeConfig<C>) => JSX.Element;
}[] = [
    {
        name: "stacked-line-chart",
        component: StackedLineChart,
    },
    {
        name: "gps",
        component: GPS,
    },
];
