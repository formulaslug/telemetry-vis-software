import { ActionIcon, Autocomplete, Checkbox, Menu } from "@mantine/core";
import StackedLineChartInternal from "./StackedLineChartInternal";
import { Gear, Plus } from "@phosphor-icons/react";
import { VisualizationProps } from "../../FlexLayoutComponent";
import { ColumnName, columnNames, timeColumnName } from "@/app/data-processing/datatypes";
import { useState } from "react";

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
    showLegend?: boolean;
}

export function StackedLineChart({
    useSavedState,
}: VisualizationProps<StackedLineChartConfig>) {
    const [title, setTitle] = useSavedState("title", undefined);
    const [showLegend, setShowLegend] = useSavedState("showLegend", false);
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

    const [search, setSearch] = useState("");

    // this is just a basic, not-thought-through example of how to modify the
    // state to add new columns
    const tryAddColumn = (key: string) => {
        setSearch(key);
        if ((columnNames as string[]).includes(key)) {
            setYAxesInfo([
                {
                    columnNames: [key as ColumnName],
                },
                ...yAxesInfo,
            ]);
        }
    };

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
                    <Menu.Label>Configure Stacked Line Charts</Menu.Label>
                    <Menu.Item>
                        <Checkbox
                            checked={showLegend}
                            onChange={(e) => setShowLegend(e.currentTarget.checked)}
                            label="Show Legend"
                        />
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
            <Menu position="left">
                <Menu.Target>
                    <div className="absolute right-3 top-12 z-50">
                        <ActionIcon>
                            <Plus />
                        </ActionIcon>
                    </div>
                </Menu.Target>
                <Menu.Dropdown>
                    <Autocomplete
                        label="Add Columns"
                        placeholder="Seg0_VOLT_0"
                        data={columnNames}
                        value={search}
                        onChange={tryAddColumn}
                    />
                </Menu.Dropdown>
            </Menu>
            <StackedLineChartInternal {...{ title, showLegend, yAxesInfo, xAxisInfo }} />
        </>
    );
}
