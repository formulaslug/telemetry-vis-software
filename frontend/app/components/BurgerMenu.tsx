import { Burger, Divider, Drawer, Grid, Table, Text } from "@mantine/core";
import AutocompleteSearchbar from "./Autocomplete";
import ConfigButton from "./ConfigButton";
import { IJsonModel, Model } from "flexlayout-react";
import { layouts } from "@/constants/layouts";
import { text } from "stream/consumers";
import { availableConfigs } from "../data-processing/http";

interface handler {
    open: () => void;
    close: () => void;
    toggle: () => void;
}

interface configInterface {
    name: string,
    team: string,
    fileName: string
}

const configs = await availableConfigs(false)

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
                        {configs.map((config: configInterface, index: number) => (
                            <Grid.Col span={4} key={index}>
                                <ConfigButton
                                    onClick={() => {
                                        handler.close();
                                    }}
                                    team={config.team}
                                    text={config.name}
                                    fileName={config.fileName}
                                />
                            </Grid.Col>
                        ))}
                    </Grid>
                </div>
            </Drawer>
        </>
    );
}
