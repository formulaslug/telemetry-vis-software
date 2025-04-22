import TextBox from "./TextBox";

export default function LapsTable() {
    return (
        <div className="p-0">
            <TextBox title="Lap Time" keyName=":LapTime" />
            <TextBox title="Lap Number" keyName=":Lap" /> {/*TODO: lcjs datagrid*/}
            <TextBox title="Speed" keyName="VDM_GPS_SPEED" /> {/*TODO: lcjs guage chart*/}
        </div>
    );
}
