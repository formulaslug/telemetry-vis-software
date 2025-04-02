"use client";
import React, { useContext, useEffect, useId, useRef } from "react";
import {
    emptyFill,
    AxisScrollStrategies,
    synchronizeAxisIntervals,
    SolveResultSampleXY,
    CursorTargetChangedEvent,
    AxisXYUserInteractions,
    AxisTickStrategies,
    SolidFill,
    FontSettings,
    PointLineAreaSeries,
    LegendBoxBuilders,
    UIDraggingModes,
    UIOrigins,
    Axis,
} from "@lightningchart/lcjs";
import { LightningChartsContext } from "./GlobalContext";
import globalTheme from "./GlobalTheme";
import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";
import {
    ColumnName,
    DataArraysTyped,
    MAX_DATA_ROWS,
    timeColumnName,
} from "@/app/data-processing/datatypes";
import DataSourceType from "@/models/DataSourceType";

type AxisInfo = {
    columnNames: ColumnName[];
    label?: string;
    units?: string;
};

interface StackedLineChartInternalProps {
    yAxesInfo: AxisInfo[];
    xAxisInfo: AxisInfo;

    title?: string;
}
export default function StackedLineChartInternal({
    yAxesInfo,
    xAxisInfo,
    title = yAxesInfo.map((a) => a.label).join(", "),
}: StackedLineChartInternalProps) {
    const id = useId();
    const {
        subscribeDataSource,
        subscribeIsTimelineSynced,
        subscribeViewInterval,
        subscribeReset,
        subscribeLatestArrays,
        setCursor,
        setViewInterval,
        viewIntervalRef,
        dataSourceRef,
        dataArraysRef,
        isTimelineSyncedRef,
        numRowsRef,
        setIsTimelineSynced,
    } = useDataMethods();
    const containerRef = useRef(null);
    const lc = useContext(LightningChartsContext);

    if (xAxisInfo.columnNames.length > 1) console.error("xAxis can only have one column name");

    useEffect(() => {
        if (!containerRef.current || !lc) return;

        // based on https://lightningchart.com/js-charts/docs/features/axis/#stacked-axes

        let chart = lc.ChartXY({ container: containerRef.current, theme: globalTheme });
        // Remove the default y axis (we add ours below)
        chart.yAxis.dispose();

        // List of objects containing Y Axes and their respective
        // columns-to-lineseries mappings (there can be multiple stacked yAxes,
        // and each on can have multiple series attached).
        let yAxisSeriesMapList: {
            axis: Axis;
            seriesMap: Record<ColumnName, PointLineAreaSeries>;
        }[] = [];
        for (const [i, axisInfo] of yAxesInfo.entries()) {
            const axisY = chart
                .addAxisY({ iStack: i })
                .setMargins(i > 0 ? 15 : 0, i < yAxesInfo.length - 1 ? 15 : 0);

            let lineSeriesMap = axisInfo.columnNames.reduce(
                (acc, colName) => {
                    acc[colName] = chart
                        .addPointLineAreaSeries({
                            dataPattern: "ProgressiveX",
                            dataStorage: Float32Array,
                            // allowInputModification: false
                            axisY,
                        })
                        .setName(colName)
                        .setMaxSampleCount({ max: MAX_DATA_ROWS, mode: "auto" })
                        .setAreaFillStyle(emptyFill);
                    // Populate with already available data if there is any
                    if (numRowsRef.current > 0) {
                        acc[colName].setSamples({
                            xValues: dataArraysRef.current[xAxisInfo.columnNames[0]]!,
                            yValues: dataArraysRef.current[colName]!,
                        });
                    }
                    return acc;
                },
                {} as Record<ColumnName, PointLineAreaSeries>,
            );
            yAxisSeriesMapList.push({ axis: axisY, seriesMap: lineSeriesMap });
        }

        // Adds a legend that always stays in the top left corner but is also draggable
        let legend = chart
            .addLegendBox(LegendBoxBuilders.VerticalLegendBox, chart.coordsRelative)
            .setOrigin(UIOrigins.LeftTop)
            .setMargin(10)
            .setDraggingMode(UIDraggingModes.draggable)
            .add(chart);
        chart.addEventListener("layoutchange", (event) => {
            legend.setPosition({
                x: event.margins.left,
                y: event.chartHeight - event.margins.top,
            });
        });

        chart.setTitle(title);

        chart
            .getDefaultAxisX()
            .setUnits(xAxisInfo.units)
            .setTitle(xAxisInfo.label ?? xAxisInfo.columnNames[0]);
        yAxesInfo.forEach((aInfo, i) =>
            yAxisSeriesMapList[i].axis
                .setUnits(aInfo.units)
                .setTitle(aInfo.label ?? aInfo.columnNames.join(", "))
                .setScrollStrategy(AxisScrollStrategies.fitting),
        );

        chart
            .getDefaultAxisX()
            .setScrollStrategy(
                isTimelineSyncedRef.current
                    ? AxisScrollStrategies.progressive
                    : AxisScrollStrategies.fitting,
            )
            .setDefaultInterval((state) => ({
                start: state.dataMin,
                end: state.dataMax,
                stopAxisAfter: dataSourceRef.current != DataSourceType.LIVE,
            }))
            .setIntervalRestrictions((state) => ({
                startMin: state.dataMin,
                endMax: state.dataMax,
            }));

        const defaultUserInteractions: Partial<AxisXYUserInteractions> = {
            // pan: {
            //     lmb: false,
            //     rmb: {},
            // },
            // zoom: {
            //     rmb: false,
            //     wheel: { mode: "toward-pointer" },
            // },
            // rectangleZoom: {
            //     lmb: {},
            //     rmb: false,
            //     stopScroll: true,
            // },
            // restoreDefault: { doubleClick: true },
        };

        // chart.setUserInteractions(defaultUserInteractions);

        // TODO: synchronizeAxisIntervals

        chart.getDefaultAxisX().addEventListener("intervalchange", ({ start, end }) => {
            // start/end are "axis coordinates" but chart.solveNearest() expects
            // "client coordinates". So first we translate between them.
            const xAxisCoordToClientCoord = (c: number) =>
                chart.translateCoordinate(
                    { x: c, y: 0 },
                    chart.coordsAxis,
                    chart.coordsClient,
                );
            const startClientCoords = xAxisCoordToClientCoord(start);
            const endClientCoords = xAxisCoordToClientCoord(end);

            // Ask the chart where the nearest points are to the client coords.
            // We simply get the first series of the first Y-axis and ask that.
            const series = Object.values(yAxisSeriesMapList[0].seriesMap)[0];
            const startSample = series.solveNearest(startClientCoords);
            const endSample = series.solveNearest(endClientCoords);

            if (startSample && endSample) {
                const dataIndexes: [left: number, right: number] = [
                    startSample.iSample,
                    endSample.iSample,
                ];

                // TODO: maybe only set the main viewInterval if we have pointer
                // focus and the viewWidth itself changed?
                // also, maybe chart.seriesBackground.addEventListener("") ?
                const [oldStart, oldEnd] = viewIntervalRef.current;
                if (!isTimelineSyncedRef.current || start - end == oldStart - oldEnd) {
                }
                setViewInterval(dataIndexes, `lcjs-${id}`);
            }
        });

        chart.getDefaultAxisX().addEventListener("stoppedchange", ({ isStopped }) => {
            chart.setUserInteractions({
                zoom: {
                    wheel: {
                        mode:
                            dataSourceRef.current == DataSourceType.LIVE && !isStopped
                                ? "keep-end"
                                : "toward-pointer",
                    },
                },
            });

            setIsTimelineSynced(!isStopped, "lcjs");
        });

        chart.addEventListener("cursortargetchange", (event) => {
            const { hit } = event as CursorTargetChangedEvent<SolveResultSampleXY>;

            // In live data mode, this will be replaced with the latest data row by dataProvider.
            // In recording mode, cursorRow should be valid only when there's a cursor hit, so we make it null here.
            setCursor(hit ? hit.iSample : null);
        });
        const unsub1 = subscribeViewInterval(([left, right], setterID) => {
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
            if (setterID === `lcjs-${id}` || setterID === "dataProvider") return;
            // console.log(
            //     "lcjs setting interval:",
            //     dataArraysRef.current[timeColumnName]![left],
            //     dataArraysRef.current[timeColumnName]![right - 1],
            //     numRowsRef.current,
            // );

            chart.getDefaultAxisX().setInterval({
                start: dataArraysRef.current[timeColumnName]![left],
                end: dataArraysRef.current[timeColumnName]![right - 1],
                stopAxisAfter: false,
                animate: false,
            });
        });
        const unsub2 = subscribeLatestArrays((latest: DataArraysTyped) => {
            for (const { seriesMap } of yAxisSeriesMapList) {
                for (const [colName, series] of Object.entries(seriesMap)) {
                    series.appendSamples({
                        xValues: latest[xAxisInfo.columnNames[0]]!,
                        yValues: latest[colName as ColumnName]!,
                    });
                }
            }
            // Object.entries(lineSeriesMap).forEach(([colName, lineSeries]) => {
            //     lineSeries.appendSamples({
            //         xValues: latest[xAxisColumn]!,
            //         yValues: latest[colName as ColumnName]!,
            //     });
            // });

            chart.getDefaultAxisX().setIntervalRestrictions((state) => ({
                startMin: state.dataMin,
                endMax: state.dataMax,
            }));
        });
        const unsub3 = subscribeReset(() => {
            yAxisSeriesMapList.forEach(({ seriesMap }) => {
                Object.values(seriesMap).forEach((s) => s.clear());
            });
        });
        const unsub4 = subscribeDataSource((dataSource: DataSourceType) => {
            if (dataSource == DataSourceType.NONE) {
                chart
                    .getAxes()
                    .forEach((a) =>
                        a.setTickStrategy(AxisTickStrategies.Numeric, (strategy) =>
                            strategy.setTickStyle((ticks) =>
                                ticks.setLabelFillStyle(emptyFill),
                            ),
                        ),
                    );
            } else {
                chart
                    .getAxes()
                    .forEach((a) =>
                        a.setTickStrategy(AxisTickStrategies.Numeric, (strategy) =>
                            strategy.setTickStyle((ticks) =>
                                ticks.setLabelFillStyle(new SolidFill()),
                            ),
                        ),
                    );

                if (dataSource == DataSourceType.LIVE) {
                    chart
                        .getDefaultAxisX()
                        .setScrollStrategy(AxisScrollStrategies.progressive);
                }
            }
        });
        const unsub5 = subscribeIsTimelineSynced(
            (isTimelineSynced: boolean, setterID: string) => {
                if (setterID === `lcjs-${id}`) return;
                chart.getDefaultAxisX().setStopped(!isTimelineSynced);
                chart.setUserInteractions({
                    zoom: {
                        wheel: { mode: isTimelineSynced ? "keep-end" : "toward-pointer" },
                    },
                });
            },
        );

        return () => {
            unsub1();
            unsub2();
            unsub3();
            unsub4();
            unsub5();
            chart.dispose();
            // @ts-ignore: for GC
            chart = undefined;
            yAxisSeriesMapList.forEach(({ seriesMap }) => {
                Object.values(seriesMap).forEach((series) => {
                    series.dispose();
                    // @ts-ignore: for GC
                    series = undefined;
                });
            });
        };
    }, [lc, xAxisInfo, yAxesInfo]);

    return <div id={id} ref={containerRef} className="w-[100%] h-[100%]"></div>;
}
