import {useState} from "react";

const ModalContainer = ({ children }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="flex modal-container bg-slate-700 rounded-3xl flex-1 m-4 h-40 border-4 border-slate-600 hover:bg-slate-800 duration-200 justify-center items-center">
            {/*<div className={"absolute"}>*/}
            {/*    <button onClick={() => setIsExpanded(true)}>*/}
            {/*        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrows-angle-expand" viewBox="0 0 16 16">*/}
            {/*            <path fill-rule="evenodd"*/}
            {/*                  d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707"/>*/}
            {/*        </svg>*/}
            {/*    </button>*/}
            {/*</div>*/}
            {/*<div className={"flex justify-center items-center"}>*/}
                {children}
            {/*</div>*/}
        </div>
    )
}

export default ModalContainer;