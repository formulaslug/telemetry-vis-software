"use client";

import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useRef,
    useState,
} from "react";
import {
    ColumnName,
    columnNames,
    DataArrays,
    DataArraysTyped,
    DataValues,
    emptyDataArrays,
    nullDataArrays,
} from "./datatypes";
import { getRecording } from "./http";
import { closeWebSocketConnection, initWebSocketConnection } from "./websocket";
import { RecordBatch } from "apache-arrow";

type SubscriptionReset = () => void; // possibly remove in favor of additional arg?
type SubscriptionViewEdges = (left: number, right: number) => void;
type SubscriptionLatestArraysTyped = (latest: DataArraysTyped) => void;
type SubscriptionLatestArrays = (latest: DataArrays) => void;
type SubscriptionFullArrays = (latest: DataArrays) => void;
type SubscriptionViewableArrays = (latest: DataArrays) => void;
type SubscriptionCursorRow = (cursorRow: DataValues) => void;
type SubscriptionNumRows = (numRows: number) => void;

type Subscription =
    | SubscriptionReset
    | SubscriptionViewEdges
    | SubscriptionLatestArraysTyped
    | SubscriptionLatestArrays
    | SubscriptionFullArrays
    | SubscriptionViewableArrays
    | SubscriptionCursorRow
    | SubscriptionNumRows;

type DataSubscribers = {
    subscribeReset: (clbk: SubscriptionReset) => () => void;
    subscribeViewEdges: (clbk: SubscriptionViewEdges) => () => void;
    subscribeLatestArraysTyped: (clbk: SubscriptionLatestArraysTyped) => () => void;
    subscribeLatestArrays: (clbk: SubscriptionLatestArrays) => () => void;
    subscribeViewableArrays: (clbk: SubscriptionFullArrays) => () => void; // will probably be used by GPS?
    subscribeCursorRow: (clbk: SubscriptionCursorRow) => () => void;
    subscribeNumRows: (clbk: SubscriptionNumRows) => () => void;
};
type DataControllers = {
    // pos should be an *integer index* into the full list of rows
    setCursorPosition: (pos: number) => void;
    // left and right should be *integer indexes* into the full list of rows (inclusive)
    setViewEdges: (left: number, right: number) => void;
    reset: () => void;
    switchToLiveData: (setIsConnected?: Dispatch<SetStateAction<boolean>>) => void;
    switchToRecording: (filename: string) => void;
};
type DataMethods = DataSubscribers & DataControllers;

const DataSourceContext = createContext<DataMethods | null>(null);

