import { Burger, Divider, Drawer, Grid, Table, Text } from "@mantine/core";
import AutocompleteSearchbar from "./Autocomplete";
import ConfigButton from "./ConfigButton";
import { Model } from "flexlayout-react";
import { layouts } from "@/constants/layouts";
import { text } from "stream/consumers";

interface handler {
    open: () => void;
    close: () => void;
    toggle: () => void;
}

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
                        {layouts.map((layout, index) => (
                            <Grid.Col span={4} key={index}>
                                <ConfigButton
                                    onClick={() => {
                                        handler.close();
                                    }}
                                    text={layout.name}
                                    config={layout.config}
                                />
                            </Grid.Col>
                        ))}
                    </Grid>
                </div>
            </Drawer>
        </>
    );
}
