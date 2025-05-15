import { Burger, Divider, Drawer, Grid, Table, Text } from "@mantine/core";
import AutocompleteSearchbar from "./Autocomplete";
import ConfigButton from "./ConfigButton";
import { Model } from "flexlayout-react";

interface handler {
    open: () => void;
    close: () => void;
    toggle: () => void;
}

const exampleConfig = {
    type: "tab",
    name: "Stacked Line Chart",
    component: "stacked-line-chart",
    children: [
        {
            type: "tab",
            name: "Stacked Line Chart",
            component: "stacked-line-chart",
            config: {
                yAxesInfo: [
                    {
                        columnNames: [
                            "Seg0_VOLT_0",
                            "Seg0_VOLT_1",
                            "Seg0_VOLT_2",
                            "Seg0_VOLT_3",
                            "Seg0_VOLT_4",
                            "Seg0_VOLT_5",
                            "Seg0_VOLT_6",
                        ],
                        label: "Seg0 Temps",
                        units: "V",
                    },
                    {
                        columnNames: [
                            "Seg0_TEMP_0",
                            "Seg0_TEMP_1",
                            "Seg0_TEMP_2",
                            "Seg0_TEMP_3",
                            "Seg0_TEMP_4",
                            "Seg0_TEMP_5",
                            "Seg0_TEMP_6",
                        ],
                        label: "Seg0 Voltages",
                        units: "°C",
                    },
                ],
            },
        },
    ],
    config: {
        yAxesInfo: [
            {
                columnNames: [
                    "Seg0_VOLT_0",
                    "Seg0_VOLT_1",
                    "Seg0_VOLT_2",
                    "Seg0_VOLT_3",
                    "Seg0_VOLT_4",
                    "Seg0_VOLT_5",
                    "Seg0_VOLT_6",
                ],
                label: "Seg0 Temps",
                units: "V",
            },
            {
                columnNames: [
                    "Seg0_TEMP_0",
                    "Seg0_TEMP_1",
                    "Seg0_TEMP_2",
                    "Seg0_TEMP_3",
                    "Seg0_TEMP_4",
                    "Seg0_TEMP_5",
                    "Seg0_TEMP_6",
                ],
                label: "Seg0 Voltages",
                units: "°C",
            },
        ],
    },
};

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
                                text="Jack's Config"
                                config={{ team: "telemetry", config: exampleConfig }}
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
