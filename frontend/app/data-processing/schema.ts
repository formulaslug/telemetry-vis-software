import { Float, Precision } from "apache-arrow";

const float32 = new Float(Precision.SINGLE);

// Combined dataframe schema from all parquet files in fs-data/FS-2/Parquet.
// Comments refer to how many parquet files the column exists in
export const fs2dataSchema = {
    ":Lap": float32, // 91
    ":LapTime": float32, // 91
    ":Time": float32, // 91
    APPS_1: float32, // 104
    APPS_2: float32, // 104
    APPS_Travel_1: float32, // 104
    APPS_Travel_2: float32, // 104
    Avg_Cell_Temp: float32, // 104
    BMS_Balancing: float32, // 104
    BMS_Fault: float32, // 104
    BSPD_Fault: float32, // 101
    "Battery Volts (Internal)": float32, // 101
    Brake_Sensor_F: float32, // 101
    Brake_Sensor_R: float32, // 101
    Brakes: float32, // 104
    Brakes_On: float32, // 101
    CAN_Flag: float32, // 104
    Charging: float32, // 104
    Cockpit_Switch: float32, // 104
    "Fans:Value": float32, // 104
    Fans_On: float32, // 104
    GLV_Voltage: float32, // 104
    GPSi_Altitude: float32, // 88
    "GPSi_Altitude:Sensor": float32, // 88
    GPSi_CNoAverage: float32, // 90
    GPSi_CNoMax: float32, // 90
    GPSi_Course: float32, // 90
    GPSi_DayUTC: float32, // 90
    GPSi_HoursUTC: float32, // 90
    GPSi_Latitude: float32, // 90
    GPSi_Longitude: float32, // 90
    GPSi_MinutesUTC: float32, // 90
    GPSi_MonthUTC: float32, // 90
    GPSi_NumHighCNo: float32, // 90
    GPSi_SatelliteCount: float32, // 90
    GPSi_SatellitesInUse: float32, // 90
    GPSi_SecondsUTC: float32, // 90
    GPSi_Speed: float32, // 90
    GPSi_Status: float32, // 101
    GPSi_Valid: float32, // 101
    GPSi_YearUTC: float32, // 90
    GPSi_hAcc: float32, // 101
    "GPSi_hAcc:Sensor": float32, // 101
    GPSi_vAcc: float32, // 101
    "GPSi_vAcc:Sensor": float32, // 101
    IMD_Fault: float32, // 101
    Max_Cell_Temp: float32, // 104
    Motor_On: float32, // 104
    "Odometer:Modifier.2": float32, // 1
    Pedal_Travel: float32, // 104
    "Precharge:Value": float32, // 104
    Precharge_Done: float32, // 104
    RTDS_Queue: float32, // 104
    SME_CURRLIM_ChargeCurrentLim: float32, // 104
    SME_CURRLIM_DischargeCurrentLim: float32, // 104
    SME_CURRLIM_UNUSED_INT_1: float32, // 83
    SME_TEMP_BusCurrent: float32, // 104
    SME_TEMP_ControllerTemperature: float32, // 104
    SME_TEMP_DC_Bus_V: float32, // 104
    SME_TEMP_FaultCode: float32, // 104
    SME_TEMP_FaultLevel: float32, // 104
    SME_TEMP_MotorTemperature: float32, // 104
    SME_THROTL_Forward: float32, // 104
    SME_THROTL_MBB_Alive: float32, // 104
    SME_THROTL_MaxSpeed: float32, // 104
    SME_THROTL_PowerReady: float32, // 104
    SME_THROTL_Reverse: float32, // 104
    SME_THROTL_TorqueDemand: float32, // 104
    SME_TRQSPD_Controller_Overtermp: float32, // 104
    SME_TRQSPD_Forward: float32, // 104
    SME_TRQSPD_Hydraulic: float32, // 104
    SME_TRQSPD_Key_switch_overvolt: float32, // 104
    SME_TRQSPD_Key_switch_undervolt: float32, // 104
    SME_TRQSPD_MotorFlags: float32, // 104
    SME_TRQSPD_Park_Brake: float32, // 104
    SME_TRQSPD_Pedal_Brake: float32, // 104
    SME_TRQSPD_Powering_Enabled: float32, // 104
    SME_TRQSPD_Powering_Ready: float32, // 104
    SME_TRQSPD_Precharging: float32, // 104
    SME_TRQSPD_Reverse: float32, // 104
    SME_TRQSPD_Running: float32, // 104
    SME_TRQSPD_SOC_Low_Hydraulic: float32, // 104
    SME_TRQSPD_SOC_Low_Traction: float32, // 104
    SME_TRQSPD_Speed: float32, // 104
    SME_TRQSPD_Torque: float32, // 104
    SME_TRQSPD_Traction: float32, // 104
    SME_TRQSPD_contactor_closed: float32, // 104
    Seg0_TEMP_0: float32, // 104
    Seg0_TEMP_1: float32, // 104
    Seg0_TEMP_2: float32, // 104
    Seg0_TEMP_3: float32, // 104
    Seg0_TEMP_4: float32, // 104
    Seg0_TEMP_5: float32, // 104
    Seg0_TEMP_6: float32, // 104
    Seg0_VOLT_0: float32, // 104
    Seg0_VOLT_1: float32, // 104
    Seg0_VOLT_2: float32, // 104
    Seg0_VOLT_3: float32, // 104
    Seg0_VOLT_4: float32, // 104
    Seg0_VOLT_5: float32, // 104
    Seg0_VOLT_6: float32, // 104
    Seg1_TEMP_0: float32, // 104
    Seg1_TEMP_1: float32, // 104
    Seg1_TEMP_2: float32, // 104
    Seg1_TEMP_3: float32, // 104
    Seg1_TEMP_4: float32, // 104
    Seg1_TEMP_5: float32, // 104
    Seg1_TEMP_6: float32, // 104
    Seg1_VOLT_0: float32, // 104
    Seg1_VOLT_1: float32, // 104
    Seg1_VOLT_2: float32, // 104
    Seg1_VOLT_3: float32, // 104
    Seg1_VOLT_4: float32, // 104
    Seg1_VOLT_5: float32, // 104
    Seg1_VOLT_6: float32, // 104
    Seg2_TEMP_0: float32, // 104
    Seg2_TEMP_1: float32, // 104
    Seg2_TEMP_2: float32, // 104
    Seg2_TEMP_3: float32, // 104
    Seg2_TEMP_4: float32, // 104
    Seg2_TEMP_5: float32, // 104
    Seg2_TEMP_6: float32, // 104
    Seg2_VOLT_0: float32, // 104
    Seg2_VOLT_1: float32, // 104
    Seg2_VOLT_2: float32, // 104
    Seg2_VOLT_3: float32, // 104
    Seg2_VOLT_4: float32, // 104
    Seg2_VOLT_5: float32, // 104
    Seg2_VOLT_6: float32, // 104
    Seg3_TEMP_0: float32, // 104
    Seg3_TEMP_1: float32, // 104
    Seg3_TEMP_2: float32, // 104
    Seg3_TEMP_3: float32, // 104
    Seg3_TEMP_4: float32, // 104
    Seg3_TEMP_5: float32, // 104
    Seg3_TEMP_6: float32, // 104
    Seg3_VOLT_0: float32, // 104
    Seg3_VOLT_1: float32, // 104
    Seg3_VOLT_2: float32, // 104
    Seg3_VOLT_3: float32, // 104
    Seg3_VOLT_4: float32, // 104
    Seg3_VOLT_5: float32, // 104
    Seg3_VOLT_6: float32, // 104
    Shutdown_Closed: float32, // 104
    "Speed Input": float32, // 101
    Status: float32, // 101
    "Status:Value": float32, // 101
    Steering_Sensor: float32, // 101
    TS_Current: float32, // 104
    TS_Ready: float32, // 104
    TS_Voltage: float32, // 104
    "Odometer:Modifier.1": float32, // 100
    Seconds: float32, // 16
    VDM_GPS_ALTITUDE: float32, // 6
    VDM_GPS_Latitude: float32, // 6
    VDM_GPS_Longitude: float32, // 6
    VDM_GPS_SATELLITES_IN_USE: float32, // 6
    VDM_GPS_SPEED: float32, // 6
    VDM_GPS_TRUE_COURSE: float32, // 6
    VDM_GPS_VALID1: float32, // 6
    VDM_GPS_VALID2: float32, // 6
    VDM_UTC_DATE_DAY: float32, // 6
    VDM_UTC_DATE_MONTH: float32, // 6
    VDM_UTC_DATE_YEAR: float32, // 6
    VDM_UTC_TIME_HOURS: float32, // 6
    VDM_UTC_TIME_MINUTES: float32, // 6
    VDM_UTC_TIME_SECONDS: float32, // 6
    VDM_X_AXIS_ACCELERATION: float32, // 6
    VDM_X_AXIS_YAW_RATE: float32, // 6
    VDM_Y_AXIS_ACCELERATION: float32, // 6
    VDM_Y_AXIS_YAW_RATE: float32, // 6
    VDM_Z_AXIS_ACCELERATION: float32, // 6
    VDM_Z_AXIS_YAW_RATE: float32, // 6
    "Shutdown:Value": float32, // 3
    TELEM_BL_SUSTRAVEL: float32, // 3
    TELEM_BR_SUSTRAVEL: float32, // 3
    TELEM_FL_SUSTRAVEL: float32, // 3
    TELEM_FR_SUSTRAVEL: float32, // 3
    TELEM_STEERBRAKE_BRAKEF: float32, // 3
    TELEM_STEERBRAKE_BRAKER: float32, // 3
    TELEM_STEERBRAKE_STEER: float32, // 3
};

