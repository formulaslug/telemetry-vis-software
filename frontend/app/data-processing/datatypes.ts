import { Field, Precision, Schema } from "apache-arrow";
import { Float, Float32, Int64, Timestamp, Utf8 } from "apache-arrow/type";
import { fs2dataSchema, fs3dataSchema } from "./schema";
import { DataSetXY } from "@lightningchart/lcjs";

// (just a shorter alias)
// const float32 = new Float(Precision.SINGLE);

const columnDataTypes = fs3dataSchema;

export const columnNames = Object.keys(fs3dataSchema) as ColumnName[];

// TODO: This needs to not be hardcoded (along with the rest of the schema!)
export const timeColumnName: ColumnName = "Time_ms";

// columnDataTypes and columnNames are for use at runtime; everything with a
// PascalCase name is purely for type-checking at compile time

// A type for column names mapped to their datatype
export type DataRow = typeof columnDataTypes;

// Union of all Column nam{':Lap': 91, ':LapTime': 91, ':Time': 91, 'APPS_1': 104, 'APPS_2': 104, 'APPS_Travel_1': 104, 'APPS_Travel_2': 104, 'Avg_Cell_Temp': 104, 'BMS_Balancing': 104, 'BMS_Fault': 104, 'BSPD_Fault': 101, 'Battery Volts (Internal)': 101, 'Brake_Sensor_F': 101, 'Brake_Sensor_R': 101, 'Brakes': 104, 'Brakes_On': 101, 'CAN_Flag': 104, 'Charging': 104, 'Cockpit_Switch': 104, 'Fans:Value': 104, 'Fans_On': 104, 'GLV_Voltage': 104, 'GPSi_Altitude': 88, 'GPSi_Altitude:Sensor': 88, 'GPSi_CNoAverage': 90, 'GPSi_CNoMax': 90, 'GPSi_Course': 90, 'GPSi_DayUTC': 90, 'GPSi_HoursUTC': 90, 'GPSi_Latitude': 90, 'GPSi_Longitude': 90, 'GPSi_MinutesUTC': 90, 'GPSi_MonthUTC': 90, 'GPSi_NumHighCNo': 90, 'GPSi_SatelliteCount': 90, 'GPSi_SatellitesInUse': 90, 'GPSi_SecondsUTC': 90, 'GPSi_Speed': 90, 'GPSi_Status': 101, 'GPSi_Valid': 101, 'GPSi_YearUTC': 90, 'GPSi_hAcc': 101, 'GPSi_hAcc:Sensor': 101, 'GPSi_vAcc': 101, 'GPSi_vAcc:Sensor': 101, 'IMD_Fault': 101, 'Max_Cell_Temp': 104, 'Motor_On': 104, 'Odometer:Modifier.2': 1, 'Pedal_Travel': 104, 'Precharge:Value': 104, 'Precharge_Done': 104, 'RTDS_Queue': 104, 'SME_CURRLIM_ChargeCurrentLim': 104, 'SME_CURRLIM_DischargeCurrentLim': 104, 'SME_CURRLIM_UNUSED_INT_1': 83, 'SME_TEMP_BusCurrent': 104, 'SME_TEMP_ControllerTemperature': 104, 'SME_TEMP_DC_Bus_V': 104, 'SME_TEMP_FaultCode': 104, 'SME_TEMP_FaultLevel': 104, 'SME_TEMP_MotorTemperature': 104, 'SME_THROTL_Forward': 104, 'SME_THROTL_MBB_Alive': 104, 'SME_THROTL_MaxSpeed': 104, 'SME_THROTL_PowerReady': 104, 'SME_THROTL_Reverse': 104, 'SME_THROTL_TorqueDemand': 104, 'SME_TRQSPD_Controller_Overtermp': 104, 'SME_TRQSPD_Forward': 104, 'SME_TRQSPD_Hydraulic': 104, 'SME_TRQSPD_Key_switch_overvolt': 104, 'SME_TRQSPD_Key_switch_undervolt': 104, 'SME_TRQSPD_MotorFlags': 104, 'SME_TRQSPD_Park_Brake': 104, 'SME_TRQSPD_Pedal_Brake': 104, 'SME_TRQSPD_Powering_Enabled': 104, 'SME_TRQSPD_Powering_Ready': 104, 'SME_TRQSPD_Precharging': 104, 'SME_TRQSPD_Reverse': 104, 'SME_TRQSPD_Running': 104, 'SME_TRQSPD_SOC_Low_Hydraulic': 104, 'SME_TRQSPD_SOC_Low_Traction': 104, 'SME_TRQSPD_Speed': 104, 'SME_TRQSPD_Torque': 104, 'SME_TRQSPD_Traction': 104, 'SME_TRQSPD_contactor_closed': 104, 'Seg0_TEMP_0': 104, 'Seg0_TEMP_1': 104, 'Seg0_TEMP_2': 104, 'Seg0_TEMP_3': 104, 'Seg0_TEMP_4': 104, 'Seg0_TEMP_5': 104, 'Seg0_TEMP_6': 104, 'Seg0_VOLT_0': 104, 'Seg0_VOLT_1': 104, 'Seg0_VOLT_2': 104, 'Seg0_VOLT_3': 104, 'Seg0_VOLT_4': 104, 'Seg0_VOLT_5': 104, 'Seg0_VOLT_6': 104, 'Seg1_TEMP_0': 104, 'Seg1_TEMP_1': 104, 'Seg1_TEMP_2': 104, 'Seg1_TEMP_3': 104, 'Seg1_TEMP_4': 104, 'Seg1_TEMP_5': 104, 'Seg1_TEMP_6': 104, 'Seg1_VOLT_0': 104, 'Seg1_VOLT_1': 104, 'Seg1_VOLT_2': 104, 'Seg1_VOLT_3': 104, 'Seg1_VOLT_4': 104, 'Seg1_VOLT_5': 104, 'Seg1_VOLT_6': 104, 'Seg2_TEMP_0': 104, 'Seg2_TEMP_1': 104, 'Seg2_TEMP_2': 104, 'Seg2_TEMP_3': 104, 'Seg2_TEMP_4': 104, 'Seg2_TEMP_5': 104, 'Seg2_TEMP_6': 104, 'Seg2_VOLT_0': 104, 'Seg2_VOLT_1': 104, 'Seg2_VOLT_2': 104, 'Seg2_VOLT_3': 104, 'Seg2_VOLT_4': 104, 'Seg2_VOLT_5': 104, 'Seg2_VOLT_6': 104, 'Seg3_TEMP_0': 104, 'Seg3_TEMP_1': 104, 'Seg3_TEMP_2': 104, 'Seg3_TEMP_3': 104, 'Seg3_TEMP_4': 104, 'Seg3_TEMP_5': 104, 'Seg3_TEMP_6': 104, 'Seg3_VOLT_0': 104, 'Seg3_VOLT_1': 104, 'Seg3_VOLT_2': 104, 'Seg3_VOLT_3': 104, 'Seg3_VOLT_4': 104, 'Seg3_VOLT_5': 104, 'Seg3_VOLT_6': 104, 'Shutdown_Closed': 104, 'Speed Input': 101, 'Status': 101, 'Status:Value': 101, 'Steering_Sensor': 101, 'TS_Current': 104, 'TS_Ready': 104, 'TS_Voltage': 104, 'Odometer:Modifier.1': 100, 'Seconds': 16, 'VDM_GPS_ALTITUDE': 6, 'VDM_GPS_Latitude': 6, 'VDM_GPS_Longitude': 6, 'VDM_GPS_SATELLITES_IN_USE': 6, 'VDM_GPS_SPEED': 6, 'VDM_GPS_TRUE_COURSE': 6, 'VDM_GPS_VALID1': 6, 'VDM_GPS_VALID2': 6, 'VDM_UTC_DATE_DAY': 6, 'VDM_UTC_DATE_MONTH': 6, 'VDM_UTC_DATE_YEAR': 6, 'VDM_UTC_TIME_HOURS': 6, 'VDM_UTC_TIME_MINUTES': 6, 'VDM_UTC_TIME_SECONDS': 6, 'VDM_X_AXIS_ACCELERATION': 6, 'VDM_X_AXIS_YAW_RATE': 6, 'VDM_Y_AXIS_ACCELERATION': 6, 'VDM_Y_AXIS_YAW_RATE': 6, 'VDM_Z_AXIS_ACCELERATION': 6, 'VDM_Z_AXIS_YAW_RATE': 6, 'Shutdown:Value': 3, 'TELEM_BL_SUSTRAVEL': 3, 'TELEM_BR_SUSTRAVEL': 3, 'TELEM_FL_SUSTRAVEL': 3, 'TELEM_FR_SUSTRAVEL': 3, 'TELEM_STEERBRAKE_BRAKEF': 3, 'TELEM_STEERBRAKE_BRAKER': 3, 'TELEM_STEERBRAKE_STEER': 3}es
export type ColumnName = keyof DataRow;

