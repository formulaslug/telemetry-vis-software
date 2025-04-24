"use client";

import { useContext, useEffect, useId, useRef } from "react";
import { LightningChartsContext } from "./lightning-charts/GlobalContext";
import globalTheme from "./lightning-charts/GlobalTheme";
import { VisualizationProps } from "../FlexLayoutComponent";

// data is represented in row, column (y, x)
export interface DataGridConfig {
    columnNames: string[];
    data: any[][];
}

export function DataGrid({ useSavedState }: VisualizationProps<DataGridConfig>) {
    const lc = useContext(LightningChartsContext);
    const containerRef = useRef(null);
    const id = useId();

    const [columnNames, setColumnNames] = useSavedState("columnNames", ["None"]);
    const [data, setData] = useSavedState("data", [["cell 0.0"], ["cell 0.1"]]);

    useEffect(() => {
        // checks for invalid ref & context
        if (!containerRef.current || !lc) return;

        let dataGrid = lc.DataGrid({ container: containerRef.current, theme: globalTheme });

        const dataWithHeaders = [columnNames, ...data];
        dataGrid.setTableContent(dataWithHeaders);
    }, [columnNames, data]);

    return <div id={id} ref={containerRef} className="w-[100%] h-[100%]"></div>;
}
