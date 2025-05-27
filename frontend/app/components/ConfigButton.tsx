import { Button, Text } from "@mantine/core";
import { Gear, QuestionMark, Question, TreeStructure } from "@phosphor-icons/react";
import { Actions, DockLocation, IJsonModel, Model } from "flexlayout-react";
import { useFlexLayout } from "../FlexLayoutProvider";
import { getConfig } from "../data-processing/http";

//Todo: Add other team icons later
const teamToIcon = {
    telemetry: <TreeStructure size={20} />,
};

interface configInterface {
    model: any;
}

export default function ConfigButton({
    text,
    team,
    fileName,
    onClick,
}: {
    text: string;
    team: string;
    fileName: string;
    onClick?: () => any;
}) {
    const [layoutModel, setLayoutModel] = useFlexLayout();
    return (
        <button
            className="w-full aspect-square bg-neutral-600 rounded-md"
            onClick={async (e) => {
                onClick ? onClick() : null;
                const config = await getConfig(fileName, false)
                console.log(config)
                setLayoutModel(Model.fromJson(config.model));
            }}
        >
            <div className="flex flex-col justify-center items-center">
                <Text size="xl">{text}</Text>
                {teamToIcon[team as keyof typeof teamToIcon] ?? (
                    <QuestionMark size={20} />
                )}
            </div>
        </button>
    );
}
