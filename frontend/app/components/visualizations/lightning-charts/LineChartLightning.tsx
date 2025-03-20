"use client";
import React, { useContext, useEffect, useId, useRef, useState } from "react";
import {
    emptyFill,
    PointLineAreaSeries,
    ChartXY,
    AxisScrollStrategies,
    synchronizeAxisIntervals,
} from "@lightningchart/lcjs";
import { LightningChartsContext } from "./GlobalContext";
import globalTheme from "./GlobalTheme";
import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";
import { ColumnName, DataArraysTyped } from "@/app/data-processing/datatypes";

interface LineChartLightningProps {
    keyName: ColumnName;
}
export default function LineChartLightning({ keyName }: LineChartLightningProps) {
    const id = useId();
    const lc = useContext(LightningChartsContext);
    const {
        subscribeReset,
        subscribeLatestArraysTyped,
        subscribeViewEdges,
        getFullArraysRef,
        setCursorTimestamp,
        setViewEdges,
    } = useDataMethods();
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

        setChartState({ chart, lineSeries });
        chart
            .getDefaultAxisX()
            .setScrollStrategy(AxisScrollStrategies.progressive)
            .setUserInteractions({
                pan: {
                    lmb: { drag: {} },
                    rmb: {},
                },
                zoom: {
                    lmb: {},
                    rmb: { drag: {} },
                    wheel: {},
                },
                restoreDefault: { doubleClick: true },
            });

        // TODO: synchronizeAxisIntervals

        chart.getDefaultAxisX().addEventListener("intervalchange", ({ start, end }) => {
            // TODO: maybe only set the main viewEdges interval if we have
            // pointer focus and the viewWidth itself changed?

            // setViewEdges([start, end], "lcjs");
            // setCursorTimestamp(end); // assume cursor is always latest / far right
        });

        const fullDataRef = getFullArraysRef();

        const unsub1 = subscribeReset(() => {
            lineSeries.clear();
        });
        const unsub2 = subscribeViewEdges(([left, right], setterID) => {
            // console.log( // intervals
            //     "ours:", 
            //     left,
            //     right,
            //     "lcs:",
            //     lineSeries.axisX.getInterval().start,
            //     lineSeries.axisX.getInterval().end,
            // );
            // ATM we simply ignore updates to viewEdges from dataProvider
            // because lcjs automatically updates its interval on data changes
            if (setterID === "lcjs" || setterID === "dataProvider") return;
            lineSeries.axisX.setInterval({
                start: left,
                end: right,
                stopAxisAfter: false,
            });
            // lineSeries.axisX.setIntervalRestrictions({ startMin: left, endMax: right + 1 });
        });
        const unsub3 = subscribeLatestArraysTyped((latest: DataArraysTyped) => {
            lineSeries.appendSamples({
                xValues: latest[":Time"]!,
                yValues: latest[keyName]!,
            });
        });

        // Populate already avaiable data. We do this after subscribing because
        // viewEdges will be automatically populated if there's already data
        // avaiable, and we want that set first before rendering all of fullData
        // to avoid jarring jumps/flashes
        lineSeries.appendSamples({
            xValues: fullDataRef.current[":Time"] ?? [],
            yValues: fullDataRef.current[keyName] ?? [],
        });

        return () => {
            unsub1();
            unsub2();
            unsub3();
        };
    }, [id, lc]); // todo: is having `id` here necessary?

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

    return <div id={id} ref={containerRef} className="w-[100%] h-[100%]"></div>;
}