// Maps keynames to arrays of that datatype, in the same fashion as "struct of
// arrays". Importantly values can also be null, as not every schema has all
// known keys (eg. old recordings)! This forces consumers to do error handling
export type DataArrays = {
    [K in keyof DataRow]: DataRow[K]["TValue"][] | null; // for regular arrays
};
export type DataArraysTyped = {
    [K in keyof DataRow]: DataRow[K]["TArray"] | null; // for typed arrays
};
export type DataValues = {
    // intended for getting the current row of cursor
    [K in keyof DataRow]: DataRow[K]["TValue"] | null;
};
// Use LCJS's DataSetXY type
export type DataSetsXY = {
    // LCJS components need to have empty datasets if no data is available so they can still render. So we don't use `| null` for this
    [K in keyof DataRow]: DataSetXY;
};

// Generate a dictionary with keys for each column name that are mapped to empty TypedArrays
export function emptyDataArraysTyped(rows: number): DataArraysTyped {
    return columnNames.reduce((acc, key) => {
        acc[key] = new columnDataTypes[key].ArrayType(rows).fill(NaN);
        return acc;
    }, {} as DataArraysTyped);
}
export function nullDataArraysTyped(): DataArraysTyped {
    return columnNames.reduce((acc, key) => {
        acc[key] = null;
        return acc;
    }, {} as DataArraysTyped);
}
// Generate a dictionary with keys for each column name that are mapped to null.
// This forces initializers (websocket, recordings) to initialize to real arrays
export function nullDataArrays(): DataArrays {
    return columnNames.reduce((acc, key) => {
        acc[key] = null;
        return acc;
    }, {} as DataArrays);
}
export function emptyDataArrays(): DataArrays {
    return columnNames.reduce((acc, key) => {
        acc[key] = [];
        return acc;
    }, {} as DataArrays);
}
export function nullDataValues(): DataValues {
    return columnNames.reduce((acc, key) => {
        acc[key] = null;
        return acc;
    }, {} as DataValues);
}

export const MAX_DATA_ROWS = 3_000;

// list of Field objects for Table's Schema (basically just (keyname,type) pairs)
const fields = columnNames.map((key) =>
    // for now we use nullabe: true. Eventually the backend should alleviate this
    Field.new({ name: key, type: fs3dataSchema[key], nullable: true }),
);

// This schema is only used for initial instantiation of the empty arrow Table.
// I found that it's consistently slower to create the Table from record batches
// with a schema specified.
// This must be *exactly* identical to the schema sent over the websocket,
// otherwise table creation will fail.
export const schema = new Schema<DataRow>(fields);
