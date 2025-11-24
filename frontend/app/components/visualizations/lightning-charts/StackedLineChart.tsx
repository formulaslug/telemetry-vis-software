import {
    ActionIcon,
    Autocomplete,
    AutocompleteProps,
    Checkbox,
    Divider,
    Flex,
    List,
    Menu,
} from "@mantine/core";
import StackedLineChartInternal from "./StackedLineChartInternal";
import { Gear, Plus, X } from "@phosphor-icons/react";
import { VisualizationProps } from "../../FlexLayoutComponent";
import { ColumnName, columnNames, timeColumnName } from "@/app/data-processing/datatypes";
import { Fragment, useState } from "react";
import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";
import React from "react";

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
    const [yAxesInfo, setYAxesInfo] = useSavedState("yAxesInfo", []);

    const [search, setSearch] = useState("");

    // const { dataArraysRef } = useDataMethods();

    // const tryAddColumns = (keys: string[]) => {
    //     // setSearch(key);
    //     if (!keys.every((k) => (k as ColumnName) in dataArraysRef.current)) return;
    //     setYAxesInfo([
    //         {
    //             columnNames: keys as ColumnName[],
    //             // TODO: add units and label from DBC
    //         },
    //         ...yAxesInfo,
    //     ]);
    // };

    const tryAddColumn = (key: string) => {
        setSearch(key);
        if ((columnNames as string[]).includes(key)) {
            setYAxesInfo([
                {
                    columnNames: [key as ColumnName],
                    // TODO: add units and label from DBC
                },
                ...yAxesInfo,
            ]);
        }
    };

    const removeColumn = (yAxisIdx: number, colIdx: number) => {
        setYAxesInfo([
            ...yAxesInfo.slice(0, yAxisIdx),
            {
                columnNames: [
                    ...yAxesInfo[yAxisIdx].columnNames.slice(0, colIdx),
                    ...yAxesInfo[yAxisIdx].columnNames.slice(colIdx + 1),
                ],
                label: yAxesInfo[yAxisIdx].label,
                units: yAxesInfo[yAxisIdx].units,
                // TODO: add units and label from DBC
            },
            ...yAxesInfo.slice(yAxisIdx + 1),
        ]);
    };

    // const renderAutocompleteOption: AutocompleteProps["renderOption"] = ({ option }) => (
    //     <Flex>
    //         <Checkbox />
    //         <p>{option.value}</p>
    //     </Flex>
    // );

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
                        placeholder="ACC_SEG2_VOLTS_CELL2"
                        data={columnNames}
                        value={search}
                        // renderOption={renderAutocompleteOption}
                        onChange={tryAddColumn}
                    />
                    {yAxesInfo.map((yAxis, i) => (
                        <Fragment key={i}>
                            <List key={`${i}F`} type="ordered">
                                {yAxis.columnNames.map((col, j) => (
                                    <List.Item
                                        key={`${i}_${j}`}
                                        icon={<X onClick={() => removeColumn(i, j)} />}
                                    >
                                        {col}
                                    </List.Item>
                                ))}
                                <br />
                            </List>
                            <Divider key={`${i}D`} />
                        </Fragment>
                    ))}
                </Menu.Dropdown>
            </Menu>
            <StackedLineChartInternal {...{ title, showLegend, yAxesInfo, xAxisInfo }} />
        </>
    );
}
