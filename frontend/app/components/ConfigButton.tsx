import { Button, Text } from "@mantine/core";
import { Gear, TreeStructure } from "@phosphor-icons/react";
import { layoutModel } from "./FlexLayoutComponent";
import { Actions, DockLocation, Model } from "flexlayout-react";

//Todo: Add other team icons later
const teamToIcon = {
    telemetry: <TreeStructure size={20} />,
};

interface configInterface {
    team: "telemetry";
    config: any;
}

function purgeChildren(node: any) {
    console.log(node);
    for (let child in node.getChildren()) {
        purgeChildren(node.children[child]);
    }
    layoutModel.doAction(Actions.deleteTab(node.getId()));
}

function setConfig(config: configInterface) {
    let root = layoutModel.getRoot();

    //TODO: Fix this and figure out why it's so cooked 😭
    for (let i = 0; i < 20; i++) {
        purgeChildren(root);
    }
    console.log(config.config);
    layoutModel.doAction(Actions.addNode(config.config, "root", DockLocation.CENTER, 1));
}

export default function ConfigButton({
    text,
    config,
}: {
    text: string;
    config: configInterface;
}) {
    return (
        <button
            className="w-full aspect-square bg-neutral-600 rounded-md"
            onClick={() => {
                setConfig(config);
            }}
        >
            <div className="flex flex-col justify-center items-center">
                <Text size="xl">{text}</Text>
                {teamToIcon[config.team]}
            </div>
        </button>
    );
}
