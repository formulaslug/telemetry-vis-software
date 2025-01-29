import React, {useEffect} from 'react';
import StreamType from "@/models/StreamType";
import {useState} from "react";

interface StreamTypePickerProps {
    streamType: StreamType;
    setStreamType: React.Dispatch<React.SetStateAction<StreamType>>;
    recordings: string[];
    setChosenRecording: React.Dispatch<React.SetStateAction<string>>;
}

const StreamTypePicker = ({ streamType, setStreamType, recordings, setChosenRecording }) => {
    const [minimized, setMinimized] = useState(false);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        if (minimized) {
            setFilter("");
        }
    }, []);

    if (minimized) {
        return (
            <div className={"z-50 flex bg-slate-600 justify-center"}>
                <button className={`${streamType === StreamType.LIVE ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-800"
                } px-4 py-2 rounded-l-lg`}
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
                            : "bg-gray-200 text-gray-800"
                    } px-4 py-2 rounded-r-lg`}
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
            <div className={"z-50 bg-gray-600 absolute right-0 left-0"}>
                <div className={"bg-slate-800"}>
                    <p className={"text-xl font-semibold"}>Select what type of data you would like to see</p>
                    <button className={`m-4 p-2 px-4 rounded-xl flex items-center border-white border-2 border-opacity-40`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                             className="bi bi-record-fill animate-pulse" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10"/>
                        </svg>
                        <p className={"ml-1"}>Live Data</p>
                    </button>

                    <div className={"border-2 border-white border-opacity-5 my-4"} />

                    <div className={"overflow-hidden"}>
                        <input className={"p-2 px-4 w-2/3 bg-black rounded-3xl font-mono"} type="text" placeholder={"Filter Recordings"}
                                 onChange={(e) => setFilter(e.target.value)}/>
                        {recordings
                            .filter((recording) => recording.includes(filter))
                            .map((recording) => (
                            <button
                                key={recording}
                                className={`pt-2 pb-2 px-4 flex items-center border-white border-b-2 border-opacity-40 w-2/3 hover:bg-slate-700 duration-75`}
                                onClick={() => {
                                    setChosenRecording(recording);
                                    setStreamType(StreamType.PRE_RECORDED);
                                    setMinimized(true);
                                }}>
                                <p className={"ml-1 text-xs font-mono"}>{recording}</p>
                            </button>
                        ))}
                    </div>

                    <button onClick={() => setMinimized(true)}>Minimize</button>
                    <button onClick={() => setStreamType(StreamType.LIVE)}>Live</button>
                </div>
            </div>
        )
    }
}

export default StreamTypePicker;