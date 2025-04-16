import Components from "@/models/Components";
import { CornersOut, X } from "@phosphor-icons/react";
import { Layout, Model, TabNode } from "flexlayout-react";

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
                    // {
                    //     type: "tabset",
                    //     weight: 30,
                    //     children: [
                    //         {
                    //             type: "tab",
                    //             name: "Suspension",
                    //             component: "suspension-gauge",
                    //         },
                    //     ],
                    // },
                    {
                        type: "tabset",
                        weight: 33,
                        children: [
                            {
                                type: "tab",
                                name: "GPS",
                                component: "gps",
                            },
                        ],
                    },
                    {
                        type: "tabset",
                        weight: 30,
                        children: [
                            {
                                type: "tab",
                                name: "CarWireframe",
                                component: "car-wireframe",
                            },
                            { type: "tab", name: "G-Force Gauge", component: "g-force-gauge" },
                        ],
                    },
                    {
                        type: "tabset",
                        weight: 40,
                        children: [{ type: "tab", name: "Timings", component: "timings-box" }],
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
                                name: "Brake Presssure (psi)",
                                component: "brake-pressure-linegraph",
                            },
                        ],
                    },
                    {
                        type: "tabset",
                        weight: 33,
                        children: [
                            {
                                type: "tab",
                                name: "Longitudinal Acceleration",
                                component: "long-accel-linegraph",
                            },
                        ],
                    },
                ],
            },
        ],
    },
});

// const model = Model.fromJson({
//     global: {},
//     borders: [],
//     layout: {
//         type: "row",
//         children: [
//             {
//                 type: "row",
//                 children: [
//                     {
//                         type: "tabset",
//                         children: [
//                             {
//                                 type: "tab",
//                                 name: "Brake Presssure (psi)",
//                                 component: "brake-pressure-linegraph",
//                             },
//                         ],
//                     },
//                     {
//                         type: "tabset",
//                         children: [
//                             {
//                                 type: "tab",
//                                 name: "Longitudinal Acceleration",
//                                 component: "long-accel-linegraph",
//                             },
//                         ],
//                     },
//                 ],
//             },
//         ],
//     },
// });

export default function FlexLayoutComponent() {
    function factory(node: TabNode) {
        const components = Components;

        type ComponentKey = keyof typeof components;

        const component = node.getComponent();

        return components[
            (component && component in components ? component : "skeleton") as ComponentKey
        ];
    }

    return (
        <Layout
            realtimeResize={true}
            model={model}
            factory={factory}
            icons={{
                close: <X color="gray" weight="bold" />,
                maximize: <CornersOut color="gray" weight="bold" />,
            }}
        />
    );
}
