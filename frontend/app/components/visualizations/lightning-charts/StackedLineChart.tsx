import { ActionIcon, Menu } from "@mantine/core";
import StackedLineChartInternal from "./StackedLineChartInternal";
import { Gear } from "@phosphor-icons/react";

export default function StackedLineChart() {
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
                    <Menu.Item>
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
            <StackedLineChartInternal />
        </>
    );
}
