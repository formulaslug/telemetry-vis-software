"use client";
import React, { useContext, useEffect, useId, useRef, useState } from "react";
import { lightningChart, emptyFill, PointLineAreaSeries, ChartXY } from "@lightningchart/lcjs";
import { LightningChartsContext } from "./GlobalContext";
import globalTheme from "./GlobalTheme";
import { useDataSourceContext } from "@/app/data-processing/DataSubscriptionProvider";
import { ColumnName, DataArraysTyped } from "@/app/data-processing/datatypes";

interface LineChartLightningProps {
    keyName: ColumnName;
}
export default function LineChartLightning({ keyName }: LineChartLightningProps) {
    const id = useId();
    const lc = useContext(LightningChartsContext);
    const { subscribeReset, subscribeLatestArraysTyped, subscribeViewEdges } = useDataSourceContext();
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

        const detach1 = subscribeReset(() => {
            lineSeries.clear();
        });
        const detach2 = subscribeViewEdges((left: number, right: number) => {
            lineSeries.axisX.setInterval({ start: left, end: right + 1 });
        });
        const detach3 = subscribeLatestArraysTyped((latest: DataArraysTyped) => {
            lineSeries.appendSamples({
                xValues: latest["Seconds"]!,
                yValues: latest[keyName]!,
            });
        });
        return () => {
            detach1();
            detach2();
            detach3();
        };
    }, [id, lc]);

    // useEffect(() => {
    //     if (!chartState || chartState.chart.isDisposed()) {
    //         return;
    //     }
    //     const { lineSeries } = chartState;
    //     lineSeries.appendSamples({
    //         xValues: Array.from({ length: 1000000 }, (_, i) => i as number),
    //         yValues: Array.from({ length: 1000000 }, (_, i) => Math.random() * i * i),
    //     });
    //     console.log("appendSamples lkasdjflkasjdfkl");
    // }, [data]);

    return <div id={id} ref={containerRef} style={{ width: "100%", height: "100%" }}></div>;
}
