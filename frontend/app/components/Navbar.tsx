"use client";
import { Button, Group, Modal, SegmentedControl, Tree } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CaretDown } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const subsystems = ["accumulator", "suspension", "imu-data", "faults", "3d-tests"];
import { availableRecordings } from "../data-processing/http";
import { useDataMethods } from "../data-processing/DataMethodsProvider";

//takes in the list of files as an array and outputs it in mantine tree format
function createFileTree(paths: string[] | undefined) {
    interface pathType {
        value: string;
        label: string;
        children: pathType[];
    }

    if (typeof paths == "undefined") {
        return { label: "None", value: "none" };
    }

    let tree: { [key: string]: any } = { children: [] };
    let newPaths = paths.map((element) => {
        return element.split("/");
    });

    for (let root of newPaths) {
        let currentLevel = tree.children;
        for (let i = 0; i < root.length; i++) {
            const currentPath = root[i];
            const isLeaf = i === root.length - 1;

            let existingNode = currentLevel.find(
                (node: pathType) => node.value === currentPath
            );

            if (!existingNode) {
                existingNode = {
                    value: isLeaf ? root.join("/") : currentPath,
                    label: currentPath,
                    children: [],
                };
                currentLevel.push(existingNode);
            }

            currentLevel = existingNode.children;
        }
    }
    return tree.children[0];
}

export default function Navbar() {
    const [live, setLive] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);
    const [fileName, setFileName] = useState("No File Selected");
    const [recordings, setRecordings] = useState<string[] | null>(null);
    const displayedName = fileName.split("/")[fileName.split("/").length - 1];

    const { switchToRecording, switchToLiveData, subscribeNumRows } = useDataMethods();
    const myRowsPRef = useRef<HTMLParagraphElement | null>(null);
    useEffect(() => {
        return subscribeNumRows((numRows: number) => {
            if (myRowsPRef.current) {
                myRowsPRef.current.innerText = numRows.toString();
            }
        });
    }, []);
    {
        /* <p>{myNumRows}</p> */
    }
    {
        /* <button onClick={() => switchToLiveData()}>blah</button> */
    }

    useEffect(() => {
        availableRecordings().then((r) => setRecordings(r ?? []));
    }, []);

    function SystemSelector() {
        const [opened, { open, close }] = useDisclosure(false);

        return (
            <>
                <Modal opened={opened} onClose={close} title="Select Subsystem" centered>
                    {subsystems.map((system) => {
                        return (
                            <div className="m-3 " key={system}>
                                <Link href={`/${system}`}>
                                    <Button variant="filled" fullWidth>
                                        {system.toUpperCase()}
                                    </Button>
                                </Link>
                            </div>
                        );
                    })}
                </Modal>
                <Button onClick={open}>Open System</Button>
            </>
        );
    }

    function DataSourcePicker() {
        function onPickerChanged(value: string) {
            if (value === "recording") {
                switchToRecording(fileName);
            } else {
                switchToLiveData();
            }
            // setLive(value === "live");
        }

        function FileTree() {
            if (recordings == null) {
                return <span>Loading...</span>;
            }

            const data = [createFileTree(recordings)];

            return (
                <>
                    <Tree
                        data={data}
                        renderNode={({ tree, node, expanded, hasChildren, elementProps }) => (
                            <Group gap={5} {...elementProps}>
                                {hasChildren && (
                                    <CaretDown
                                        size={18}
                                        style={{
                                            transform: expanded
                                                ? "rotate(0deg)"
                                                : "rotate(-90deg)",
                                            transition: "all 0.2s",
                                            transitionTimingFunction: "bounce",
                                            fill: "gray",
                                        }}
                                    />
                                )}

                                <span
                                    onClick={() => {
                                        if (tree.hoveredNode?.includes("/")) {
                                            setFileName(tree.hoveredNode);

                                            close();
                                        }
                                    }}
                                    className={
                                        hasChildren
                                            ? "text-foreground"
                                            : `text-[--mantine-color-primary-5]`
                                    }
                                >
                                    {node.label}
                                </span>
                            </Group>
                        )}
                    />
                </>
            );
        }

        return (
            <>
                <Modal
                    opened={opened}
                    onClose={close}
                    title="Select Data Source Type"
                    centered
                >
                    <div className="m-3">
                        <SegmentedControl
                            fullWidth
                            value={live ? "live" : "recording"}
                            onChange={onPickerChanged}
                            size={"lg"}
                            radius={"md"}
                            data={[
                                { label: "Live", value: "live" },
                                { label: displayedName, value: "recording" },
                            ]}
                        />
                    </div>
                    {live ? <></> : <FileTree />}
                </Modal>
            </>
        );
    }

    return (
        <>
            <div className="bg-neutral-900 flex flex-row items-center justify-between">
                {/* Left Side */}
                <div className="flex flex-row items-center">
                    {/* Logo */}
                    <div className="m-3">
                        <Image
                            src="/fs_logo.png"
                            alt="fs-logo"
                            width={100}
                            height={40}
                            className="w-auto"
                            priority={true}
                        />
                    </div>

                    {/* Modal */}
                    <div className="m-3">
                        <SystemSelector />
                    </div>

                    <p ref={myRowsPRef}>?</p>
                </div>
                {/* Right Side */}
                <div className="m-3">
                    <Button
                        fullWidth
                        onClick={open}
                        color={live ? "green" : "red"}
                        variant="filled"
                    >
                        {live ? "Live" : displayedName}
                    </Button>
                    <DataSourcePicker />
                </div>
            </div>
        </>
    );
}
