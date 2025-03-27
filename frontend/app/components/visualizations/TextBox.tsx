import { useDataMethods } from "@/app/data-processing/DataMethodsProvider";
import { ColumnName } from "@/app/data-processing/datatypes";
import { useEffect, useRef } from "react";

interface TextBoxProps {
    title?: string;
    keyName: ColumnName;
}

export default function TextBox(props: TextBoxProps) {
    const pRef = useRef<HTMLParagraphElement | null>(null);
    const { subscribeCursorRow } = useDataMethods();
    useEffect(() => {
        return subscribeCursorRow((cursorRow) => {
            if (pRef.current) {
                pRef.current.innerText = cursorRow?.[props.keyName]?.toFixed(2) ?? "Data not available";
            }
        });
    }, []);

    return <div className="p-4 m-4 bg-neutral-900 rounded-xl"> 
        <h2>{props.title}</h2>
        <p ref={pRef}></p>
    </div>
}
