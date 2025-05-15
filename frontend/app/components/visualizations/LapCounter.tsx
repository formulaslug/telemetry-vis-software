"use client";

import { useContext, useEffect, useId, useRef } from "react";
import { LightningChartsContext } from "./lightning-charts/GlobalContext";
import globalTheme from "./lightning-charts/GlobalTheme";
import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";

// data is represented in row, column (y, x)

export function LapCounter() {
    const { subscribeCursorRow, subscribeReset, dataArraysRef } = useDataMethods();

    const lc = useContext(LightningChartsContext);
    const containerRef = useRef(null);
    const id = useId();

    const columnNames = ["Lap #", "Lap Time (s)"];

    useEffect(() => {
        // checks for invalid ref & context
        if (!containerRef.current || !lc) return;

        let dataGrid = lc.DataGrid({ container: containerRef.current, theme: globalTheme });

        let lapTimes: number[] = [];

        function calculateLaps() {
            let lapArray = dataArraysRef.current[":Lap"];
            let lapTimeArray = dataArraysRef.current[":LapTime"];

            dataGrid.setTitle("Lap Times");
            dataGrid.setRowContent(0, columnNames);

            if (!lapArray || !lapTimeArray) return;

            lapTimes = [];

            let previous = lapArray[0];

            for (let i = 0; i < lapArray.length; i++) {
                if (lapArray[i] > previous) {
                    lapTimes.push(lapTimeArray[i - 1]);
                    previous = lapArray[i];
                }
            }
        }

        const unsubReset = subscribeReset(() => {
            calculateLaps();
        });

        // defines subscribers
        const unsub = subscribeCursorRow((cursorRow) => {
            const lap = cursorRow ? cursorRow[":Lap"] : null;
            const lapTime = cursorRow ? cursorRow[":LapTime"] : null;

            //TODO Fix this to work better with live

            if (dataGrid.getRowMax() < 1) {
                calculateLaps();
            }

            if (lap === null || lapTime === null) return;

            for (let i = dataGrid.getRowMax(); i > lap + 1; i--) {
                dataGrid.removeRow(i);
            }

            for (let i = 0; i < lap + 1; i++) {
                dataGrid.setRowContent(i + 1, [i + 1, lapTimes[i]]);
            }

            dataGrid.setRowContent(dataGrid.getRowMax(), [dataGrid.getRowMax(), lapTime]);
        });

        return () => {
            unsub();
            unsubReset();
        };
    }, [dataArraysRef.current]);

    return <div id={id} ref={containerRef} className="w-[100%] h-[100%]"></div>;
}
