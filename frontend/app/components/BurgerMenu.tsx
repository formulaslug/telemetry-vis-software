"use client";

import { Burger, Divider, Drawer, Grid, Table, Text } from "@mantine/core";
import AutocompleteSearchbar from "./Autocomplete";
import { availableLayouts, getLayout } from "../data-processing/http";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Model } from "flexlayout-react";
import { useFlexLayout } from "../FlexLayoutProvider";

interface Layout {
    name: string;
    fileName: string;
}

export default function BurgerMenu() {
    const [_, setLayoutModel] = useFlexLayout();
    const [layouts, setLayouts] = useState<Layout[]>([]);
    const [opened, { open, close }] = useDisclosure();

    useEffect(() => {
        availableLayouts(false).then(setLayouts);
    }, []);

    return (
        <>
            <Burger opened={opened} onClick={open} />

            <Drawer
                title="Options"
                offset={8}
                radius={"md"}
                transitionProps={{ duration: 300 }}
                opened={opened}
                onClose={close}
            >
                <Divider mb={"md"} />

                {/* Visualizations */}
                <div>
                    <Text size={"lg"} mb={"sm"} fw={700}>
                        Visualizations
                    </Text>
                    <AutocompleteSearchbar />
                </div>

                <Divider my={"lg"} />

                {/* Visualizations */}
                <div>
                    <Text size={"lg"} mb={"sm"} fw={700}>
                        Configs
                    </Text>
                    <Grid>
                        {layouts.map((layout: Layout, idx: number) => (
                            <Grid.Col span={4} key={idx}>
                                <button
                                    className="w-full aspect-square bg-neutral-600 rounded-md"
                                    onClick={async (_) => {
                                        close();
                                        const config = await getLayout(layout.fileName, false);
                                        console.log(`Switching to config: ${layout.name}`);
                                        setLayoutModel(Model.fromJson(config.model));
                                    }}
                                ></button>
                            </Grid.Col>
                        ))}
                    </Grid>
                </div>
            </Drawer>
        </>
    );
}
