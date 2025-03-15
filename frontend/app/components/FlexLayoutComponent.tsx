import { Layout, Model, TabNode } from "flexlayout-react";
import { useEffect, useState } from "react";
import SuspensionGauge from "./visualizations/SuspensionGauge";
import CarWireframe from "./visualizations/CarWireframe";
import GForceGauge from "./visualizations/GForceGauge";
import DemoChart from "./visualizations/DemoChart";
import LineChartLightning from "./visualizations/lightning-charts/LineChartLightning";

const model = Model.fromJson({
    global: {},
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "row",
                weight: 30,
                children: [
                    {
                        type: "tabset",
                        weight: 50,
                        children: [
                            {
                                type: "tab",
                                name: "Suspension",
                                component: "suspension-gauge",
                            },
                        ],
                    },
                    {
                        type: "tabset",
                        weight: 50,
                        children: [
                            {
                                type: "tab",
                                name: "CarWireframe",
                                component: "car-wireframe",
                            },
                            { type: "tab", name: "G-Force Gauge", component: "g-force-gauge" },
                        ],
                    },
                ],
            },
            {
                type: "row",
                weight: 70,
                children: [
                    {
                        type: "tabset",
                        weight: 33,
                        children: [
                            {
                                type: "tab",
                                name: "Chart 1",
                                component: "demo-chart",
                            },
                        ],
                    },
                    {
                        type: "tabset",
                        weight: 33,
                        children: [
                            {
                                type: "tab",
                                name: "Chart 2",
                                component: "demo-chart",
                            },
                        ],
                    },
                    {
                        type: "tabset",
                        weight: 33,
                        children: [
                            {
                                type: "tab",
                                name: "Chart 3",
                                component: "demo-chart",
                            },
                        ],
                    },
                ],
            },
        ],
    },
});

export default function FlexLayoutComponent() {
    function factory(node: TabNode) {
        const components = {
            // prettier-ignore
            "suspension-gauge": <SuspensionGauge s1={1} s2={1 ** 2} s3={1 ** 3} s4={1 ** 4} />,
            "car-wireframe": <CarWireframe/>,
            "g-force-gauge": <GForceGauge x={1} y={1} z={1} />,
            "demo-chart": <LineChartLightning/>,
            skeleton: <div className="w-full h-full bg-neutral-500"></div>,
        };

        type ComponentKey = keyof typeof components;

        const component = node.getComponent();

        return components[
            (component && component in components ? component : "skeleton") as ComponentKey
        ];
    }

    return <Layout realtimeResize={true} model={model} factory={factory} />;
}
