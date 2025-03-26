"use client";

import {
    createContext,
    Dispatch,
    MutableRefObject,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useMemo,
    useRef,
} from "react";
import {
    ColumnName,
    columnNames,
    DataArrays,
    DataArraysTyped,
    DataRow,
    DataSetsXY,
    DataValues,
    emptyDataArrays,
    emptyDataArraysTyped,
    emptyDataSets,
    nullDataArrays,
    nullDataArraysTyped,
    nullDataValues,
    timeColumnName,
} from "./datatypes";
import { getRecording } from "./http";
import { closeWebSocketConnection, initWebSocketConnection } from "./websocket";
import { RecordBatch } from "apache-arrow";
import DataSourceType from "@/models/DataSourceType";
import { FloatArray } from "apache-arrow/type";
import useDebounceCallbackGreedy from "../utils/useGreedyDebounce";

type SubscriptionReset = () => void; // possibly remove in favor of additional arg?
type SubscriptionViewInterval = (viewInterval: [left: number, right: number], setterID: string) => void; // prettier-ignore
type SubscriptionDataInterval = (dataInterval: [left: number, right: number]) => void;
type SubscriptionViewableArrays = (viewableArrays: DataArraysTyped) => void;
type SubscriptionCursorTimestamp = (cursorTimestamp: number | null) => void;
type SubscriptionCursorRow = (cursorRow: DataValues | null) => void;
type SubscriptionNumRows = (numRows: number) => void;
type SubscriptionDataSource = (dataSourceType: DataSourceType) => void;
type SubscriptionIsTimelineSynced = (isTimelineSynced: boolean) => void;

type Subscription =
    | SubscriptionReset
    | SubscriptionViewInterval
    | SubscriptionViewableArrays
    | SubscriptionCursorTimestamp
    | SubscriptionCursorRow
    | SubscriptionNumRows
    | SubscriptionDataSource
    | SubscriptionIsTimelineSynced;

type DataSubscribers = {
    subscribeReset: (clbk: SubscriptionReset) => () => void;
    subscribeViewInterval: (clbk: SubscriptionViewInterval) => () => void;
    subscribeDataInterval: (clbk: SubscriptionDataInterval) => () => void;
    subscribeViewableArrays: (clbk: SubscriptionViewableArrays) => () => void;
    subscribeCursorTimestamp: (clbk: SubscriptionCursorTimestamp) => () => void;
    subscribeCursorRow: (clbk: SubscriptionCursorRow) => () => void;
    subscribeNumRows: (clbk: SubscriptionNumRows) => () => void;
    subscribeDataSource: (clbk: SubscriptionDataSource) => () => void;
    subscribeIsTimelineSynced: (clbk: SubscriptionIsTimelineSynced) => () => void;
};
type DataControllers = {
    // timestamp should be an *decimal timestamp*
    setCursor: (sampleIndex: number | null) => void;
    // *decimal timestamps* referring to *seconds* since car started
    setViewInterval: (viewInterval: [left: number, right: number], setterID: string) => void;
    reset: () => void;
    setIsTimelineSynced: (isTimelineSynced: boolean) => void;

    switchToLiveData: (setIsConnected?: Dispatch<SetStateAction<boolean>>) => void;
    switchToRecording: (filename: string) => void;
};
type DataRefs = {
    dataSetsRef: MutableRefObject<DataSetsXY>;
    viewableArraysRef: MutableRefObject<DataArraysTyped>;
    viewIntervalRef: MutableRefObject<[left: number, right: number]>;
    numRowsRef: MutableRefObject<number>;
    isTimelineSyncedRef: MutableRefObject<boolean>;
};
type DataMethods = DataSubscribers & DataControllers & DataRefs;

const DataMethodsContext = createContext<DataMethods | null>(null);

