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
                            weight: 30,
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
                                        {
                                            type: "tab",
                                            name: "G-Force Gauge",
                                            component: "g-force-gauge",
                                        },
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
                                    children: [
                                        {
                                            type: "tab",
                                            name: "Stacked Line Chart",
                                            component: "stacked-line-chart",
                                            config: {
                                                yAxesInfo: [
                                                    {
                                                        columnNames: [
                                                            "Seg0_VOLT_0",
                                                            "Seg0_VOLT_1",
                                                            "Seg0_VOLT_2",
                                                            "Seg0_VOLT_3",
                                                            "Seg0_VOLT_4",
                                                            "Seg0_VOLT_5",
                                                            "Seg0_VOLT_6",
                                                        ],
                                                        label: "Seg0 Temps",
                                                        units: "V",
                                                    },
                                                    {
                                                        columnNames: [
                                                            "Seg0_TEMP_0",
                                                            "Seg0_TEMP_1",
                                                            "Seg0_TEMP_2",
                                                            "Seg0_TEMP_3",
                                                            "Seg0_TEMP_4",
                                                            "Seg0_TEMP_5",
                                                            "Seg0_TEMP_6",
                                                        ],
                                                        label: "Seg0 Voltages",
                                                        units: "°C",
                                                    },
                                                ],
                                            },
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
