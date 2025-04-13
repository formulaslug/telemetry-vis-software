import { ActionIcon, Menu } from "@mantine/core";
import StackedLineChartInternal from "./StackedLineChartInternal";
import { Gear } from "@phosphor-icons/react";
import { VisualizationProps } from "../../FlexLayoutComponent";
import { ColumnName, timeColumnName } from "@/app/data-processing/datatypes";

type YAxisInfo = {
    columnNames: ColumnName[];
    label?: string;
    units?: string;
};
type XAxisInfo = {
    columnName: ColumnName;
    label?: string;
    units?: string;
};

export interface StackedLineChartConfig {
    yAxesInfo: YAxisInfo[];
    xAxisInfo: XAxisInfo;

    title?: string;
}

export function StackedLineChart({
    useSavedState,
}: VisualizationProps<StackedLineChartConfig>) {
    const [title, setTitle] = useSavedState("title", undefined);
    const [xAxisInfo, setXAxisInfo] = useSavedState("xAxisInfo", {
        columnName: timeColumnName,
        label: "Time",
        units: "s",
    });
    const [yAxesInfo, setYAxesInfo] = useSavedState("yAxesInfo", [
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
            label: "Seg0 Temps",
            units: "°C",
        },
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
            label: "Seg0 Voltages",
            units: "V",
        },
    ]);

    return (
        <>
            <Menu position="left">
                <Menu.Target>
                    <div className="absolute right-3 top-3 z-50">
                        <ActionIcon>
                            <Gear />
                        </ActionIcon>
                    </div>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>Add Data...</Menu.Label>
                    <Menu.Item></Menu.Item>
                </Menu.Dropdown>
            </Menu>
            <StackedLineChartInternal {...{ title, yAxesInfo, xAxisInfo }} />
        </>
    );
}