export function DataMethodsProvider({ children }: PropsWithChildren) {
    // All data that we've recieved is stored here
    const dataSetsRef = useRef<DataSetsXY>(emptyDataSets());
    // Length of each dataSet (currently each is same length; subject to change)
    const numRowsRef = useRef<number>(0);
    // Data that's currently visible
    const viewableArraysRef = useRef<DataArraysTyped>(emptyDataArraysTyped(10));
    // These are *decimal timestamps* referring to *seconds* since car started
    const viewIntervalRef = useRef<[left: number, right: number]>([0, 10]); // only visible data
    const dataIntervalRef = useRef<[left: number, right: number]>([0, 10]); // all data
    // Timestamp value of current cursor position (or null if no
    // lightningcharts are currently open)
    const cursorTimestampRef = useRef<number | null>(null); // to be set by a lcjs chart
    // The nearest row of data to the current cursor timestamp (or null if no
    // lightningcharts are currently open)
    const cursorRowRef = useRef<DataValues | null>(null);
    // The currently highlighted data column (i.e. series in lcjs or acc
    // segment), used solely for visual emphasis (todo)
    const highlightedColumnRef = useRef<ColumnName | null>(null);
    // true means that new data pushes viewEdges over so it stays on the right.
    // Any interaction with the timeline or lcjs zooming should set it to false.
    const isTimelineSyncedRef = useRef<boolean>(true);

    const dataSourceRef = useRef<DataSourceType>(DataSourceType.NONE);

    // Keep track of callbacks to call for each type of data when it arrives/changes
    const subscriptionsReset = useRef<Set<SubscriptionReset>>(new Set());
    const subscriptionsViewInterval = useRef<Set<SubscriptionViewInterval>>(new Set());
    const subscriptionsDataInterval = useRef<Set<SubscriptionDataInterval>>(new Set());
    const subscriptionsViewableArrays = useRef<Set<SubscriptionViewableArrays>>(new Set());
    const subscriptionsCursorTimestamp = useRef<Set<SubscriptionCursorTimestamp>>(new Set());
    const subscriptionsCursorRow = useRef<Set<SubscriptionCursorRow>>(new Set());
    const subscriptionsNumRows = useRef<Set<SubscriptionNumRows>>(new Set());
    const subscriptionsDataSource = useRef<Set<SubscriptionDataSource>>(new Set());
    const subscriptionsIsTimelineSynced = useRef<Set<SubscriptionIsTimelineSynced>>(new Set());

    // TODO: try going back to the old useMemo arrangement
    const methods: DataMethods = useMemo(() => {
        function makeSubscriber<T extends Subscription>(
            setRef: MutableRefObject<Set<T>>,
            initialTriggerData?: MutableRefObject<Parameters<T>[0] | null>,
        ) {
            return (clbk: T) => {
                setRef.current.add(clbk);
                // If the subscriber specified this capability and the data is
                // already available, make an initial call to the subscription
                // callback with the already available data so that the
                // subscriber doesn't need to wait until the data changes again
                if (initialTriggerData && initialTriggerData.current != null) {
                    // @ts-ignore: the union of multiple functions doesn't
                    // accept calls with only one function's parameters :/
                    // We trust ourselves to set it up correctly below
                    clbk(initialTriggerData.current);
                }
                return () => setRef.current.delete(clbk);
            };
        }

        const subscribeReset = makeSubscriber(subscriptionsReset);
        const subscribeViewInterval = makeSubscriber(
            subscriptionsViewInterval,
            viewIntervalRef,
        );
        const subscribeDataInterval = makeSubscriber(
            subscriptionsDataInterval,
            dataIntervalRef,
        );
        const subscribeViewableArrays = makeSubscriber(subscriptionsViewableArrays, viewableArraysRef); // prettier-ignore
        const subscribeCursorTimestamp = makeSubscriber(subscriptionsCursorTimestamp, cursorTimestampRef); // prettier-ignore
        const subscribeCursorRow = makeSubscriber(subscriptionsCursorRow, cursorRowRef);
        const subscribeNumRows = makeSubscriber(subscriptionsNumRows, numRowsRef);
        const subscribeDataSource = makeSubscriber(subscriptionsDataSource, dataSourceRef);
        const subscribeIsTimelineSynced = makeSubscriber(subscriptionsIsTimelineSynced, isTimelineSyncedRef); // prettier-ignore

        const setCursor = (sampleIndex: number | null, ignoreTimestamp?: boolean) => {
            if (!ignoreTimestamp) {
                cursorTimestampRef.current = sampleIndex
                    ? viewableArraysRef.current[timeColumnName]![sampleIndex]
                    : null;
                subscriptionsCursorTimestamp.current.forEach((s) =>
                    s(cursorTimestampRef.current),
                );
            }

            if (sampleIndex) {
                let newCursorRow = {} as DataValues;
                for (const [name, arr] of Object.entries(viewableArraysRef.current).filter(
                    ([_, a]) => a !== null,
                )) {
                    newCursorRow[name as ColumnName] = arr![sampleIndex];
                }

                cursorRowRef.current = newCursorRow;
                subscriptionsCursorRow.current.forEach((s) => s(newCursorRow));
            } else {
                cursorRowRef.current = null;
                subscriptionsCursorRow.current.forEach((s) => s(cursorRowRef.current));
            }
        };
        const setViewInterval = (
            newViewInterval: [left: number, right: number],
            setterID: string,
        ) => {
            const [left, right] = newViewInterval;
            console.log(left, right);
            
            for (const [name, dataSet] of Object.entries(dataSetsRef.current).filter(
                ([_, ds]) => ds !== null,
            )) {
                // TODO: consider replacing viewableArrays with typed arrays
                viewableArraysRef.current[name as ColumnName] = dataSet!.readBack({
                    onlyInRange: { start: left, end: right },
                }).yValues as FloatArray;
            }
            subscriptionsViewableArrays.current.forEach((s) => s(viewableArraysRef.current));

            viewIntervalRef.current = newViewInterval;
            subscriptionsViewInterval.current.forEach((s) => s(newViewInterval, setterID));
        };
        const reset = () => {
            for (const [_, dataSet] of Object.entries(dataSetsRef.current)) {
                if (dataSet) dataSet.clear();
            }
            viewableArraysRef.current = nullDataArraysTyped();
            dataSourceRef.current = DataSourceType.NONE;
            cursorTimestampRef.current = null;
            cursorRowRef.current = null;

            closeWebSocketConnection();

            subscriptionsReset.current.forEach((s) => s());
        };
        const setIsTimelineSynced = (isTimelineSynced: boolean) => {
            isTimelineSyncedRef.current = isTimelineSynced;
        };

        const switchToLiveData = (setIsConnected?: Dispatch<SetStateAction<boolean>>) => {
            reset();

            // TODO: MAKE THIS USE WEBSOCKET STREAM's SCHEMA!!
            viewableArraysRef.current = emptyDataArraysTyped(0);

            const processRecordBatch = (batch: RecordBatch) => {
                let arraysTyped = {} as DataArraysTyped;
                // TODO: Actually use the schema of the incoming websocket stream!!
                // This assumes all columns are present (non-present should be null)
                for (const key of columnNames) {
                    const vector = batch.getChild(key);
                    if (vector) {
                        const arr = vector.toArray();
                        arraysTyped[key] = arr;
                        // fullArrays.current[key]!.push(arr);
                        // viewableArrays.current[key]!.push(arr);
                    }
                }
                for (const key of Object.keys(arraysTyped) as ColumnName[]) {
                    dataSetsRef.current[key]!.appendSamples({
                        xValues: arraysTyped[timeColumnName]!,
                        yValues: arraysTyped[key]!,
                    });
                }

                // subscriptionsLatestArraysTyped.current.forEach((s) => s(arraysTyped));
                // // subscriptionsLatestArrays.current.forEach((s) => s(arrays));
                // subscriptionsFullArrays.current.forEach((s) => s(fullArrays.current));
                // subscriptionsViewableArrays.current.forEach((s) => s(viewableArrays.current));

                numRowsRef.current += batch.numRows;
                subscriptionsNumRows.current.forEach((s) => s(numRowsRef.current));

                // TODO: Note that the solveNearest functionality is part of
                // PointLineAreaSeries which is exclusively tied to ChartXY.
                // So, we will simply not support having a cursor and cursorRow
                // unless there is a ChartXY in view (multiple charts will be
                // all be synchronized so it's equivalent to no-cursor or
                // one-cursor). However, we _will_ still support having
                // viewEdges / viewWidth, because DataSetXY supports readBack
                // with a range, and that range DOES support taking in decimal
                // values of the dataset and calculating the range for us.

                // When new data arrives, if we the timeline is in "synced
                // mode", we shift over the viewWidth by setting start/end to
                // have the same width as before but now ending at the latest
                // timestamp
                const timeCol = dataSetsRef.current[timeColumnName]!.readBack().yValues;
                if (isTimelineSyncedRef) {
                    const viewWidth = viewIntervalRef.current[1] - viewIntervalRef.current[0];
                    
                    const left = timeCol[timeCol.length - 1];
                    const right = timeCol[timeCol.length - 1] - viewWidth;
                    setViewInterval([left, right], "dataProvider");
                }
                subscriptionsDataInterval.current.forEach((s) =>
                    s([timeCol[0], timeCol[timeCol.length - 1]]),
                );

                // If one of the charts/visualizations isn't dictating where the
                // cursor timestamp is, we just default the cursorRow to be the
                // latest row.
                if (!cursorTimestampRef.current) {
                    setCursor(dataSetsRef.current[timeColumnName].getSampleCount() - 1, true);
                }
            };

            initWebSocketConnection(processRecordBatch, setIsConnected);
            dataSourceRef.current = DataSourceType.LIVE;
            subscriptionsDataSource.current.forEach((s) => s(DataSourceType.LIVE));
        };
        const switchToRecording = async (filename: string) => {
            reset();

            const table = await getRecording(filename);

            dataSourceRef.current = DataSourceType.RECORDED;
            subscriptionsDataSource.current.forEach((s) => s(DataSourceType.RECORDED));
        };

        return {
            // Subscribers
            subscribeReset,
            subscribeViewInterval,
            subscribeDataInterval,
            subscribeViewableArrays,
            subscribeCursorTimestamp,
            subscribeCursorRow,
            subscribeNumRows,
            subscribeDataSource,
            subscribeIsTimelineSynced,

            // Controllers
            setCursor,
            setViewInterval,
            reset,
            setIsTimelineSynced,
            switchToLiveData,
            switchToRecording,

            // Refs
            dataSetsRef,
            viewableArraysRef,
            viewIntervalRef,
            numRowsRef,
            isTimelineSyncedRef,
        };
    }, []);

    // const methods: DataMethods = useMemo(
    //     () => (),
    //     [],
    // );

    return (
        <DataMethodsContext.Provider value={methods}>{children}</DataMethodsContext.Provider>
    );
}

export function useDataMethods() {
    const context = useContext(DataMethodsContext);
    if (!context) {
        throw new Error("useDataMethods must be used within a DataSubscriptionProvider!");
    }
    return context;
}
