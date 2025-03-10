import React, { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import StreamType from "@/models/StreamType";
import { availableRecordings } from "../data-processing/http";

interface StreamTypePickerProps {
    websocketConnected: boolean;
    recordings: string[];
    streamType: StreamType;
    setStreamType: Dispatch<SetStateAction<StreamType>>;
    chosenRecording: string;
    setChosenRecording: Dispatch<SetStateAction<string>>;
}

interface FileNode {
    name: string;
    children: FileNode[];
    parent?: FileNode | null;
    isOpen?: boolean; // New property to handle toggling
}

const getNodeAbsoluteName = (node: FileNode): string => {
    let path = "";
    path += node.name;
    let parentNode: FileNode = node;
    while (true) {
        if (parentNode.parent && parentNode.parent.parent) {
            parentNode = parentNode.parent;
            path = `${parentNode.name}/${path}`;
        } else {
            return path;
        }
    }
};

const createFileTree = (paths: string[]): FileNode => {
    const root: FileNode = { name: "recordings", children: [], isOpen: true };

    paths.forEach((path) => {
        const parts = path.split("/");
        let currentNode = root;

        parts.forEach((part, _) => {
            let existingNode = currentNode.children.find((child) => child.name === part);

            if (!existingNode) {
                existingNode = {
                    name: part,
                    children: [],
                    parent: currentNode,
                    isOpen: false,
                };
                currentNode.children.push(existingNode);
            }

            currentNode = existingNode;
        });
    });

    return root;
};

export default function StreamTypePicker({
    websocketConnected,
    recordings,
    streamType,
    setStreamType,
    chosenRecording,
    setChosenRecording,
}: StreamTypePickerProps) {
    const [minimized, setMinimized] = useState(true);
    const [filter, setFilter] = useState("");
    const [root, setRoot] = useState<FileNode | null>(null);

    useEffect(() => {
        if (minimized) {
            setFilter("");
        }
    }, [minimized]);

    useEffect(() => {
        if (recordings.length > 0) {
            setRoot(createFileTree(recordings));
        }
    }, [recordings]);

    const toggleNode = (node: FileNode) => {
        node.isOpen = !node.isOpen;
        setRoot({ ...root! }); // Trigger re-render by updating state
    };

    const collapseAll = (node: FileNode) => {
        node.isOpen = false;
        node.children.forEach(collapseAll);
    };

    const expandAll = (node: FileNode) => {
        node.isOpen = true;
        node.children.forEach(expandAll);
    };

    const renderTree = (node: FileNode, depth = 0) => {
        return (
            <div key={node.name} style={{ marginLeft: depth * 20 }}>
                {node.children.length > 0 ? (
                    <div>
                        <button
                            className="text-white font-bold font-mono"
                            onClick={() => toggleNode(node)}
                        >
                            {node.isOpen ? "▼" : "▶"} {node.name}/
                        </button>
                        {node.isOpen &&
                            node.children.map((child) => renderTree(child, depth + 1))}
                    </div>
                ) : (
                    <button
                        className="text-blue-400 hover:text-blue-600 font-mono"
                        onClick={() => {
                            setChosenRecording(getNodeAbsoluteName(node));
                            setStreamType(StreamType.RECORDED);
                            setMinimized(true);
                        }}
                    >
                        {node.name}
                    </button>
                )}
            </div>
        );
    };

    if (minimized) {
        return (
            <button
                className={`p-2 px-4 border-none
                        ${
                            streamType == StreamType.LIVE
                                ? websocketConnected
                                    ? "bg-green-600 hover:border-green-200"
                                    : "bg-red-600 hover:border-red-200"
                                : "bg-white"
                        }
                        m-4 rounded-full hover:border-gray-500 border-2
                        whitespace-nowrap overflow-hidden overflow-ellipsis
                        ${streamType == StreamType.NONE && "bg-gray-600"}
                        border-white duration-300`}
                onClick={() => {
                    setMinimized(false);
                }}
            >
                {streamType === StreamType.LIVE && (
                    <p className={"font-semibold text-white"}>Live Data</p>
                )}
                {streamType === StreamType.RECORDED && chosenRecording && (
                    <p className={"text-black font-semibold text-right font-mono"}>
                        {chosenRecording}
                    </p>
                )}
                {streamType === StreamType.NONE && (
                    <p className={"text-black font-semibold text-right font-mono"}>Paused</p>
                )}
            </button>
        );
    } else {
        return (
            <div className="flex flex-row">
                <div
                    className="fixed inset-0 bg-gray-600 z-40 opacity-80"
                    onClick={() => {
                        setMinimized(true);
                    }}
                />
                <div className="z-50 bg-slate-950 absolute right-0 left-0 m-20 p-4 rounded-lg overflow-scroll h-2/3">
                    <div className="bg-slate-950">
                        <p className="text-xl font-semibold">Select Playback Mode</p>
                        <div className="flex">
                            <button
                                className="m-4 p-2 px-4 rounded-xl flex items-center border-red-500 border-2"
                                onClick={() => {
                                    setStreamType(StreamType.LIVE);
                                    setChosenRecording("");
                                    setMinimized(true);
                                }}
                            >
                                {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" */}
                                {/*     className="bi bi-record-fill animate-pulse" viewBox="0 0 16 16"> */}
                                {/*     <path fillRule="evenodd" d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10" /> */}
                                {/* </svg> */}
                                <p>Live Data</p>
                            </button>
                            <button
                                className="m-4 p-2 px-4 rounded-xl flex items-center border-gray-500 border-2"
                                onClick={() => {
                                    setStreamType(StreamType.NONE);
                                    setChosenRecording("");
                                    setMinimized(true);
                                }}
                            >
                                <p>Pause</p>
                            </button>
                        </div>

                        <div className="border-2 border-white border-opacity-5 my-4" />
                        <div className={"flex flex-row gap-x-4 mb-4"}>
                            <p className={"text-xl"}>Recording Playback</p>
                            <p className={"text-xl text-gray-500"}>
                                Current:{" "}
                                {chosenRecording === "" ? "Live Playback" : chosenRecording}
                            </p>
                        </div>
                        <div className="overflow-hidden">
                            <div className={"flex flex-row justify-between p-2 px-4 mb-4"}>
                                <div
                                    className={
                                        "flex flex-row justify-start items-center bg-slate-800 rounded-3xl pl-4 w-1/2"
                                    }
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="gray"
                                        className="bi bi-search"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                                    </svg>
                                    <input
                                        onKeyDown={(e) => {
                                            if (e.key === "Escape") {
                                                setFilter("");
                                            }
                                            if (e.key === "Enter") {
                                                const filtered = recordings.filter((r) =>
                                                    r
                                                        .toLowerCase()
                                                        .includes(filter.toString()),
                                                );
                                                if (filtered.length == 1) {
                                                    setChosenRecording(filtered[0]);
                                                    setStreamType(StreamType.RECORDED);
                                                    setMinimized(true);
                                                }
                                            }
                                        }}
                                        className="bg-slate-800 rounded-3xl font-mono pl-4 flex-1 outline-none"
                                        type="text"
                                        value={filter}
                                        placeholder="Filter Recordings"
                                        onChange={(e) => setFilter(e.target.value)}
                                    />
                                </div>
                                <div className={"flex flex-row gap-x-4"}>
                                    <button
                                        onClick={() => collapseAll(root!)}
                                        className={"py-2 rounded-full px-8 bg-slate-800"}
                                    >
                                        <p>Collapse All</p>
                                    </button>
                                    <button
                                        onClick={() => expandAll(root!)}
                                        className={"py-2 rounded-full px-8 bg-slate-800"}
                                    >
                                        <p>Expand All</p>
                                    </button>
                                </div>
                            </div>
                            <div className={"flex flex-col items-start"}>
                                {filter != "" &&
                                    recordings
                                        .filter((recording) =>
                                            recording
                                                .toLowerCase()
                                                .includes(filter.toLowerCase()),
                                        )
                                        .map((recording) => (
                                            <button
                                                key={recording}
                                                className="text-blue-400 hover:text-blue-600 font-mono"
                                                onClick={() => {
                                                    setChosenRecording(recording);
                                                    setStreamType(StreamType.RECORDED);
                                                    setMinimized(true);
                                                }}
                                            >
                                                {recording}
                                            </button>
                                        ))}
                            </div>
                            {filter == "" && root && renderTree(root)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
