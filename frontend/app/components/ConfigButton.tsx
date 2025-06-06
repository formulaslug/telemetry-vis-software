import { Button, Text } from "@mantine/core";
import { Gear, QuestionMark, Question, TreeStructure } from "@phosphor-icons/react";
import { Actions, DockLocation, Model } from "flexlayout-react";
import { useFlexLayout } from "../FlexLayoutProvider";

//Todo: Add other team icons later
const teamToIcon = {
    telemetry: <TreeStructure size={20} />,
};

interface configInterface {
    team: string;
    model: any;
}

export default function ConfigButton({
    text,
    config,
    onClick,
}: {
    text: string;
    config: configInterface;
    onClick?: () => any;
}) {
    const [layoutModel, setLayoutModel] = useFlexLayout();
    return (
        <button
            className="w-full aspect-square bg-neutral-600 rounded-md"
            onClick={(e) => {
                onClick ? onClick() : null;
                setLayoutModel(config.model);
            }}
        >
            <div className="flex flex-col justify-center items-center">
                <Text size="xl">{text}</Text>
                {teamToIcon[config.team as keyof typeof teamToIcon] ?? (
                    <QuestionMark size={20} />
                )}
            </div>
        </button>
    );
}
