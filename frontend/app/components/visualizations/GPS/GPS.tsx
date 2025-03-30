"use client";
import React, { useState } from "react";

import { ActionIcon, Checkbox, Menu, Slider } from "@mantine/core";
import { Gear, GlobeHemisphereWest, LineVertical } from "@phosphor-icons/react";
import GPSInternal from "./GPSInternal";

export default function GPS() {
    const [useLeaflet, setUseLeaflet] = useState(true);
    const [useBgSeries, setUseBgSeries] = useState(false);

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
                    <Menu.Item>
                        <Slider step={1} min={10} max={50} value={25} label="Track thickness" />
                    </Menu.Item>
                    <Menu.Item>
                        <Slider step={1} min={10} max={50} value={25} label="Line thickness" />
                    </Menu.Item>
                    {/* todo: configure gradient keynames via dropdown */}
                </Menu.Dropdown>
            </Menu>
            <div>
                <GPSInternal useLeaflet={useLeaflet} useBgSeries={useBgSeries} />
            </div>
        </>
    );
}
