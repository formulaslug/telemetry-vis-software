"use client";

import "./flexlayout-dark-rounded.css";
import FlexLayoutComponent from "./components/FlexLayoutComponent";
import Navbar from "./components/Navbar";
import TimelineBar from "./components/TimelineBar";

import { LightningChartsHost } from "./components/visualizations/lightning-charts/GlobalContext";

export default function Page() {
    return (
        <div className="w-[100vw] h-[100vh] flex flex-col">
            <Navbar />
            <div className="grow w-[100vw] overflow-hidden">
                {/* TODO: LightningChartsHost doesn't work yet */}
                <LightningChartsHost>
                    <FlexLayoutComponent />
                </LightningChartsHost>
            </div>
            <div className="p-3">
                <TimelineBar />
            </div>
        </div>
    );
}
