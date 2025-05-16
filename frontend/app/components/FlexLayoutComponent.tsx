import { Actions, Layout, Model, TabNode } from "flexlayout-react";
import { CornersOut, X } from "@phosphor-icons/react";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { visualizations } from "./visualizations/Visualizations";
import { useFlexLayout } from "../FlexLayoutProvider";

// export type UpdateNodeConfig<T> = (config: T) => void;
export interface VisualizationProps<Config extends Record<string, any>> {
    useSavedState: <K extends keyof Config>(
        key: K,
        initialValue: Config[K]
    ) => [Config[K], Dispatch<Config[K]>];
}

export default function FlexLayoutComponent() {
    let [layoutModel, setLayoutModel] = useFlexLayout();

    function factory(node: TabNode) {
        const componentName =
            (node.getComponent() as keyof typeof visualizations) ?? "skeleton";

        const componentConfig = node.getConfig() ?? {};

        function useSavedState<T>(path: keyof any, initialValue: T): [T, Dispatch<T>] {
            const [state, setState] = useState<T>(componentConfig[path] ?? initialValue);

            // TODO: is this running too many times? idk about this function nesting
            const setStateAndSave = useCallback((newValue: T) => {
                setState(newValue);
                layoutModel.doAction(
                    Actions.updateNodeAttributes(node.getId(), {
                        config: { [path]: newValue },
                    })
                );
            }, []);

            // console.log(model.toJson());

            return [state, setStateAndSave];
        }

        const Component = visualizations[componentName];
        return <Component useSavedState={useSavedState} />;
    }

    if (!layoutModel) {
        return <></>;
    }

    return (
        <Layout
            realtimeResize={true}
            model={layoutModel}
            factory={factory}
            icons={{
                close: <X color="gray" weight="bold" />,
                maximize: <CornersOut color="gray" weight="bold" />,
            }}
        />
    );
}
