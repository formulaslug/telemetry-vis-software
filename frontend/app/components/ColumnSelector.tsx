import {
    Combobox,
    ComboboxTarget,
    ComboboxDropdown,
    ComboboxOptions,
    useCombobox,
} from "@mantine/core";
import { Checkbox, Input, ScrollArea, Stack } from "@mantine/core";
import { useState, useMemo } from "react";
import Fuse from "fuse.js";

type ColumnSelectorProps = {
    allColumns: string[];
    onChange: (selected: string[]) => void;
};

export function ColumnSelector({ allColumns, onChange }: ColumnSelectorProps) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<string[]>([]);

    const combobox = useCombobox();

    // Filtered options
    const filtered = useMemo(() => {
        const fuse = new Fuse(allColumns, {});
        return fuse.search(search).map((result) => result.item);
    }, [search, allColumns]);

    const isAllVisibleChecked = filtered.every((col) => selected.includes(col));
    const isAnyVisibleChecked = filtered.some((col) => selected.includes(col));
    const rootIndeterminate = isAnyVisibleChecked && !isAllVisibleChecked;

    const toggleColumn = (col: string) => {
        setSelected((current) => {
            const next = current.includes(col)
                ? current.filter((c) => c !== col)
                : [...current, col];
            onChange(next);
            return next;
        });
    };

    const toggleAllVisible = () => {
        setSelected((current) => {
            const next = isAllVisibleChecked
                ? current.filter((col) => !filtered.includes(col))
                : Array.from(new Set([...current, ...filtered]));
            onChange(next);
            return next;
        });
    };

    return (
        <Combobox
            store={combobox}
            withinPortal={false}
            onOptionSubmit={() => combobox.closeDropdown()}
        >
            <Combobox.Target>
                <Input
                    placeholder="Search columns..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.currentTarget.value);
                        combobox.openDropdown();
                    }}
                    onClick={() => combobox.openDropdown()}
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <ScrollArea.Autosize mah={200}>
                    <Stack p="xs">
                        <Checkbox
                            label="Select all visible"
                            checked={isAllVisibleChecked}
                            indeterminate={rootIndeterminate}
                            onChange={toggleAllVisible}
                        />
                        {filtered.map((col) => (
                            <Checkbox
                                key={col}
                                label={col}
                                checked={selected.includes(col)}
                                onChange={() => toggleColumn(col)}
                            />
                        ))}
                        {filtered.length === 0 && (
                            <div style={{ padding: 8, color: "#888" }}>No matches</div>
                        )}
                    </Stack>
                </ScrollArea.Autosize>
            </Combobox.Dropdown>
        </Combobox>
    );
}
