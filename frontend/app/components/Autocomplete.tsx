"use client";
import { Autocomplete } from "@mantine/core";
import { useEffect, useState } from "react";
import { visualizations } from "./visualizations/Visualizations";

const componentArray = Object.keys(visualizations);

export default function AutocompleteSearchbar() {
    const [value, setValue] = useState("");

    useEffect(() => {
        if (componentArray.includes(value)) console.log(value);
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
