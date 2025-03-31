"use client";

import {
    createContext,
    Dispatch,
    RefObject,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useMemo,
    useRef,
} from "react";
import {
    ColumnName,
    columnNames,
    DataArraysTyped,
    DataValues,
    emptyDataArraysTyped,
    MAX_DATA_ROWS,
    nullDataArraysTyped,
    timeColumnName,
} from "./datatypes";
import { getRecording } from "./http";
import { closeWebSocketConnection, initWebSocketConnection } from "./websocket";
import { RecordBatch } from "apache-arrow";
import DataSourceType from "@/models/DataSourceType";
import useDebounceCallbackGreedy from "../utils/useGreedyDebounce";

type SubscriptionReset = () => void; // possibly remove in favor of additional arg?
type SubscriptionViewInterval = (viewInterval: [left: number, right: number], setterID: string) => void; // prettier-ignore
type SubscriptionDataInterval = (dataInterval: [left: number, right: number]) => void;
type SubscriptionViewableArrays = (viewableArrays: DataArraysTyped) => void;
type SubscriptionLatestArrays = (latestArrays: DataArraysTyped) => void;
type SubscriptionCursorIndex = (cursorIndex: number | null) => void;
type SubscriptionCursorRow = (cursorRow: DataValues | null) => void;
type SubscriptionNumRows = (numRows: number) => void;
type SubscriptionDataSource = (dataSourceType: DataSourceType) => void;
type SubscriptionIsTimelineSynced = (isTimelineSynced: boolean, setterID: string) => void;

type Subscription =
    | SubscriptionReset
    | SubscriptionViewInterval
    | SubscriptionViewableArrays
    | SubscriptionLatestArrays
    | SubscriptionCursorIndex
    | SubscriptionCursorRow
    | SubscriptionNumRows
    | SubscriptionDataSource
    | SubscriptionIsTimelineSynced;

type DataSubscribers = {
    subscribeReset: (clbk: SubscriptionReset) => () => void;
    subscribeViewInterval: (clbk: SubscriptionViewInterval) => () => void;
    subscribeDataInterval: (clbk: SubscriptionDataInterval) => () => void;
    subscribeViewableArrays: (clbk: SubscriptionViewableArrays) => () => void;
    subscribeLatestArrays: (clbk: SubscriptionLatestArrays) => () => void;
    subscribeCursorIndex: (clbk: SubscriptionCursorIndex) => () => void;
    subscribeCursorRow: (clbk: SubscriptionCursorRow) => () => void;
    subscribeNumRows: (clbk: SubscriptionNumRows) => () => void;
    subscribeDataSource: (clbk: SubscriptionDataSource) => () => void;
    subscribeIsTimelineSynced: (clbk: SubscriptionIsTimelineSynced) => () => void;
};
type DataControllers = {
    setCursor: (samplesIndex: number | null, onlySetCursorRow?: boolean) => void;
    // *integer indexes* into dataArrays
    setViewInterval: (viewInterval: [left: number, right: number], setterID: string) => void;
    setIsTimelineSynced: (isTimelineSynced: boolean, setterID: string) => void;
    reset: () => void;

    switchToLiveData: (setIsConnected?: Dispatch<SetStateAction<boolean>>) => void;
    switchToRecording: (filename: string) => void;
};
type DataRefs = {
    dataArraysRef: RefObject<DataArraysTyped>;
    viewableArraysRef: RefObject<DataArraysTyped>;
    viewIntervalRef: RefObject<[left: number, right: number]>;
    numRowsRef: RefObject<number>;
    isTimelineSyncedRef: RefObject<boolean>;
    dataSourceRef: RefObject<DataSourceType>;
};
type DataMethods = DataSubscribers & DataControllers & DataRefs;

const DataMethodsContext = createContext<DataMethods | null>(null);

