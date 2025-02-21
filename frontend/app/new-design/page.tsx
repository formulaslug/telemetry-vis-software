"use client";

import Navbar from "./Navbar";
import "./dark-rounded.css";
import LayoutComponent from "./LayoutComponent";
import TimelineBar from "./TimelineBar";

export default function Page() {
    return (
        <>
            <div className="w-[100vw] h-[100vh] flex flex-col">
                <Navbar />
                <div className="grow w-[100vw] overflow-hidden">
                    <LayoutComponent />
                </div>
                <div className="p-3">
                    <TimelineBar />
                </div>
            </div>
        </>
    );
}
