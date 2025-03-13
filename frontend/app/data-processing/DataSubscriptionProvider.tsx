import { TypedArray } from "apache-arrow/interfaces";
import { createContext, PropsWithChildren, useContext, useRef } from "react";
import { DataArrays, DataArraysTyped } from "./datatypes";

type SubscriptionReset = () => void; // possibly remove in favor of additional arg?
type SubscriptionLatestArraysTyped = (latest: DataArraysTyped) => void;
type SubscriptionLatestArrays = (latest: DataArrays) => void;
type SubscriptionFullArrays = (latest: DataArrays) => void;
type SubscriptionCursorRow = (cursorRow: number) => void;
type SubscriptionNumRows = (numRows: number) => void;

type Subscription =
    | SubscriptionReset
    | SubscriptionLatestArraysTyped
    | SubscriptionLatestArrays
    | SubscriptionFullArrays
    | SubscriptionCursorRow
    | SubscriptionNumRows;

type DataSubscribers = {
    subscribeReset: (clbk: SubscriptionReset) => () => void;
    subscribeLatestArraysTyped: (clbk: SubscriptionLatestArraysTyped) => () => void;
    subscribeLatestArrays: (clbk: SubscriptionLatestArrays) => () => void;
    subscribeFullArrays: (clbk: SubscriptionFullArrays) => () => void;
    subscribeCursorRow: (clbk: SubscriptionCursorRow) => () => void;
    subscribeNumRows: (clbk: SubscriptionNumRows) => () => void;
};
const DataSubscriptionContext = createContext<DataSubscribers | null>(null);

export function DataSubscriptionProvider({ children }: PropsWithChildren) {
    const subscriptions = useRef<Set<Subscription>>();

    const genericSubscriber = (clbk: Subscription) => {
        subscriptions.current?.add(clbk);
        return () => {
            subscriptions.current?.delete(clbk);
        };
    };

    // TODO(jack): Instead of making a generic subscriber and switching on
    // subscription type during data processing, acknowledge that different
    // subscriptions change at different times and just start bringing in that
    // logic here. Create a different subscriber function for each type.
    // Also, in order to implement the mantine RangedSlider, expose a function
    // for seting cursor position and track that here? Maybe differentiate
    // between currently viewed numRows and fully available numRows?
    subscriptions.current?.forEach((s) => {
        switch (s) {
        }
    });

    return (
        <DataSubscriptionContext.Provider value={}>
            {children}
        </DataSubscriptionContext.Provider>
    );
}

export function switchToLiveData() {
    
}

export function switchToRecording(filename: string) {
    
}

export function useDataSubscription() {
    const context = useContext(DataSubscriptionContext);
    if (!context) {
        throw new Error(
            "useDataSubscriptionContext must be used within a DataSubscriptionProvider!",
        );
    }
    return context;
}
