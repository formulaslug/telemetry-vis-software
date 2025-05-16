import { useContext, useEffect, useId, useRef } from "react";
import { LightningChartsContext } from "./lightning-charts/GlobalContext";
import globalTheme from "./lightning-charts/GlobalTheme";
import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";
import { ColorRGBA, SolidFill } from "@lightningchart/lcjs";

export default function AccumulatorTemperature() {
    const { subscribeCursorRow } = useDataMethods();
    const lc = useContext(LightningChartsContext);
    const containerRef = useRef(null);
    const id = useId();

    useEffect(() => {
        if (!containerRef.current || !lc) return;

        let dataGrid = lc.DataGrid({ container: containerRef.current, theme: globalTheme });

        const unsub = subscribeCursorRow((cursorRow) => {
            let tempArray = Array(4)
                .fill(null)
                .map(() => Array(7).fill(0));
            for (let i = 0; i < 28; i++) {
                let segment = Math.floor(i / 7); // 7 sensors per segment
                let numInSegment = i % 7;

                if (cursorRow) {
                    const key = `Seg${segment}_TEMP_${numInSegment}` as keyof typeof cursorRow;
                    tempArray[segment][numInSegment] = cursorRow[key] || 0;
                    const fillRed = new SolidFill({
                        color: ColorRGBA((cursorRow[key] || 0) * 10, 0, 0),
                    });
                    dataGrid.setCellBackgroundFillStyle(segment, numInSegment, fillRed);
                }
            }
            dataGrid.setTableContent(tempArray);
        });

        return () => {
            unsub();
        };
    });

    return <div id={id} ref={containerRef} className="w-[100%] h-[100%]"></div>;
}
