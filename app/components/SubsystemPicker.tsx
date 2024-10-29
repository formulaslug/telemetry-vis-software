
import React from 'react';

interface SubsystemPickerProps {
    subsystems: string[];
    selectedSubsystem: number;
    onSelectSubsystem: (index: number) => void;
}
const SubsystemPicker = ({ subsystems, selectedSubsystem, onSelectSubsystem }: SubsystemPickerProps) => {
    return (
        <div className={"flex flex-row"}>
            {subsystems.map((subsystem, index) => {
                return (
                    <button key={index} onClick={() => onSelectSubsystem(index)} className={`py-2 px-4 ${selectedSubsystem === index ? 'bg-white' : 'bg-black'} ${selectedSubsystem === index ? 'text-black' : 'text-white'} rounded-full m-4 hover:bg-gray-600 duration-300 hover:text-white`}>
                        {subsystem}
                    </button>
                )
            }
            )}

        </div>
    );
}

export default SubsystemPicker;