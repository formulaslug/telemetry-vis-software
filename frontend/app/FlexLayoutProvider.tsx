"use client";

import { Model } from "flexlayout-react";
import { Mode } from "fs";
import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useState,
} from "react";

export const FlexLayoutContext = createContext<
    null | [Model, Dispatch<SetStateAction<Model>>]
>(null);

const layoutModel = Model.fromJson({
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
                    // {
                    //     type: "tabset",
                    //     weight: 30,
                    //     children: [
                    //         {
                    //             type: "tab",
                    //             name: "CarWireframe",
                    //             component: "car-wireframe",
                    //         },
                    //         { type: "tab", name: "G-Force Gauge", component: "g-force-gauge" },
                    //     ],
                    // },
                    // {
                    //     type: "tabset",
                    //     weight: 40,
                    //     children: [{ type: "tab", name: "Timings", component: "timings-box" }],
                    // },
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
});

export function FlexLayoutProvider({ children }: PropsWithChildren) {
    const state = useState(layoutModel);
    return <FlexLayoutContext.Provider value={state}>{children}</FlexLayoutContext.Provider>;
}

export function useFlexLayout() {
    const context = useContext(FlexLayoutContext);
    if (!context) {
        throw new Error("No context for flexlayout");
    }
    return context;
}
