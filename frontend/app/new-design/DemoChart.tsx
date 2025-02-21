import LineChart from "../components/LineChart";

export default function DemoChart() {
    return (
        <>
            <LineChart
                title="Demo"
                numRows={10}
                dataX={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                dataY={[[10, 20, 30, 5, 10, 14, 13, 4, 2, 30]]}
                dataXUnits={"Time (s)"}
                dataYUnits={"Num"}
            />
        </>
    );
}
