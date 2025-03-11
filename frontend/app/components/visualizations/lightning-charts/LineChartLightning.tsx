"use client";
import React, { useContext, useEffect, useId, useRef, useState } from "react";
import { lightningChart, emptyFill, PointLineAreaSeries, ChartXY } from "@lightningchart/lcjs";
import { LightningChartsContext } from "./GlobalContext";
import globalTheme from "./GlobalTheme";

interface LineChartLightningProps {
    data: { x: number; y: number }[];
}
export default function LineChartLightning({data}: LineChartLightningProps) {
    const id = useId();
    const lc = useContext(LightningChartsContext); // TODO(jack): make this work
    const containerRef = useRef(null);
    const [chartState, setChartState] = useState<{
        chart: ChartXY;
        lineSeries: PointLineAreaSeries;
    }>();

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !lc) return;

        const chart = lc.ChartXY({ container, theme: globalTheme });
        const lineSeries = chart
            .addPointLineAreaSeries({
                dataPattern: "ProgressiveX",
            })
            .setAreaFillStyle(emptyFill);

        console.log("useState alskdjflkasdjf");

        setChartState({ chart, lineSeries });
        // chart.getDefaultAxisX().setScrollStrategy(AxisScrollStrategies.progressive);
        // .setInterval({ start: -100, end: 0, stopAxisAfter: false });
    }, [id, lc]);

    useEffect(() => {
        if (!chartState || !data || chartState.chart.isDisposed()) {
            return;
        }
        const { lineSeries } = chartState;
        lineSeries.appendSamples({
            xValues: Array.from({ length: 1000000 }, (_, i) => i as number),
            yValues: Array.from({ length: 1000000 }, (_, i) => Math.random() * i * i),
        });
        console.log("appendSamples lkasdjflkasjdfkl");
        
    }, [data]);

    return <div id={id} ref={containerRef} style={{ width: "100%", height: "100%" }}></div>;
}
