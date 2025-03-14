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
    const [sinNum, setSinNum] = useState(0);

    useEffect(() => {
        // const interval = setInterval(() => {
        //     setSinNum(Math.sin(Date.now() * 0.001));
        // }, 16);
        //
        // return () => clearInterval(interval);
    }, []);

    function factory(node: TabNode) {
        const components = {
            // prettier-ignore
            // "suspension-gauge": <SuspensionGauge s1={sinNum} s2={sinNum ** 2} s3={sinNum ** 3} s4={sinNum ** 4} />,
            // "car-wireframe": <CarWireframe x={sinNum} y={sinNum} z={sinNum} />,
            // "g-force-gauge": <GForceGauge x={sinNum} y={sinNum} z={sinNum} />,
            "demo-chart": <LineChartLightning keyName="Seg0_VOLT_0"/>,
            skeleton: <div className="w-full h-full bg-neutral-500"></div>,
        };

        type ComponentKey = keyof typeof components;

        const component = node.getComponent();

        return components[
            (component && component in components ? component : "skeleton") as ComponentKey
        ];
    }

    return <Layout realtimeResize={false} model={model} factory={factory} />;
}
