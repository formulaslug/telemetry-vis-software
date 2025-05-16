"use client";
import {
    Button,
    Card,
    Group,
    LoadingOverlay,
    Modal,
    ScrollArea,
    SegmentedControl,
    Switch,
    Tree,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Dropzone, DropzoneAccept, DropzoneIdle } from "@mantine/dropzone";
import { CaretDown, Drop, FileArrowUp, FileX } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const subsystems = ["accumulator", "suspension", "imu-data", "faults", "3d-tests"];
import { availableRecordings, getDBCForRecording } from "../data-processing/http";
import { useDataMethods } from "../data-processing/DataMethodsProvider";
import AutocompleteSearchbar from "./Autocomplete";
import { File } from "@phosphor-icons/react/dist/ssr";
import BurgerMenu from "./BurgerMenu";

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
    return tree.children;
}

export default function Navbar() {
    const [loading, setLoading] = useState(false);
    const [live, setLive] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);
    const [burgerOpened, burgerHandler] = useDisclosure(false);
    const [fileName, setFileName] = useState("No File Selected");
    const [recordings, setRecordings] = useState<string[] | null>(null);
    const [isProduction, setIsProduction] = useState<boolean>(true);
    const displayedName = fileName.split("/")[fileName.split("/").length - 1];

    const { switchToRecording, switchToLiveData, subscribeNumRows, reset } = useDataMethods();
    const myRowsPRef = useRef<HTMLParagraphElement | null>(null);
    useEffect(() => {
        return subscribeNumRows((numRows: number) => {
            if (myRowsPRef.current) {
                myRowsPRef.current.innerText = numRows.toString();
                console.log(numRows.toString());
            }
        });
    }, []);

    useEffect(() => {
        availableRecordings(isProduction).then((r) => setRecordings(r));
    }, [isProduction]);

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

    function ServerToggle() {
        return (
            <Switch
                className="px-3"
                checked={isProduction}
                onChange={(e) => setIsProduction(e.currentTarget.checked)}
                label="production"
            />
        );
    }

    function DataSourcePicker() {
        function onPickerChanged(value: string) {
            if (value === "recording") {
                reset();
                setLive(false);
            } else {
                setLive(true);
                switchToLiveData();
            }
        }

        function FileTree() {
            if (recordings == null) {
                return <span>Loading...</span>;
            }

            const data = createFileTree(recordings);

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
                                    onClick={async () => {
                                        if (!hasChildren && tree.hoveredNode) {
                                            setFileName(tree.hoveredNode);
                                            setLoading(true);
                                            await switchToRecording(
                                                tree.hoveredNode,
                                                isProduction
                                            );
                                            setLoading(false);
                                            close();

                                            console.log(
                                                `Associated DBC for ${tree.hoveredNode}:`,
                                                await getDBCForRecording(
                                                    tree.hoveredNode,
                                                    isProduction
                                                )
                                            );
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
                <Modal.Root opened={opened} onClose={close} centered>
                    <Modal.Content>
                        <Modal.Header>
                            <div className="flex justify-between w-full">
                                <p>Select Data Source Type</p>
                                {process.env.NODE_ENV !== "production" ? (
                                    <ServerToggle />
                                ) : (
                                    <></>
                                )}
                            </div>
                            <Modal.CloseButton />
                        </Modal.Header>
                        <div className="m-3 mt-0">
                            <SegmentedControl
                                fullWidth
                                value={live ? "live" : "recording"}
                                onChange={onPickerChanged}
                                size={"lg"}
                                radius={"md"}
                                data={[
                                    { label: "Live", value: "live" },
                                    { label: "Recording", value: "recording" },
                                ]}
                            />
                        </div>
                        <Dropzone
                            activateOnClick={false}
                            // TODO: Make it only accept .pq / .parquet files
                            // accept={{
                            //     "application/octet-stream": [".parquet", ".pq"],
                            // }}
                            onDrop={async (files) => {
                                const file = files[0];
                                setFileName(file.name);
                                setLoading(true);
                                switchToRecording(file, isProduction);
                                setLoading(false);
                                close();
                            }}
                        >
                            <Card>
                                <ScrollArea h={530}>
                                    <Dropzone.Accept>
                                        <div className="w-[100%] h-[100%] flex justify-center items-center">
                                            <FileArrowUp size={32} weight="light" />
                                        </div>
                                    </Dropzone.Accept>

                                    {/* <Dropzone.Reject>
                                        <FileX size={50} />
                                        Please upload a parquet file
                                    </Dropzone.Reject> */}
                                    <Dropzone.Idle>
                                        {live ? <></> : <FileTree />}
                                    </Dropzone.Idle>
                                </ScrollArea>
                            </Card>
                        </Dropzone>
                    </Modal.Content>
                </Modal.Root>
            </>
        );
    }

    return (
        <>
            <div className="w-[100vw] h-[100vh] absolute">
                <LoadingOverlay
                    visible={loading}
                    zIndex={10000}
                    overlayProps={{ radius: "sm", blur: 2 }}
                />
            </div>
            <div className="bg-neutral-900 flex flex-row items-center justify-between">
                {/* Left Side */}
                <div className="flex flex-row items-center">
                    {/* Burger Menu */}
                    <div className="px-3">
                        <BurgerMenu opened={burgerOpened} handler={burgerHandler} />
                    </div>
                    {/* Logo */}
                    <div className="mx-3 my-1">
                        <Image
                            src="/fs_logo.png"
                            alt="fs-logo"
                            width={100}
                            height={40}
                            className="w-auto"
                            priority={true}
                        />
                    </div>
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
