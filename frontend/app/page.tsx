"use client";

import "./flexlayout-dark-rounded.css";
import FlexLayoutComponent from "./components/FlexLayoutComponent";
import Navbar from "./components/Navbar";
import TimelineBar from "./components/TimelineBar";
import { useEffect } from "react";

export default function Page() {
    // This is pretty stupid, but it prevents annoying right-click context menus
    // on lcjs charts (by disabling right-click menus altogether)
    useEffect(() => window.addEventListener("contextmenu", (e) => e.preventDefault()), []);
    return (
        <div className="w-[100vw] h-[100vh] flex flex-col">
            <Navbar />
            <div className="grow w-[100vw] overflow-hidden">
                <FlexLayoutComponent />
            </div>
            <TimelineBar />
        </div>
    );
}
