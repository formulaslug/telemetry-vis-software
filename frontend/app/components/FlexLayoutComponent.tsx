import { Actions, Layout, Model, TabNode } from "flexlayout-react";
import SuspensionGauge from "./visualizations/SuspensionGauge";
import CarWireframe from "./visualizations/CarWireframe";
import GForceGauge from "./visualizations/GForceGauge";
import LineChart from "./visualizations/lightning-charts/LineChart";
import TextBox from "./visualizations/TextBox";
import { CornersOut, X } from "@phosphor-icons/react";
import { Dispatch, useCallback, useState } from "react";
import { ValueOf } from "next/dist/shared/lib/constants";
import { visualizations } from "./visualizations/Visualizations";
import { compressPositions } from "three/examples/jsm/utils/GeometryCompressionUtils.js";

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
                        // weight: 33,
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
export interface VisualizationProps<Config> {
    useSavedState: <K extends keyof Config>(
        key: K,
        initialValue: Config[K],
    ) => [Config[K], Dispatch<Config[K]>];
}

export default function FlexLayoutComponent() {
    function factory(node: TabNode) {
        // const components = {
        //     // "suspension-gauge": <SuspensionGauge />,
        //     // "car-wireframe": <CarWireframe />,
        //     // "g-force-gauge": <GForceGauge x={1} y={1} z={1} />,
        //     // "acc-seg-0-voltage-linegraph": (
        //     //     <LineChart
        //     //         title={"Acc Seg 0 Voltage"}
        //     //         yAxisTitle="Voltage"
        //     //         yAxisColumnNames={[
        //     //             "Seg0_VOLT_0",
        //     //             "Seg0_VOLT_1",
        //     //             "Seg0_VOLT_2",
        //     //             "Seg0_VOLT_3",
        //     //             "Seg0_VOLT_4",
        //     //             "Seg0_VOLT_5",
        //     //         ]}
        //     //         yAxisUnits="volts"
        //     //     />
        //     // ),
        //     // "timings-box": (
        //     //     <div className="p-0">
        //     //         <TextBox title="Lap Time" keyName=":LapTime" />
        //     //         <TextBox title="Lap Number" keyName=":Lap" /> {/*TODO: lcjs datagrid*/}
        //     //         <TextBox title="Speed" keyName="VDM_GPS_SPEED" />{" "}
        //     //         {/*TODO: lcjs guage chart*/}
        //     //     </div>
        //     // ),
        //     // "brake-pressure-linegraph": (
        //     //     <LineChart
        //     //         // title={""}
        //     //         yAxisTitle="Brake Pressure"
        //     //         yAxisColumnNames={["TELEM_STEERBRAKE_BRAKEF", "TELEM_STEERBRAKE_BRAKER"]}
        //     //         yAxisUnits="psi(?)"
        //     //     />
        //     // ),
        //     // "long-accel-linegraph": (
        //     //     <LineChart
        //     //         // title={""}
        //     //         yAxisTitle="Longitudinal Acceleration"
        //     //         yAxisColumnNames={[
        //     //             "VDM_X_AXIS_ACCELERATION",
        //     //             "VDM_Y_AXIS_ACCELERATION",
        //     //             "VDM_Z_AXIS_ACCELERATION",
        //     //         ]}
        //     //     />
        //     // ),
        //     gps: GPS,
        //     "stacked-line-chart": StackedLineChart,
        //     skeleton: () => <div className="w-full h-full bg-neutral-500"></div>,
        // };

        const componentName =
            (node.getComponent() as keyof typeof visualizations) ?? "skeleton";

        const componentConfig = node.getConfig() ?? {};

        function useSavedState<T>(path: string, initialValue: T): [T, Dispatch<T>] {
            const [state, setState] = useState<T>(componentConfig[path] ?? initialValue);

            // TODO: is this running too many times? idk about this function nesting
            const setStateAndSave = useCallback((newValue: T) => {
                setState(newValue);
                model.doAction(
                    Actions.updateNodeAttributes(node.getId(), {
                        config: { [path]: newValue },
                    }),
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
            model={model}
            factory={factory}
            icons={{
                close: <X color="gray" weight="bold" />,
                maximize: <CornersOut color="gray" weight="bold" />,
            }}
        />
    );
}
