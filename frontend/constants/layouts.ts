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
                                    weight: 100,
                                    children: [
                                        {
                                            type: "tab",
                                            name: "GPS",
                                            component: "gps",
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
                                                            "TPERIPH_FR_DATA_WHEELSPEED",
                                                            "TPERIPH_FL_DATA_WHEELSPEED",
                                                            "TPERIPH_BR_DATA_WHEELSPEED",
                                                            "TPERIPH_BL_DATA_WHEELSPEED",
                                                        ],
                                                        label: "Wheel Speed",
                                                        units: "",
                                                    },
                                                    {
                                                        columnNames: [
                                                            "TPERIPH_FR_DATA_SUSTRAVEL",
                                                            "TPERIPH_FL_DATA_SUSTRAVEL",
                                                            "TPERIPH_BR_DATA_SUSTRAVEL",
                                                            "TPERIPH_BL_DATA_SUSTRAVEL",
                                                        ],
                                                        label: "Suspension Travel",
                                                        units: "mm",
                                                    },
                                                    {
                                                        columnNames: [
                                                            "TPERIPH_FL_TIRETEMP_1",
                                                            "TPERIPH_FL_TIRETEMP_2",
                                                            "TPERIPH_FL_TIRETEMP_3",
                                                            "TPERIPH_FL_TIRETEMP_4",
                                                            "TPERIPH_FL_TIRETEMP_5",
                                                            "TPERIPH_FL_TIRETEMP_6",
                                                            "TPERIPH_FL_TIRETEMP_7",
                                                            "TPERIPH_FL_TIRETEMP_8",
                                                            // "TPERIPH_FR_TIRETEMP_1",
                                                            // "TPERIPH_FR_TIRETEMP_2",
                                                            // "TPERIPH_FR_TIRETEMP_3",
                                                            // "TPERIPH_FR_TIRETEMP_4",
                                                            // "TPERIPH_FR_TIRETEMP_5",
                                                            // "TPERIPH_FR_TIRETEMP_6",
                                                            // "TPERIPH_FR_TIRETEMP_7",
                                                            // "TPERIPH_FR_TIRETEMP_8",
                                                            "TPERIPH_BL_TIRETEMP_1",
                                                            "TPERIPH_BL_TIRETEMP_2",
                                                            "TPERIPH_BL_TIRETEMP_3",
                                                            "TPERIPH_BL_TIRETEMP_4",
                                                            "TPERIPH_BL_TIRETEMP_5",
                                                            "TPERIPH_BL_TIRETEMP_6",
                                                            "TPERIPH_BL_TIRETEMP_7",
                                                            "TPERIPH_BL_TIRETEMP_8",
                                                            // "TPERIPH_BR_TIRETEMP_1",
                                                            // "TPERIPH_BR_TIRETEMP_2",
                                                            // "TPERIPH_BR_TIRETEMP_3",
                                                            // "TPERIPH_BR_TIRETEMP_4",
                                                            // "TPERIPH_BR_TIRETEMP_5",
                                                            // "TPERIPH_BR_TIRETEMP_6",
                                                            // "TPERIPH_BR_TIRETEMP_7",
                                                            // "TPERIPH_BR_TIRETEMP_8",
                                                        ],
                                                        label: "Tire Temps",
                                                        units: "C",
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
