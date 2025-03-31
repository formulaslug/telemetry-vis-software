"use client";
import React, { useCallback, useState } from "react";

import { Text, Button, ActionIcon, Checkbox, Menu, Slider } from "@mantine/core";
import { Gear, GlobeHemisphereWest, LineVertical } from "@phosphor-icons/react";
import GPSInternal from "./GPSInternal";

export default function GPS() {
    const [useLeaflet, setUseLeaflet] = useState(true);
    const [useBgSeries, setUseBgSeries] = useState(false);
    const [trackThickness, setTrackThickness] = useState(25);
    const [carLineThickness, setCarLineThickness] = useState(5);
    const reset = useCallback(() => {
        setUseBgSeries(false);
        setUseLeaflet(true);
        setTrackThickness(25);
        setCarLineThickness(5);
    }, []);

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
                            checked={useLeaflet}
                            onChange={(e) => setUseLeaflet(e.currentTarget.checked)}
                            label="Toggle Map"
                            // {<GlobeHemisphereWest size={14} />}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <Checkbox
                            checked={useBgSeries}
                            onChange={(e) => setUseBgSeries(e.currentTarget.checked)}
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
                    useLeaflet={useLeaflet}
                    useBgSeries={useBgSeries}
                    trackThickness={trackThickness}
                    carLineThickness={carLineThickness}
                />
            </div>
        </>
    );
}
