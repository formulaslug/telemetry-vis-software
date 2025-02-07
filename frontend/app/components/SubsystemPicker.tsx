import React from "react";

interface SubsystemPickerProps {
    subsystems: string[];
    selectedSubsystem: number;
    onSelectSubsystem: (index: number) => void;
}
const SubsystemPicker = ({
    subsystems,
    selectedSubsystem,
    onSelectSubsystem,
}: SubsystemPickerProps) => {
    return (
        <div className={"flex flex-row justify-between w-3/4 md:w-[40%]"}>
            {subsystems.map((subsystem, index) => {
                return (
                    <button
                        key={index}
                        onClick={() => onSelectSubsystem(index)}
                        className={`py-2 px-4 text-[1.5vmin] ${
                            selectedSubsystem === index ? "bg-white" : "bg-black"
                        } ${
                            selectedSubsystem === index ? "text-black" : "text-white"
                        } rounded-full duration-300 hover:border-white border-2 border-gray-800 flex justify-center`}
                    >
                        {subsystem}
                    </button>
                );
            })}
        </div>
    );
};

export default SubsystemPicker;
