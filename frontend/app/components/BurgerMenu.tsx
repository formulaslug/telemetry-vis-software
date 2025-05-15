import { Burger, Divider, Drawer, Grid, Table, Text } from "@mantine/core";
import AutocompleteSearchbar from "./Autocomplete";
import ConfigButton from "./ConfigButton";
import { Model } from "flexlayout-react";

interface handler {
    open: () => void;
    close: () => void;
    toggle: () => void;
}

const exampleModel = Model.fromJson({
    global: {},
    borders: [],
    layout: {
        type: "row",
        id: "root",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Lap Counter",
                        component: "lap-counter",
                    },
                ],
            },
        ],
    },
});

export default function BurgerMenu({
    opened,
    handler,
}: {
    opened: boolean;
    handler: handler;
}) {
    return (
        <>
            <div className="w-full h-full">
                <Burger size={"md"} opened={opened} onClick={() => handler.toggle()} />
            </div>
            <Drawer
                title="Options"
                offset={8}
                radius={"md"}
                transitionProps={{ duration: 300 }}
                opened={opened}
                onClose={() => handler.close()}
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
                        <Grid.Col span={4}>
                            <ConfigButton
                                onClick={() => {
                                    handler.close();
                                }}
                                text="Jack's Config"
                                config={{ team: "telemetry", model: exampleModel }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>2</Grid.Col>
                        <Grid.Col span={4}>3</Grid.Col>
                    </Grid>
                </div>
            </Drawer>
        </>
    );
}
