import { Model } from "flexlayout-react";

export const layouts = [
    {
        name: "Default Layout",
        config: {
            team: "telemetry",
            model: Model.fromJson({
                global: {},
                borders: [],
                layout: {
                    type: "row",
                    id: "root",
                    weight: 100,
                    children: [
                        {
                            type: "row",
                            weight: 100,
                            children: [
                                {
                                    type: "tabset",
                                    children: [
                                        {
                                            type: "tab",
                                            name: "Stacked Line Chart",
                                            component: "stacked-line-chart",
                                            config: {},
                                        },
                                    ],
                                },
                                // {
                                //     type: "tabset",
                                //     weight: 33,
                                //     children: [
                                //         {
                                //             type: "tab",
                                //             name: "Brake Presssure (psi)",
                                //             component: "brake-pressure-linegraph",
                                //         },
                                //     ],
                                // },
                                // {
                                //     type: "tabset",
                                //     weight: 33,
                                //     children: [
                                //         {
                                //             type: "tab",
                                //             name: "Longitudinal Acceleration",
                                //             component: "long-accel-linegraph",
                                //         },
                                //     ],
                                // },
                            ],
                        },
                    ],
                },
            }),
        },
    },
    {
        name: "Jack's Layout",
        config: {
            team: "telemetry",
            model: Model.fromJson({
                global: {},
                borders: [],
                layout: {
                    type: "row",
                    id: "root",
                    weight: 100,
                    children: [
                        {
                            type: "tabset",
                            weight: 50,
                            children: [
                                {
                                    type: "tab",
                                    name: "Lap Counter",
                                    component: "lap-counter",
                                },
                            ],
                        },
                    ],
                },
            }),
        },
    },
    {
        name: "Daniel's Layout",
        config: {
            team: "fasdfa",
            model: Model.fromJson({
                global: {},
                borders: [],
                layout: {
                    type: "row",
                    id: "root",
                    weight: 100,
                    children: [
                        {
                            type: "tabset",
                            weight: 50,
                            children: [
                                {
                                    type: "tab",
                                    name: "Lap Counter",
                                    component: "lap-counter",
                                },
                            ],
                        },
                        {
                            type: "tabset",
                            weight: 50,
                            children: [
                                {
                                    type: "tab",
                                    name: "Line Chart",
                                    component: "stacked-line-chart",
                                },
                            ],
                        },
                    ],
                },
            }),
        },
    },
];
