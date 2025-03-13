"use client";

import "./flexlayout-dark-rounded.css";
import FlexLayoutComponent from "./components/FlexLayoutComponent";
import Navbar from "./components/Navbar";
import TimelineBar from "./components/TimelineBar";

import { useDataSubscription } from "./data-processing/DataSubscriptionProvider";
import { useState } from "react";

export default function Page() {
    // todo: temporary
    const { subscribeNumRows } = useDataSubscription();
    const [numRows, setNumRows] = useState(0);
    subscribeNumRows((numRows: number) => {
        setNumRows(numRows);
    });

    return (
        <div className="w-[100vw] h-[100vh] flex flex-col">
            <p>{numRows}</p>
            <Navbar />
            <div className="grow w-[100vw] overflow-hidden">
                {/* TODO: LightningChartsHost doesn't work yet */}
                <FlexLayoutComponent />
            </div>
            <div className="p-3">
                <TimelineBar />
            </div>
        </div>
    );
}
