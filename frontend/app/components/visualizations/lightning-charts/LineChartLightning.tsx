"use client";
import React, { useContext, useEffect, useId, useRef, useState } from "react";
import {
    AxisScrollStrategies,
    lightningChart,
    emptyFill,
    PointLineAreaSeries,
    ChartXY,
} from "@lightningchart/lcjs";
import { LightningChartsContext } from "./GlobalContext";

interface LineChartLightningProps {
    data: { x: number; y: number }[];
}
export default function LineChartLightning(props: LineChartLightningProps) {
    const { data } = props;
    const id = useId();
    // const lc = useContext(LightningChartsContext); // TODO(jack): make this work
    const containerRef = useRef(null);
    const [chartState, setChartState] = useState<{
        chart: ChartXY;
        lineSeries: PointLineAreaSeries;
    }>();

    useEffect(() => {
        const container = containerRef.current;
        if (!container /*|| !lc*/) return;

        // TODO(jack): remove this, use lc context instead
        const lc = lightningChart({
            license: process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_KEY,
            licenseInformation: {
                appTitle:
                    process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_APP_TITLE!,
                company: process.env.NEXT_PUBLIC_LIGHTNING_CHART_LICENSE_INFORMATION_COMPANY!,
            },
            // Fixes bad Firefox performance:
            // https://lightningchart.com/js-charts/docs/more-guides/optimizing-performance/#mozilla-firefox
            sharedContextOptions: {
                useIndividualCanvas: false,
            },
        });

        const chart = lc.ChartXY({ container });
        const lineSeries = chart
            .addPointLineAreaSeries({
                dataPattern: "ProgressiveX",
            })
            .setAreaFillStyle(emptyFill)
            .setMaxSampleCount(100_00);
        setChartState({ chart, lineSeries });
        // chart.getDefaultAxisX().setScrollStrategy(AxisScrollStrategies.progressive);
        // .setInterval({ start: -100, end: 0, stopAxisAfter: false });

        return () => lc.dispose();
    }, [id /*, lc*/]);

    useEffect(() => {
        if (!chartState || !data || chartState.chart.isDisposed()) {
            return;
        }
        const { lineSeries } = chartState;
        lineSeries.appendJSON(data);
    }, [data]);

    return <div id={id} ref={containerRef} style={{ width: "100%", height: "100%" }}></div>;
}
