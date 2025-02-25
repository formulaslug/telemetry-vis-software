// @ts-ignore
import Dygraph from "dygraphs";
import "dygraphs/dist/dygraph.css";
import { useEffect, useRef } from "react";

interface LineChartDygraphProps {
    title: string;
    numRows: number;
    data: [number, number][];
    datasetNames?: string[];
    dataXUnits: string;
    dataYUnits: string;
}

export default function LineChartDygraph(props: LineChartDygraphProps) {
    const dygraphRef = useRef<HTMLElement | null>(null);
    const dygraphInstanceRef = useRef(null);

    useEffect(() => {
        if (dygraphRef) {
            dygraphInstanceRef.current = new Dygraph(dygraphRef.current, props.data, {
                labels: ["a", "b"],
            });
        }
        // @ts-ignore
        return () => dygraphInstanceRef.current?.destroy();
    }, []);

    // @ts-ignore
    return <div className="h-[100%] w-[100%] overflow-hidden" ref={dygraphRef}></div>;
}
