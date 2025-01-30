import React, {useEffect, useState} from "react";
import StreamType from "@/models/StreamType";

interface StreamTypePickerProps {
    streamType: StreamType;
    setStreamType: React.Dispatch<React.SetStateAction<StreamType>>;
    recordings: string[];
    chosenRecording: string;
    setChosenRecording: React.Dispatch<React.SetStateAction<string>>;
}

interface FileNode {
    name: string;
    children: FileNode[];
    parent?: FileNode | null;
    isOpen?: boolean; // New property to handle toggling
}

const createFileTree = (paths: string[]): FileNode => {
    const root: FileNode = { name: "root", children: [], isOpen: true };

    paths.forEach((path) => {
        const parts = path.split("/");
        let currentNode = root;

        parts.forEach((part, index) => {
            let existingNode = currentNode.children.find((child) => child.name === part);

            if (!existingNode) {
                existingNode = { name: part, children: [], parent: currentNode, isOpen: false };
                currentNode.children.push(existingNode);
            }

            currentNode = existingNode;
        });
    });

    return root;
};

const StreamTypePicker: React.FC<StreamTypePickerProps> = ({
                                                               streamType,
                                                               setStreamType,
                                                               recordings,
                                                                chosenRecording,
                                                               setChosenRecording
                                                           }) => {
    const [minimized, setMinimized] = useState(false);
    // const [filter, setFilter] = useState("");
    const [root, setRoot] = useState<FileNode | null>(null);

    // useEffect(() => {
    //     if (minimized) {
    //         setFilter("");
    //     }
    // }, [minimized]);

    useEffect(() => {
        if (recordings.length > 0) {
            setRoot(createFileTree(recordings));
        }
    }, [recordings]);

    const toggleNode = (node: FileNode) => {
        node.isOpen = !node.isOpen;
        setRoot({ ...root! }); // Trigger re-render by updating state
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
                        {node.isOpen && node.children.map((child) => renderTree(child, depth + 1))}
                    </div>
                ) : (
                    <button
                        className="text-blue-400 hover:text-blue-600 font-mono"
                        onClick={() => {
                            setChosenRecording(node.name);
                            setStreamType(StreamType.PRE_RECORDED);
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
            <div className="z-50 flex justify-end mr-4">
                <button
                    className={`p-4 ${streamType == StreamType.LIVE ? "bg-red-600" : "bg-white"} m-4 rounded-xl hover:border-gray-500 border-4 ${streamType == StreamType.LIVE ? "border-red-600" : "border-white"} duration-300`}
                    onClick={() => {
                    setMinimized(false);
                }}>
                    {streamType === StreamType.LIVE && (
                            <p className={"animate-pulse duration-200 font-semibold text-white"}>Live Data</p>
                    )}
                    {streamType === StreamType.PRE_RECORDED && chosenRecording && (
                        <p className={"text-black font-semibold text-right"}>Current Recording: {chosenRecording}</p>
                    )}
                </button>
            </div>
        );
    } else {
        return (
            <div className="flex flex-row">
                <div className="fixed inset-0 bg-gray-600 z-40 opacity-80" onClick={() => {
                    setMinimized(true);
                }}/>
                <div className="z-50 bg-slate-950 absolute right-0 left-0 m-20 p-4 rounded-lg overflow-scroll h-2/3">
                    <div className="bg-slate-950">
                        <p className="text-xl font-semibold">Select Playback Mode</p>
                        <button
                            className="m-4 p-2 px-4 rounded-xl flex items-center border-red-500 border-2"
                            onClick={() => {
                                setStreamType(StreamType.LIVE);
                                setChosenRecording("");
                                setMinimized(true);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red"
                                 className="bi bi-record-fill animate-pulse" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10" />
                            </svg>
                            <p className="ml-1">Live Data</p>
                        </button>

                        <div className="border-2 border-white border-opacity-5 my-4" />
                        <p className={"text-xl mb-4"}>Recording Playback</p>
                        <div className="overflow-hidden">
                            {/*<input*/}
                            {/*    className="p-2 px-4 w-2/3 bg-black rounded-3xl font-mono"*/}
                            {/*    type="text"*/}
                            {/*    placeholder="Filter Recordings"*/}
                            {/*    onChange={(e) => setFilter(e.target.value)}*/}
                            {root && renderTree(root)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export default StreamTypePicker;