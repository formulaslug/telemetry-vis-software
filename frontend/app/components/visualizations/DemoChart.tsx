"use client";
import LineChartLightning from "./lightning-charts/LineChartLightning";

export default function DemoChart() {
    return (
        <>
            <LineChartLightning
                data={[
                    { x: 1, y: 1 },
                    { x: 2, y: 9 },
                    { x: 3, y: 12 },
                    { x: 4, y: 3 },
                    { x: 5, y: 4 },
                ]}
            />
        </>
    );
}
