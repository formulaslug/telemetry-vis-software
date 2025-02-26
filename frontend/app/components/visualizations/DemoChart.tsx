import LineChartLightning from "./lightning-charts/LineChartLightning";
import LineChart from "./LineChart";

export default function DemoChart() {
    return (
        <>
            {/* <LineChart */}
            {/*     title="Demo" */}
            {/*     numRows={10} */}
            {/*     dataX={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} */}
            {/*     dataY={[[10, 20, 30, 5, 10, 14, 13, 4, 2, 30]]} */}
            {/*     dataXUnits={"Time (s)"} */}
            {/*     dataYUnits={"Num"} */}
            {/* /> */}
            <LineChartLightning
                data={[{x: 1, y: 1}, {x: 2, y: 9}, {x: 3, y: 12}, {x: 4, y: 3}, {x: 5, y: 4}]}
            />
        </>
    );
}
