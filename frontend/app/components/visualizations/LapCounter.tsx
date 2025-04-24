"use client";

import { useContext, useEffect, useId, useRef } from "react";
import { LightningChartsContext } from "./lightning-charts/GlobalContext";
import globalTheme from "./lightning-charts/GlobalTheme";
import { VisualizationProps } from "../FlexLayoutComponent";
import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";

// data is represented in row, column (y, x)
export interface DataGridConfig {
    columnNames: string[];
    data: any[][];
}

export function LapCounter({ useSavedState }: VisualizationProps<DataGridConfig>) {
    const { subscribeViewableArrays } = useDataMethods();

    const lc = useContext(LightningChartsContext);
    const containerRef = useRef(null);
    const id = useId();

    const columnNames = ["Lap #", "Lap Time (s)"];

    const [data, setData] = useSavedState("data", [["cell 0.0"], ["cell 0.1"]]);

    useEffect(() => {
        // checks for invalid ref & context
        if (!containerRef.current || !lc) return;

        let dataGrid = lc.DataGrid({ container: containerRef.current, theme: globalTheme });

        dataGrid.setTitle("Lap Times");

        dataGrid.setTableContent([columnNames]);

        // defines subscribers
        const unsub = subscribeViewableArrays((viewableArrays) => {
            const lap = viewableArrays[":Lap"];
            const lapTime = viewableArrays[":LapTime"];

            if (!lap || !lapTime) return;
            let previous = 0;

            for (let i = 0; i < lap.length; i++) {
                if (lap[i] > previous) {
                    dataGrid.setRowContent(lap[i] + 1, [lap[i], lapTime[i - 1] ?? 0]);
                    previous = lap[i];
                }
            }
        });

        return () => {
            unsub();
        };
    }, [columnNames, data]);

    return <div id={id} ref={containerRef} className="w-[100%] h-[100%]"></div>;
}
