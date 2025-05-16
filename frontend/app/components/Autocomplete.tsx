"use client";
import { Autocomplete } from "@mantine/core";
import { useEffect, useState } from "react";
import { visualizations } from "./visualizations/Visualizations";
import { Actions, DockLocation } from "flexlayout-react";
import { useFlexLayout } from "../FlexLayoutProvider";

const componentArray = Object.keys(visualizations);

export default function AutocompleteSearchbar() {
    const [layoutModel, setLayoutModel] = useFlexLayout();
    const [value, setValue] = useState("");

    useEffect(() => {
        if (componentArray.includes(value)) {
            layoutModel.doAction(
                Actions.addNode(
                    {
                        type: "tab",
                        component: value,
                        name: value,
                    },
                    "root",
                    DockLocation.CENTER,
                    0
                )
            );
        }
    }, [value]);

    return (
        <>
            <Autocomplete
                label="Widget Search"
                placeholder="Pick Widget or enter anything"
                data={componentArray}
                value={value}
                onChange={setValue}
            />
        </>
    );
}