export const fs3dataSchema = {
    timestamp: float32,

    SME_THROTL_TorqueDemand: float32,
    SME_THROTL_MaxSpeed: float32,
    SME_THROTL_Forward: float32,
    SME_THROTL_Reverse: float32,
    SME_THROTL_PowerReady: float32,
    SME_THROTL_MBB_Alive: float32,
    SME_CURRLIM_ChargeCurrentLim: float32,
    SME_CURRLIM_DischargeCurrentLim: float32,
    SME_TRQSPD_Speed: float32,
    SME_TRQSPD_Torque: float32,
    SME_TRQSPD_SOC_Low_Traction: float32,
    SME_TRQSPD_SOC_Low_Hydraulic: float32,
    SME_TRQSPD_Reverse: float32,
    SME_TRQSPD_Forward: float32,
    SME_TRQSPD_Park_Brake: float32,
    SME_TRQSPD_Pedal_Brake: float32,
    SME_TRQSPD_Controller_Overtermp: float32,
    SME_TRQSPD_Key_switch_overvolt: float32,
    SME_TRQSPD_Key_switch_undervolt: float32,
    SME_TRQSPD_Running: float32,
    SME_TRQSPD_Traction: float32,
    SME_TRQSPD_Hydraulic: float32,
    SME_TRQSPD_Powering_Enabled: float32,
    SME_TRQSPD_Powering_Ready: float32,
    SME_TRQSPD_Precharging: float32,
    SME_TRQSPD_contactor_closed: float32,
    SME_TRQSPD_MotorFlags: float32,
    SME_TEMP_MotorTemperature: float32,
    SME_TEMP_ControllerTemperature: float32,
    SME_TEMP_DC_Bus_V: float32,
    SME_TEMP_FaultCode: float32,
    SME_TEMP_FaultLevel: float32,
    SME_TEMP_BusCurrent: float32,
    ACC_STATUS_BMS_FAULT: float32,
    ACC_STATUS_IMD_FAULT: float32,
    ACC_STATUS_SHUTDOWN_STATE: float32,
    ACC_STATUS_PRECHARGE_DONE: float32,
    ACC_STATUS_PRECHARGING: float32,
    ACC_STATUS_CHARGING: float32,
    ACC_STATUS_CELL_TOO_LOW: float32,
    ACC_STATUS_CELL_TOO_HIGH: float32,
    ACC_STATUS_TEMP_TOO_LOW: float32,
    ACC_STATUS_TEMP_TOO_HIGH: float32,
    ACC_STATUS_TEMP_TOO_HIGH_CRG: float32,
    ACC_STATUS_BALANCING: float32,
    ACC_STATUS_GLV_VOLTAGE: float32,
    ACC_STATUS_CELL_FAULT_INDEX: float32,
    ACC_POWER_PACK_VOLTAGE: float32,
    ACC_POWER_SOC: float32,
    ACC_POWER_CURRENT: float32,
    ACC_SEG0_VOLTS_CELL0: float32,
    ACC_SEG0_VOLTS_CELL1: float32,
    ACC_SEG0_VOLTS_CELL2: float32,
    ACC_SEG0_VOLTS_CELL3: float32,
    ACC_SEG0_VOLTS_CELL4: float32,
    ACC_SEG0_VOLTS_CELL5: float32,
    ACC_SEG0_TEMPS_CELL0: float32,
    ACC_SEG0_TEMPS_CELL1: float32,
    ACC_SEG0_TEMPS_CELL2: float32,
    ACC_SEG0_TEMPS_CELL3: float32,
    ACC_SEG0_TEMPS_CELL4: float32,
    ACC_SEG0_TEMPS_CELL5: float32,
    ACC_SEG1_VOLTS_CELL0: float32,
    ACC_SEG1_VOLTS_CELL1: float32,
    ACC_SEG1_VOLTS_CELL2: float32,
    ACC_SEG1_VOLTS_CELL3: float32,
    ACC_SEG1_VOLTS_CELL4: float32,
    ACC_SEG1_VOLTS_CELL5: float32,
    ACC_SEG1_TEMPS_CELL0: float32,
    ACC_SEG1_TEMPS_CELL1: float32,
    ACC_SEG1_TEMPS_CELL2: float32,
    ACC_SEG1_TEMPS_CELL3: float32,
    ACC_SEG1_TEMPS_CELL4: float32,
    ACC_SEG1_TEMPS_CELL5: float32,
    ACC_SEG2_VOLTS_CELL0: float32,
    ACC_SEG2_VOLTS_CELL1: float32,
    ACC_SEG2_VOLTS_CELL2: float32,
    ACC_SEG2_VOLTS_CELL3: float32,
    ACC_SEG2_VOLTS_CELL4: float32,
    ACC_SEG2_VOLTS_CELL5: float32,
    ACC_SEG2_TEMPS_CELL0: float32,
    ACC_SEG2_TEMPS_CELL1: float32,
    ACC_SEG2_TEMPS_CELL2: float32,
    ACC_SEG2_TEMPS_CELL3: float32,
    ACC_SEG2_TEMPS_CELL4: float32,
    ACC_SEG2_TEMPS_CELL5: float32,
    ACC_SEG3_VOLTS_CELL0: float32,
    ACC_SEG3_VOLTS_CELL1: float32,
    ACC_SEG3_VOLTS_CELL2: float32,
    ACC_SEG3_VOLTS_CELL3: float32,
    ACC_SEG3_VOLTS_CELL4: float32,
    ACC_SEG3_VOLTS_CELL5: float32,
    ACC_SEG3_TEMPS_CELL0: float32,
    ACC_SEG3_TEMPS_CELL1: float32,
    ACC_SEG3_TEMPS_CELL2: float32,
    ACC_SEG3_TEMPS_CELL3: float32,
    ACC_SEG3_TEMPS_CELL4: float32,
    ACC_SEG3_TEMPS_CELL5: float32,
    ACC_SEG4_VOLTS_CELL0: float32,
    ACC_SEG4_VOLTS_CELL1: float32,
    ACC_SEG4_VOLTS_CELL2: float32,
    ACC_SEG4_VOLTS_CELL3: float32,
    ACC_SEG4_VOLTS_CELL4: float32,
    ACC_SEG4_VOLTS_CELL5: float32,
    ACC_SEG4_TEMPS_CELL0: float32,
    ACC_SEG4_TEMPS_CELL1: float32,
    ACC_SEG4_TEMPS_CELL2: float32,
    ACC_SEG4_TEMPS_CELL3: float32,
    ACC_SEG4_TEMPS_CELL4: float32,
    ACC_SEG4_TEMPS_CELL5: float32,
    VDM_GPS_Latitude: float32,
    VDM_GPS_Longitude: float32,
    VDM_GPS_SPEED: float32,
    VDM_GPS_ALTITUDE: float32,
    VDM_GPS_TRUE_COURSE: float32,
    VDM_GPS_SATELLITES_IN_USE: float32,
    VDM_GPS_VALID1: float32,
    VDM_GPS_VALID2: float32,
    VDM_UTC_DATE_YEAR: float32,
    VDM_UTC_DATE_MONTH: float32,
    VDM_UTC_DATE_DAY: float32,
    VDM_UTC_TIME_HOURS: float32,
    VDM_UTC_TIME_MINUTES: float32,
    VDM_UTC_TIME_SECONDS: float32,
    VDM_X_AXIS_ACCELERATION: float32,
    VDM_Y_AXIS_ACCELERATION: float32,
    VDM_Z_AXIS_ACCELERATION: float32,
    VDM_X_AXIS_YAW_RATE: float32,
    VDM_Y_AXIS_YAW_RATE: float32,
    VDM_Z_AXIS_YAW_RATE: float32,
    ETC_STATUS_HE1: float32,
    ETC_STATUS_HE2: float32,
    ETC_STATUS_BRAKE_SENSE_VOLTAGE: float32,
    ETC_STATUS_PEDAL_TRAVEL: float32,
    ETC_STATUS_RTD_BUTTON: float32,
    ETC_STATUS_RTDS: float32,
    ETC_STATUS_REVERSE: float32,
    ETC_STATUS_BRAKELIGHT: float32,
    ETC_STATUS_RTD: float32,
    ETC_STATUS_IMPLAUSIBILITY: float32,
    ETC_STATUS_TS_ACTIVE: float32,
    PDB_POWER_A_GLV_VOLTAGE: float32,
    PDB_POWER_A_CURRENT_SHUTDOWN: float32,
    PDB_POWER_A_CURRENT_ACC: float32,
    PDB_POWER_A_CURRENT_ETC: float32,
    PDB_POWER_A_CURRENT_BPS: float32,
    PDB_POWER_A_CURRENT_TRACTIVE: float32,
    PDB_POWER_A_CURRENT_BSPD: float32,
    PDB_POWER_B_CURRENT_TELEMETRY: float32,
    PDB_POWER_B_CURRENT_PDB: float32,
    PDB_POWER_B_CURRENT_DASH: float32,
    PDB_POWER_B_CURRENT_RTML: float32,
    PDB_POWER_B_CURRENT_EXTRA_1: float32,
    PDB_POWER_B_CURRENT_EXTRA_2: float32,
    TMAIN_DATA_BRAKES_F: float32,
    TMAIN_DATA_BRAKES_R: float32,
    TPERIPH_FL_DATA_WHEELSPEED: float32,
    TPERIPH_FL_DATA_SUSTRAVEL: float32,
    TPERIPH_FL_DATA_STRAIN: float32,
    TPERIPH_FL_DATA_SIDE_TIRE_TEMP: float32,
    TPERIPH_FR_DATA_WHEELSPEED: float32,
    TPERIPH_FR_DATA_SUSTRAVEL: float32,
    TPERIPH_FR_DATA_STRAIN: float32,
    TPERIPH_FR_DATA_SIDE_TIRE_TEMP: float32,
    TPERIPH_BL_DATA_WHEELSPEED: float32,
    TPERIPH_BL_DATA_SUSTRAVEL: float32,
    TPERIPH_BL_DATA_STRAIN: float32,
    TPERIPH_BL_DATA_SIDE_TIRE_TEMP: float32,
    TPERIPH_BR_DATA_WHEELSPEED: float32,
    TPERIPH_BR_DATA_SUSTRAVEL: float32,
    TPERIPH_BR_DATA_STRAIN: float32,
    TPERIPH_BR_DATA_SIDE_TIRE_TEMP: float32,
    TPERIPH_FL_TIRETEMP_1: float32,
    TPERIPH_FL_TIRETEMP_2: float32,
    TPERIPH_FL_TIRETEMP_3: float32,
    TPERIPH_FL_TIRETEMP_4: float32,
    TPERIPH_FL_TIRETEMP_5: float32,
    TPERIPH_FL_TIRETEMP_6: float32,
    TPERIPH_FL_TIRETEMP_7: float32,
    TPERIPH_FL_TIRETEMP_8: float32,
    TPERIPH_FR_TIRETEMP_1: float32,
    TPERIPH_FR_TIRETEMP_2: float32,
    TPERIPH_FR_TIRETEMP_3: float32,
    TPERIPH_FR_TIRETEMP_4: float32,
    TPERIPH_FR_TIRETEMP_5: float32,
    TPERIPH_FR_TIRETEMP_6: float32,
    TPERIPH_FR_TIRETEMP_7: float32,
    TPERIPH_FR_TIRETEMP_8: float32,
    TPERIPH_BL_TIRETEMP_1: float32,
    TPERIPH_BL_TIRETEMP_2: float32,
    TPERIPH_BL_TIRETEMP_3: float32,
    TPERIPH_BL_TIRETEMP_4: float32,
    TPERIPH_BL_TIRETEMP_5: float32,
    TPERIPH_BL_TIRETEMP_6: float32,
    TPERIPH_BL_TIRETEMP_7: float32,
    TPERIPH_BL_TIRETEMP_8: float32,
    TPERIPH_BR_TIRETEMP_1: float32,
    TPERIPH_BR_TIRETEMP_2: float32,
    TPERIPH_BR_TIRETEMP_3: float32,
    TPERIPH_BR_TIRETEMP_4: float32,
    TPERIPH_BR_TIRETEMP_5: float32,
    TPERIPH_BR_TIRETEMP_6: float32,
    TPERIPH_BR_TIRETEMP_7: float32,
    TPERIPH_BR_TIRETEMP_8: float32,
    COMMAND_COMMAND_SPECIFIER: float32,
    COMMAND_MODE: float32,
    RESPONSE_COMMAND_SPECIFIER: float32,
    SMPC_CONTROL_DEST_NODE_ID: float32,
    SMPC_CONTROL_ENABLE: float32,
    SMPC_CONTROL_CURRENT_10X_MULT: float32,
    SMPC_CONTROL_EVSE_OVERRIDE: float32,
    SMPC_CONTROL_PACK_VOLTAGE: float32,
    SMPC_MAX_DEST_NODE_ID: float32,
    SMPC_MAX_CHRG_VOLTAGE: float32,
    SMPC_MAX_CHRG_CURRENT: float32,
    SMPC_MAX_INPUT_EVSE_OVERRIDE: float32,
    SMPC_STATUS_READY: float32,
    SMPC_STATUS_CHARGE_COMPLETE: float32,
    SMPC_STATUS_OVERTEMP_FAULT: float32,
    SMPC_STATUS_OVERCURRENT_FAULT: float32,
    SMPC_STATUS_OVERVOLTAGE_FAULT: float32,
    SMPC_STATUS_UNDERVOLTAGE_FAULT: float32,
    SMPC_STATUS_INTERNAL_FAULT: float32,
    SMPC_STATUS_CHARGING: float32,
    SMPC_STATUS_CHARGER_UNPLUGGED: float32,
    SMPC_STATUS_REQUEST_EXCLUSIVE: float32,
    SMPC_STATUS_J1772_DISCONN: float32,
    SMPC_STATUS_VOLTAGE_MV: float32,
    SMPC_STATUS_CURRENT_MA: float32,
    SMPC_MAX2_MAX_VOLTAGE_MV: float32,
    SMPC_MAX2_MAX_CURRENT_MA: float32,
    SMPC_MAX2_EVSE_CURRENT: float32,
    SMPC_MAX2_INPUT_CURR_LIM: float32,
    SMPC_INPUT_AC_INPUT_VOLTAGE: float32,
    SMPC_INPUT_J1772_CONNECTED: float32,
    SMPC_INPUT_J1772_DISCONNECTED: float32,
    SMPC_INPUT_J1772_TRIGGERED: float32,
    SMPC_INPUT_AC_INPUT_CURRENT_MA: float32,
    SMPC_INPUT_AC_INPUT_FREQUENCY_HZ: float32,
    SMPC_INPUT_MAX_CHARGER_TEMP_C: float32,
    SMPC_SER_PART_NUMBER: float32,
    SMPC_SER_SERIAL_NUMBER: float32,
    SMPC_SER_FIRMWARE_VER: float32,
};