export function DataMethodsProvider({ children }: PropsWithChildren) {
    // Total number of rows of data currently present in dataArrays (so this does NOT exceed MAX_DATA_ROWS)
    const numRowsRef = useRef<number>(0);
    // All data that we've recieved is stored here
    const dataArraysRef = useRef<DataArraysTyped>(emptyDataArraysTyped(MAX_DATA_ROWS)); // hard limit of 10M rows
    // Currently visible data
    const viewableArraysRef = useRef<DataArraysTyped>(nullDataArraysTyped());
    // These are *integer indexes* into dataArrays/viewableArrays, INCLUSIVE.
    // 1000*10ms = 10s range default
    const viewIntervalRef = useRef<[left: number, right: number]>([0, 1000]); // only visible data
    const dataIntervalRef = useRef<[left: number, right: number]>([0, 1000]); // all data
    // Index into data of the current cursor position (or null if no
    // lightningcharts are currently open)
    const cursorIndexRef = useRef<number | null>(null); // to be set by a lcjs chart
    // The row of data at the current cursor index (or null if no
    // lightningcharts are currently open)
    const cursorRowRef = useRef<DataValues | null>(null);
    // The currently highlighted data column (i.e. series in lcjs or acc
    // segment), used solely for visual emphasis (todo)
    const highlightedColumnRef = useRef<ColumnName | null>(null);
    // true means that new data pushes viewEdges over so it stays on the right.
    // Any interaction with the timeline or lcjs zooming should set it to false.
    const isTimelineSyncedRef = useRef<boolean>(false);

    const dataSourceRef = useRef<DataSourceType>(DataSourceType.NONE);

    // Keep track of callbacks to call for each type of data when it arrives/changes
    const subscriptionsReset = useRef<Set<SubscriptionReset>>(new Set());
    const subscriptionsViewInterval = useRef<Set<SubscriptionViewInterval>>(new Set());
    const subscriptionsDataInterval = useRef<Set<SubscriptionDataInterval>>(new Set());
    const subscriptionsViewableArrays = useRef<Set<SubscriptionViewableArrays>>(new Set());
    const subscriptionsLatestArrays = useRef<Set<SubscriptionLatestArrays>>(new Set());
    const subscriptionsCursorIndex = useRef<Set<SubscriptionCursorIndex>>(new Set());
    const subscriptionsCursorRow = useRef<Set<SubscriptionCursorRow>>(new Set());
    const subscriptionsNumRows = useRef<Set<SubscriptionNumRows>>(new Set());
    const subscriptionsDataSource = useRef<Set<SubscriptionDataSource>>(new Set());
    const subscriptionsIsTimelineSynced = useRef<Set<SubscriptionIsTimelineSynced>>(new Set());

    // TODO: try going back to the old useMemo arrangement
    function makeSubscriber<T extends Subscription>(
        setRef: RefObject<Set<T>>,
        initialTriggerData?: RefObject<Parameters<T>[0] | null>,
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
    const subscribeViewInterval = makeSubscriber(subscriptionsViewInterval, viewIntervalRef); // prettier-ignore
    const subscribeDataInterval = makeSubscriber(subscriptionsDataInterval, dataIntervalRef); // prettier-ignore
    const subscribeViewableArrays = makeSubscriber(subscriptionsViewableArrays, viewableArraysRef); // prettier-ignore
    const subscribeLatestArrays = makeSubscriber(subscriptionsLatestArrays); // prettier-ignore
    const subscribeCursorIndex = makeSubscriber(subscriptionsCursorIndex, cursorIndexRef); // prettier-ignore
    const subscribeCursorRow = makeSubscriber(subscriptionsCursorRow, cursorRowRef);
    const subscribeNumRows = makeSubscriber(subscriptionsNumRows, numRowsRef);
    const subscribeDataSource = makeSubscriber(subscriptionsDataSource, dataSourceRef);
    const subscribeIsTimelineSynced = makeSubscriber(subscriptionsIsTimelineSynced, isTimelineSyncedRef); // prettier-ignore

    const setCursor = (sampleIndex: number | null, onlySetCursorRow?: boolean) => {
        if (!onlySetCursorRow) {
            cursorIndexRef.current = sampleIndex;
            subscriptionsCursorIndex.current.forEach((s) => s(cursorIndexRef.current));
        }

        if (sampleIndex) {
            let newCursorRow = {} as DataValues;
            for (const [name, arr] of Object.entries(dataArraysRef.current)) {
                if (arr) newCursorRow[name as ColumnName] = arr[sampleIndex];
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

        for (const [name, arr] of Object.entries(dataArraysRef.current)) {
            if (arr) {
                viewableArraysRef.current[name as ColumnName] = arr.subarray(left, right + 1);
            }
        }
        subscriptionsViewableArrays.current.forEach((s) => s(viewableArraysRef.current));

        viewIntervalRef.current = newViewInterval;
        subscriptionsViewInterval.current.forEach((s) => s(newViewInterval, setterID));
    };
    const setIsTimelineSynced = (isTimelineSynced: boolean, setterID: string) => {
        // isTimelineSynced only relevant in Live data mode. Default to false otherwise
        const isSynced = dataSourceRef.current == DataSourceType.LIVE && isTimelineSynced;

        isTimelineSyncedRef.current = isSynced;
        subscriptionsIsTimelineSynced.current.forEach((s) => s(isSynced, setterID));
        // console.log(isSynced, setterID, dataSourceRef.current);
    };
    const reset = () => {
        dataArraysRef.current = emptyDataArraysTyped(MAX_DATA_ROWS);
        viewableArraysRef.current = nullDataArraysTyped();
        dataSourceRef.current = DataSourceType.NONE;
        cursorIndexRef.current = null;
        cursorRowRef.current = null;

        closeWebSocketConnection();

        subscriptionsReset.current.forEach((s) => s());
    };

    const switchToLiveData = (setIsConnected?: Dispatch<SetStateAction<boolean>>) => {
        reset();

        const processRecordBatch = (batch: RecordBatch) => {
            // If we're near the limit of dataRows, move everything back by
            // 1% of the max length and set the rest to 0.
            if (
                numRowsRef.current >=
                dataArraysRef.current[timeColumnName]!.length - MAX_DATA_ROWS * 0.01
            ) {
                // TODO: FINISH
                for (const [name, dataArr] of Object.entries(dataArraysRef.current)) {
                    if (dataArr) {
                        // dataArr.set(dataArr.subarray(0));
                    }
                }
            }

            let arraysTyped = {} as DataArraysTyped;
            // TODO: Make this actually use the schema of the incoming
            // websocket stream!!! This assumes all columns are present
            // (non-present should be null)
            for (const key of columnNames) {
                const vector = batch.getChild(key);
                if (vector) {
                    const arr = vector.toArray();
                    arraysTyped[key] = arr;
                }
            }
            for (const key of Object.keys(arraysTyped) as ColumnName[]) {
                dataArraysRef.current[key]!.set(arraysTyped[key]!, numRowsRef.current + 1);
            }

            subscriptionsLatestArrays.current.forEach((s) => s(arraysTyped));
            // subscriptionsViewableArrays.current.forEach((s) => s(viewableArrays.current));

            numRowsRef.current += batch.numRows;
            subscriptionsNumRows.current.forEach((s) => s(numRowsRef.current));

            // NOTE: Previously, when we used timestamps for intervals, we
            // passed decimal timestamps into setViewInterval() and
            // dataSet.readBack() would do the math to convert them into
            // indexes internally. This way, we could ensure that the exact
            // width of the currently viewable data was consistent when new
            // data came in (with was always start-end timestamp). Now
            // however, we use indexes, so we're vulnerable to different
            // pairs of rows having different time deltas between them.
            // Instead of writing an algorithm to solve this, we will just
            // assume the precondition that *all rows of data are
            // equidistant from each other temporally.* This way we can
            // assume that shifting a viewInterval to the right by n indexes
            // maintians the same amount of visible data.
            // If the timeline is not in "sync mode", we don't bother
            // changing the viewInterval when new data arrives.
            const timeCol = dataArraysRef.current[timeColumnName]!;
            if (isTimelineSyncedRef) {
                const numRowsViewable =
                    viewIntervalRef.current[1] - viewIntervalRef.current[0];

                const left = numRowsRef.current - numRowsViewable;
                const right = numRowsRef.current;
                setViewInterval([left, right], "dataProvider");
            }
            subscriptionsDataInterval.current.forEach((s) =>
                s([timeCol[0], timeCol[timeCol.length - 1]]),
            );

            // If none of the charts/visualizations are dictating where the
            // cursor index is, we just default the cursorRow to be the
            // latest row.
            if (!cursorIndexRef.current) {
                setCursor(viewIntervalRef.current[1], true);
            }
        };

        initWebSocketConnection(processRecordBatch, setIsConnected);
        dataSourceRef.current = DataSourceType.LIVE;
        subscriptionsDataSource.current.forEach((s) => s(DataSourceType.LIVE));
        setIsTimelineSynced(true, "dataProvider");
    };
    const switchToRecording = async (filename: string) => {
        reset();

        const table = await getRecording(filename);
        let arraysTyped = {} as DataArraysTyped;
        // TODO: Make this actually use the schema of the incoming
        // websocket stream!!! This assumes all columns are present
        // (non-present should be null)
        for (const key of columnNames) {
            const vector = table.getChild(key);
            if (vector) {
                const arr = vector.toArray();
                arraysTyped[key] = arr;
            }
        }
        // some basic manual data processing. TODO: make somthing extremely
        // generic / extensible for arbitrary data processing
        arraysTyped.VDM_GPS_Latitude = arraysTyped.VDM_GPS_Latitude!.map((n) =>
            n == 0.0 ? NaN : n,
        );
        arraysTyped.VDM_GPS_Longitude = arraysTyped.VDM_GPS_Longitude!.map((n) =>
            n == 0.0 ? NaN : n,
        );

        numRowsRef.current = table.numRows;
        subscriptionsNumRows.current.forEach((s) => s(numRowsRef.current));

        dataArraysRef.current = arraysTyped;
        subscriptionsLatestArrays.current.forEach((s) => s(dataArraysRef.current));

        dataIntervalRef.current = [0, numRowsRef.current - 1];
        subscriptionsDataInterval.current.forEach((s) => s(dataIntervalRef.current));

        setViewInterval([0, numRowsRef.current], "dataProvider");

        dataSourceRef.current = DataSourceType.RECORDED;
        subscriptionsDataSource.current.forEach((s) => s(DataSourceType.RECORDED));

        isTimelineSyncedRef.current = false;
        subscriptionsIsTimelineSynced.current.forEach((s) => s(false, "dataProvider"));
    };

    const methods: DataMethods = useMemo(() => {
        return {
            // Subscribers
            subscribeReset,
            subscribeViewInterval,
            subscribeDataInterval,
            subscribeViewableArrays,
            subscribeLatestArrays,
            subscribeCursorIndex,
            subscribeCursorRow,
            subscribeNumRows,
            subscribeDataSource,
            subscribeIsTimelineSynced,

            // Controllers
            setCursor,
            setViewInterval,
            setIsTimelineSynced,
            reset,
            switchToLiveData,
            switchToRecording,

            // Refs
            dataArraysRef,
            viewableArraysRef,
            viewIntervalRef,
            numRowsRef,
            isTimelineSyncedRef,
            dataSourceRef,
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
