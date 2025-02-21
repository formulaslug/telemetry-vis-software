"use client";

import Navbar from "./Navbar";
import "./dark-rounded.css";
import FlexLayoutComponent from "./FlexLayoutComponent";
import TimelineBar from "./TimelineBar";

export default function Page() {
    return (
        <>
            <div className="w-[100vw] h-[100vh] flex flex-col">
                <Navbar />
                <div className="grow w-[100vw] overflow-hidden">
                    <FlexLayoutComponent />
                </div>
                <div className="p-3">
                    <TimelineBar />
                </div>
            </div>
        </>
    );
}
