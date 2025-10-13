import TextBox from "./TextBox";

export default function LapsTable() {
    return (
        <div className="p-0">
            {/* Lap counting was done by the AEMdash, which we don't have a replacement for yet on fs-3. */}
            {/* <TextBox title="Lap Time" keyName=":LapTime" /> */}
            {/* <TextBox title="Lap Number" keyName=":Lap" /> */}
            <TextBox title="Speed" keyName="VDM_GPS_SPEED" /> {/*TODO: lcjs guage chart*/}
        </div>
    );
}