export function DataSourceProvider({ children }: PropsWithChildren) {
    const fullArrays = useRef<DataArrays>(nullDataArrays()); // all data that we've recieved is stored
    const viewableArrays = useRef<DataArrays>(nullDataArrays()); // this is what's currently visible (rangeslider)

    const [numRows, setNumRows] = useState<number>(0);
    // const [viewEdges, setViewEdges] = useState<{ left: number; right: number } | null>(null);
    // const [cursorPosition, setCursorPosition] = useState<number | null>(null);
    // const [dataSourceType, setDataSourceType] = useState<DataSourceType>(DataSourceType.NONE);

    const subscriptionsReset = useRef<Set<SubscriptionReset>>(new Set());
    const subscriptionsViewEdges = useRef<Set<SubscriptionViewEdges>>(new Set());
    const subscriptionsLatestArraysTyped = useRef<Set<SubscriptionLatestArraysTyped>>(new Set()); // prettier-ignore
    const subscriptionsLatestArrays = useRef<Set<SubscriptionLatestArrays>>(new Set());
    const subscriptionsFullArrays = useRef<Set<SubscriptionFullArrays>>(new Set());
    const subscriptionsViewableArrays = useRef<Set<SubscriptionViewableArrays>>(new Set());
    const subscriptionsCursorRow = useRef<Set<SubscriptionCursorRow>>(new Set());
    const subscriptionsNumRows = useRef<Set<SubscriptionNumRows>>(new Set());

    const makeSubscriber =
        <T extends Subscription>(set: Set<T>) =>
        (clbk: T) => {
            set.add(clbk);
            return () => set.delete(clbk);
        };
    const subscribeReset = makeSubscriber(subscriptionsReset.current);
    const subscribeViewEdges = makeSubscriber(subscriptionsViewEdges.current);
    const subscribeLatestArraysTyped = makeSubscriber(subscriptionsLatestArraysTyped.current);
    const subscribeLatestArrays = makeSubscriber(subscriptionsLatestArrays.current);
    const subscribeViewableArrays = makeSubscriber(subscriptionsViewableArrays.current);
    const subscribeCursorRow = makeSubscriber(subscriptionsCursorRow.current);
    const subscribeNumRows = makeSubscriber(subscriptionsNumRows.current);

    const setCursorPosition = (pos: number) => {
        let row = {} as DataValues;
        for (let [k, v] of Object.entries(fullArrays.current)) {
            if (v) row[k as ColumnName] = v[pos];
        }
        subscriptionsCursorRow.current.forEach((s) => s(row));
    };
    const setViewEdges = (left: number, right: number) => {
        // todo: this is unoptimized (every time view edges changes we re-copy from fullArrays)
        viewableArrays.current = nullDataArrays();
        let arrays = {} as DataArrays;
        for (let [k, v] of Object.entries(fullArrays.current)) {
            if (v) arrays[k as ColumnName] = v.slice(left, right + 1);
        }
        viewableArrays.current = arrays;

        subscriptionsViewEdges.current.forEach((s) => s(left, right));
    };
    const reset = () => {
        fullArrays.current = nullDataArrays();
        viewableArrays.current = nullDataArrays();
        // setDataSourceType(DataSourceType.NONE);
        // todo: close any websocket connections?
        closeWebSocketConnection();

        subscriptionsReset.current.forEach((s) => s());
    };
    const switchToLiveData = (setIsConnected?: Dispatch<SetStateAction<boolean>>) => {
        fullArrays.current = nullDataArrays();
        viewableArrays.current = nullDataArrays();
        // setDataSourceType(DataSourceType.LIVE);

        // TODO: MAKE THIS USE WEBSOCKET STREAM's SCHEMA!!
        fullArrays.current = emptyDataArrays();
        viewableArrays.current = emptyDataArrays();

        const processRecordBatch = (batch: RecordBatch) => {
            let arraysTyped = {} as DataArraysTyped;
            // TODO: Actually use the schema of the incoming websocket stream!!
            // This assumes all columns are present (non-present should be null)
            for (const key of columnNames) {
                const vector = batch.getChild(key);
                if (vector) {
                    const arr = vector.toArray();
                    arraysTyped[key] = arr;
                    fullArrays.current[key]!.push(arr);
                    viewableArrays.current[key]!.push(arr);
                }
            }
            subscriptionsLatestArraysTyped.current.forEach((s) => s(arraysTyped));
            subscriptionsFullArrays.current.forEach((s) => s(fullArrays.current));

            setNumRows((prev) => prev + batch.numRows);
            subscriptionsNumRows.current.forEach((s) => s(numRows));
        };

        initWebSocketConnection(processRecordBatch, setIsConnected);
    };
    const switchToRecording = async (filename: string) => {
        fullArrays.current = nullDataArrays();
        viewableArrays.current = nullDataArrays();
        // setDataSourceType(DataSourceType.RECORDED);
        const table = await getRecording(filename);
    };

    const methods: DataMethods = {
        subscribeReset,
        subscribeViewEdges,
        subscribeLatestArraysTyped,
        subscribeLatestArrays,
        subscribeViewableArrays,
        subscribeCursorRow,
        subscribeNumRows,

        setCursorPosition,
        setViewEdges,
        reset,
        switchToLiveData,
        switchToRecording,
    };

    return <DataSourceContext.Provider value={methods}>{children}</DataSourceContext.Provider>;
}

export function useDataSourceContext() {
    const context = useContext(DataSourceContext);
    if (!context) {
        throw new Error(
            "useDataSubscriptionContext must be used within a DataSubscriptionProvider!",
        );
    }
    return context;
}
