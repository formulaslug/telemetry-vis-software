import React from "react";

import { Text, ActionIcon, Checkbox, Menu, Slider } from "@mantine/core";
import { Gear } from "@phosphor-icons/react";
import GPSInternal from "./GPSInternal";
import { VisualizationProps } from "../../FlexLayoutComponent";

export interface GPSConfig {
    showLeaflet: boolean;
    showTrack: boolean;
    trackThickness: number;
    carLineThickness: number;
}

export function GPS({ useSavedState }: VisualizationProps<GPSConfig>) {
    // const [myConfig, setConfig] = useState<GPSConfig>(config);

    const [showLeaflet, setShowLeaflet] = useSavedState("showLeaflet", true);
    const [showTrack, setShowTrack] = useSavedState("showTrack", false);
    const [trackThickness, setTrackThickness] = useSavedState("trackThickness", 25);
    const [carLineThickness, setCarLineThickness] = useSavedState("carLineThickness", 5);

    // useEffect(() => {
    //     updateNodeConfig({ showLeaflet, showTrack, trackThickness, carLineThickness });
    // }, [showLeaflet, showTrack, trackThickness, carLineThickness]);

    const reset = () => {
        // setConfig(config);
        setShowLeaflet(true);
        setShowTrack(false);
        setTrackThickness(25);
        setCarLineThickness(5);
    };

    return (
        <>
            <Menu position="left">
                <Menu.Target>
                    <div className="absolute right-3 top-3 z-50">
                        <ActionIcon>
                            <Gear />
                        </ActionIcon>
                    </div>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>Configure GPS</Menu.Label>
                    <Menu.Item>
                        <Checkbox
                            checked={showLeaflet}
                            onChange={(e) => setShowLeaflet(e.currentTarget.checked)}
                            // onChange={(e) =>
                            //     setConfig((prev) => ({
                            //         ...prev,
                            //         showLeaflet: e.currentTarget.checked,
                            //     }))
                            // }
                            label="Toggle Map"
                            // {<GlobeHemisphereWest size={14} />}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <Checkbox
                            checked={showTrack}
                            onChange={(e) => setShowTrack(e.currentTarget.checked)}
                            label="Toggle Track"
                            // {<LineVertical size={14} weight="bold" />}
                        />
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item>
                        <Text>Track Thickness</Text>
                        <Slider
                            step={1}
                            min={10}
                            max={50}
                            value={trackThickness}
                            onChange={setTrackThickness}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <Text>Car Line Thickness</Text>
                        <Slider
                            step={1}
                            min={1}
                            max={15}
                            value={carLineThickness}
                            onChange={setCarLineThickness}
                        />
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item onClick={reset}>Reset</Menu.Item>

                    {/* todo: configure gradient keynames via dropdown */}
                </Menu.Dropdown>
            </Menu>
            <div>
                <GPSInternal
                    {...{ showLeaflet, showTrack, trackThickness, carLineThickness }}
                />
            </div>
        </>
    );
}
