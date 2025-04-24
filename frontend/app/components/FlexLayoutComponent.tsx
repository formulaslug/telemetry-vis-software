import { Actions, Layout, Model, TabNode } from "flexlayout-react";
import { CornersOut, X } from "@phosphor-icons/react";
import { Dispatch, useCallback, useState } from "react";
import { visualizations } from "./visualizations/Visualizations";

export const layoutModel = Model.fromJson({
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
                                name: "Data Grid",
                                component: "data-grid",
                                config: {
                                    columnNames: ["a", "b", "c"],
                                    data: [
                                        [1, 2, 3],
                                        [4, 5, 6],
                                        [7, 8, 9],
                                    ],
                                },
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

// export type UpdateNodeConfig<T> = (config: T) => void;
export interface VisualizationProps<Config extends Record<string, any>> {
    useSavedState: <K extends keyof Config>(
        key: K,
        initialValue: Config[K]
    ) => [Config[K], Dispatch<Config[K]>];
}

export default function FlexLayoutComponent() {
    function factory(node: TabNode) {
        const componentName =
            (node.getComponent() as keyof typeof visualizations) ?? "skeleton";

        const componentConfig = node.getConfig() ?? {};

        function useSavedState<T>(path: keyof any, initialValue: T): [T, Dispatch<T>] {
            const [state, setState] = useState<T>(componentConfig[path] ?? initialValue);

            // TODO: is this running too many times? idk about this function nesting
            const setStateAndSave = useCallback((newValue: T) => {
                setState(newValue);
                layoutModel.doAction(
                    Actions.updateNodeAttributes(node.getId(), {
                        config: { [path]: newValue },
                    })
                );
            }, []);

            // console.log(model.toJson());

            return [state, setStateAndSave];
        }

        const Component = visualizations[componentName];
        return <Component useSavedState={useSavedState} />;
    }

    return (
        <Layout
            realtimeResize={true}
            model={layoutModel}
            factory={factory}
            icons={{
                close: <X color="gray" weight="bold" />,
                maximize: <CornersOut color="gray" weight="bold" />,
            }}
        />
    );
}
