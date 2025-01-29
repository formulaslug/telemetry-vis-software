import React, {useEffect} from 'react';
import StreamType from "@/models/StreamType";
import {useState} from "react";

interface StreamTypePickerProps {
    streamType: StreamType;
    setStreamType: React.Dispatch<React.SetStateAction<StreamType>>;
    recordings: string[];
    setChosenRecording: React.Dispatch<React.SetStateAction<string>>;
}

interface FileSegment {
    is_file: boolean;
    is_dir: boolean;
    name: string;
}

const StreamTypePicker: React.FC<StreamTypePickerProps> = ({ streamType, setStreamType, recordings, setChosenRecording }) => {
    const [minimized, setMinimized] = useState(false);
    const [filter, setFilter] = useState("");

    const [files, setFiles] = useState<FileSegment[]>([]);

    useEffect(() => {
        if (minimized) {
            setFilter("");
        }

        // initialize file dir
        if (recordings) {
            for (let i = 0; i < recordings.length; i++) {
                let t = recordings[i]
                let segments = t.split("/");

                for (let j = 0; j < segments.length - 1; j++) {

                }
                files.push({
                    is_file: true,
                    is_dir: false,
                    name: recordings[i]
                });
            }
        }

    }, []);

    if (minimized) {
        return (
            <div className={"z-50 flex bg-slate-600 justify-center"}>
                <button className={`${streamType === StreamType.LIVE ? "bg-red-500 text-white"
                    : "text-white"
                } px-4 py-2 rounded-lg`}
                        onClick={() => {
                            setStreamType(StreamType.LIVE);
                            setChosenRecording("");
                            setMinimized(true);
                        }}
                >
                    Live
                </button>
                <button
                    className={`${
                        streamType === StreamType.PRE_RECORDED
                            ? "bg-green-500 text-white"
                            : "text-white"
                    } px-4 py-2 rounded-lg`}
                    onClick={() => {
                        setStreamType(StreamType.UNDEFINED);
                        setChosenRecording("");
                        setMinimized(false);
                    }}
                >
                    Pre-Recorded
                </button>
            </div>
        )
    } else {
        return (
            <div className={"flex flex-row"}>
                <div className={"absolute z-40 bg-slate-800 w-screen h-screen bg-opacity-90"}/>
                <div className={"z-50 bg-blue-600 absolute right-0 left-0 m-20 p-4 rounded-lg overflow-scroll"}>
                    <div className={"bg-slate-800 max-h-72"}>
                        <p className={"text-xl font-semibold"}>Select what type of data you would like to see</p>
                        <button
                            className={`m-4 p-2 px-4 rounded-xl flex items-center border-white border-2 border-opacity-40`}
                            onClick={() => {
                                setStreamType(StreamType.LIVE);
                                setChosenRecording("");
                                setMinimized(true);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 className="bi bi-record-fill animate-pulse" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10"/>
                            </svg>
                            <p className={"ml-1"}>Live Data</p>
                        </button>

                        <p>files: {files.filter((f) => f.is_dir)}</p>

                        <div className={"border-2 border-white border-opacity-5 my-4"}/>

                        <div className={"overflow-hidden"}>
                            <input className={"p-2 px-4 w-2/3 bg-black rounded-3xl font-mono"} type="text"
                                   placeholder={"Filter Recordings"}
                                   onChange={(e) => setFilter(e.target.value)}/>
                            {recordings
                                .filter((recording) => recording.includes(filter))
                                .sort()
                                .map((recording) => (
                                    <button
                                        key={recording}
                                        className={`pt-2 pb-2 px-4 flex items-center border-white border-b-2 border-opacity-40 w-2/3 hover:text-orange-500`}
                                        onClick={() => {
                                            setChosenRecording(recording);
                                            setStreamType(StreamType.PRE_RECORDED);
                                            setMinimized(true);
                                        }}>
                                        <p className={"ml-1 text-xs font-mono text-left"}>{recording}</p>
                                    </button>
                                ))}
                        </div>

                        <button onClick={() => setMinimized(true)}>Minimize</button>
                        <button onClick={() => setStreamType(StreamType.LIVE)}>Live</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default StreamTypePicker;