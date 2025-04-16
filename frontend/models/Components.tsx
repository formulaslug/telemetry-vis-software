import CarWireframe from "@/app/components/visualizations/CarWireframe";
import GForceGauge from "@/app/components/visualizations/GForceGauge";
import GPSInternal from "@/app/components/visualizations/GPS/GPS";
import LineChart from "@/app/components/visualizations/lightning-charts/LineChart";
import SuspensionGauge from "@/app/components/visualizations/SuspensionGauge";
import TextBox from "@/app/components/visualizations/TextBox";

const Components = {
    // prettier-ignore
    "suspension-gauge": <SuspensionGauge />,
    "car-wireframe": <CarWireframe />,
    "g-force-gauge": <GForceGauge x={1} y={1} z={1} />,
    "acc-seg-0-voltage-linegraph": (
        <LineChart
            title={"Acc Seg 0 Voltage"}
            yAxisTitle="Voltage"
            yAxisColumns={[
                "Seg0_VOLT_0",
                "Seg0_VOLT_1",
                "Seg0_VOLT_2",
                "Seg0_VOLT_3",
                "Seg0_VOLT_4",
                "Seg0_VOLT_5",
            ]}
            yAxisUnits="volts"
        />
    ),
    "timings-box": (
        <div className="p-0">
            <TextBox title="Lap Time" keyName=":LapTime" />
            <TextBox title="Lap Number" keyName=":Lap" /> {/*TODO: lcjs datagrid*/}
            <TextBox title="Speed" keyName="VDM_GPS_SPEED" /> {/*TODO: lcjs guage chart*/}
        </div>
    ),
    "brake-pressure-linegraph": (
        <LineChart
            // title={""}
            yAxisTitle="Brake Pressure"
            yAxisColumns={["TELEM_STEERBRAKE_BRAKEF", "TELEM_STEERBRAKE_BRAKER"]}
            yAxisUnits="psi(?)"
        />
    ),
    "long-accel-linegraph": (
        <LineChart
            // title={""}
            yAxisTitle="Longitudinal Acceleration"
            yAxisColumns={[
                "VDM_X_AXIS_ACCELERATION",
                "VDM_Y_AXIS_ACCELERATION",
                "VDM_Z_AXIS_ACCELERATION",
            ]}
        />
    ),
    gps: <GPSInternal />,
    skeleton: <div className="w-full h-full bg-neutral-500"></div>,
};
export default Components;
