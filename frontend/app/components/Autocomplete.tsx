"use client";
import Components from "@/models/Components";
import {
    Button,
    Group,
    Modal,
    SegmentedControl,
    Tree,
    Switch,
    Stack,
    Textarea,
    AngleSlider,
    Center,
    TextInput,
    Flex,
    Autocomplete,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";

const componentArray = Object.keys(Components);

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
