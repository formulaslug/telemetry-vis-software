import { Float, Precision } from "apache-arrow";

const float32 = new Float(Precision.SINGLE);

// Combined dataframe schema from all parquet files in fs-3-data/Parquet.
// Comments refer to how many parquet files the column exists in
export const fs3dataSchema = {
  ":Lap": float32, // 91
  ":LapTime": float32, // 91
  ":Time": float32, // 91
  "APPS_1": float32, // 104
  "APPS_2": float32, // 104
  "APPS_Travel_1": float32, // 104
  "APPS_Travel_2": float32, // 104
  "Avg_Cell_Temp": float32, // 104
  "BMS_Balancing": float32, // 104
  "BMS_Fault": float32, // 104
  "BSPD_Fault": float32, // 101
  "Battery Volts (Internal)": float32, // 101
  "Brake_Sensor_F": float32, // 101
  "Brake_Sensor_R": float32, // 101
  "Brakes": float32, // 104
  "Brakes_On": float32, // 101
  "CAN_Flag": float32, // 104
  "Charging": float32, // 104
  "Cockpit_Switch": float32, // 104
  "Fans:Value": float32, // 104
  "Fans_On": float32, // 104
  "GLV_Voltage": float32, // 104
  "GPSi_Altitude": float32, // 88
  "GPSi_Altitude:Sensor": float32, // 88
  "GPSi_CNoAverage": float32, // 90
  "GPSi_CNoMax": float32, // 90
  "GPSi_Course": float32, // 90
  "GPSi_DayUTC": float32, // 90
  "GPSi_HoursUTC": float32, // 90
  "GPSi_Latitude": float32, // 90
  "GPSi_Longitude": float32, // 90
  "GPSi_MinutesUTC": float32, // 90
  "GPSi_MonthUTC": float32, // 90
  "GPSi_NumHighCNo": float32, // 90
  "GPSi_SatelliteCount": float32, // 90
  "GPSi_SatellitesInUse": float32, // 90
  "GPSi_SecondsUTC": float32, // 90
  "GPSi_Speed": float32, // 90
  "GPSi_Status": float32, // 101
  "GPSi_Valid": float32, // 101
  "GPSi_YearUTC": float32, // 90
  "GPSi_hAcc": float32, // 101
  "GPSi_hAcc:Sensor": float32, // 101
  "GPSi_vAcc": float32, // 101
  "GPSi_vAcc:Sensor": float32, // 101
  "IMD_Fault": float32, // 101
  "Max_Cell_Temp": float32, // 104
  "Motor_On": float32, // 104
  "Odometer:Modifier.2": float32, // 1
  "Pedal_Travel": float32, // 104
  "Precharge:Value": float32, // 104
  "Precharge_Done": float32, // 104
  "RTDS_Queue": float32, // 104
  "SME_CURRLIM_ChargeCurrentLim": float32, // 104
  "SME_CURRLIM_DischargeCurrentLim": float32, // 104
  "SME_CURRLIM_UNUSED_INT_1": float32, // 83
  "SME_TEMP_BusCurrent": float32, // 104
  "SME_TEMP_ControllerTemperature": float32, // 104
  "SME_TEMP_DC_Bus_V": float32, // 104
  "SME_TEMP_FaultCode": float32, // 104
  "SME_TEMP_FaultLevel": float32, // 104
  "SME_TEMP_MotorTemperature": float32, // 104
  "SME_THROTL_Forward": float32, // 104
  "SME_THROTL_MBB_Alive": float32, // 104
  "SME_THROTL_MaxSpeed": float32, // 104
  "SME_THROTL_PowerReady": float32, // 104
  "SME_THROTL_Reverse": float32, // 104
  "SME_THROTL_TorqueDemand": float32, // 104
  "SME_TRQSPD_Controller_Overtermp": float32, // 104
  "SME_TRQSPD_Forward": float32, // 104
  "SME_TRQSPD_Hydraulic": float32, // 104
  "SME_TRQSPD_Key_switch_overvolt": float32, // 104
  "SME_TRQSPD_Key_switch_undervolt": float32, // 104
  "SME_TRQSPD_MotorFlags": float32, // 104
  "SME_TRQSPD_Park_Brake": float32, // 104
  "SME_TRQSPD_Pedal_Brake": float32, // 104
  "SME_TRQSPD_Powering_Enabled": float32, // 104
  "SME_TRQSPD_Powering_Ready": float32, // 104
  "SME_TRQSPD_Precharging": float32, // 104
  "SME_TRQSPD_Reverse": float32, // 104
  "SME_TRQSPD_Running": float32, // 104
  "SME_TRQSPD_SOC_Low_Hydraulic": float32, // 104
  "SME_TRQSPD_SOC_Low_Traction": float32, // 104
  "SME_TRQSPD_Speed": float32, // 104
  "SME_TRQSPD_Torque": float32, // 104
  "SME_TRQSPD_Traction": float32, // 104
  "SME_TRQSPD_contactor_closed": float32, // 104
  "Seg0_TEMP_0": float32, // 104
  "Seg0_TEMP_1": float32, // 104
  "Seg0_TEMP_2": float32, // 104
  "Seg0_TEMP_3": float32, // 104
  "Seg0_TEMP_4": float32, // 104
  "Seg0_TEMP_5": float32, // 104
  "Seg0_TEMP_6": float32, // 104
  "Seg0_VOLT_0": float32, // 104
  "Seg0_VOLT_1": float32, // 104
  "Seg0_VOLT_2": float32, // 104
  "Seg0_VOLT_3": float32, // 104
  "Seg0_VOLT_4": float32, // 104
  "Seg0_VOLT_5": float32, // 104
  "Seg0_VOLT_6": float32, // 104
  "Seg1_TEMP_0": float32, // 104
  "Seg1_TEMP_1": float32, // 104
  "Seg1_TEMP_2": float32, // 104
  "Seg1_TEMP_3": float32, // 104
  "Seg1_TEMP_4": float32, // 104
  "Seg1_TEMP_5": float32, // 104
  "Seg1_TEMP_6": float32, // 104
  "Seg1_VOLT_0": float32, // 104
  "Seg1_VOLT_1": float32, // 104
  "Seg1_VOLT_2": float32, // 104
  "Seg1_VOLT_3": float32, // 104
  "Seg1_VOLT_4": float32, // 104
  "Seg1_VOLT_5": float32, // 104
  "Seg1_VOLT_6": float32, // 104
  "Seg2_TEMP_0": float32, // 104
  "Seg2_TEMP_1": float32, // 104
  "Seg2_TEMP_2": float32, // 104
  "Seg2_TEMP_3": float32, // 104
  "Seg2_TEMP_4": float32, // 104
  "Seg2_TEMP_5": float32, // 104
  "Seg2_TEMP_6": float32, // 104
  "Seg2_VOLT_0": float32, // 104
  "Seg2_VOLT_1": float32, // 104
  "Seg2_VOLT_2": float32, // 104
  "Seg2_VOLT_3": float32, // 104
  "Seg2_VOLT_4": float32, // 104
  "Seg2_VOLT_5": float32, // 104
  "Seg2_VOLT_6": float32, // 104
  "Seg3_TEMP_0": float32, // 104
  "Seg3_TEMP_1": float32, // 104
  "Seg3_TEMP_2": float32, // 104
  "Seg3_TEMP_3": float32, // 104
  "Seg3_TEMP_4": float32, // 104
  "Seg3_TEMP_5": float32, // 104
  "Seg3_TEMP_6": float32, // 104
  "Seg3_VOLT_0": float32, // 104
  "Seg3_VOLT_1": float32, // 104
  "Seg3_VOLT_2": float32, // 104
  "Seg3_VOLT_3": float32, // 104
  "Seg3_VOLT_4": float32, // 104
  "Seg3_VOLT_5": float32, // 104
  "Seg3_VOLT_6": float32, // 104
  "Shutdown_Closed": float32, // 104
  "Speed Input": float32, // 101
  "Status": float32, // 101
  "Status:Value": float32, // 101
  "Steering_Sensor": float32, // 101
  "TS_Current": float32, // 104
  "TS_Ready": float32, // 104
  "TS_Voltage": float32, // 104
  "Odometer:Modifier.1": float32, // 100
  "Seconds": float32, // 16
  "VDM_GPS_ALTITUDE": float32, // 6
  "VDM_GPS_Latitude": float32, // 6
  "VDM_GPS_Longitude": float32, // 6
  "VDM_GPS_SATELLITES_IN_USE": float32, // 6
  "VDM_GPS_SPEED": float32, // 6
  "VDM_GPS_TRUE_COURSE": float32, // 6
  "VDM_GPS_VALID1": float32, // 6
  "VDM_GPS_VALID2": float32, // 6
  "VDM_UTC_DATE_DAY": float32, // 6
  "VDM_UTC_DATE_MONTH": float32, // 6
  "VDM_UTC_DATE_YEAR": float32, // 6
  "VDM_UTC_TIME_HOURS": float32, // 6
  "VDM_UTC_TIME_MINUTES": float32, // 6
  "VDM_UTC_TIME_SECONDS": float32, // 6
  "VDM_X_AXIS_ACCELERATION": float32, // 6
  "VDM_X_AXIS_YAW_RATE": float32, // 6
  "VDM_Y_AXIS_ACCELERATION": float32, // 6
  "VDM_Y_AXIS_YAW_RATE": float32, // 6
  "VDM_Z_AXIS_ACCELERATION": float32, // 6
  "VDM_Z_AXIS_YAW_RATE": float32, // 6
  "Shutdown:Value": float32, // 3
  "TELEM_BL_SUSTRAVEL": float32, // 3
  "TELEM_BR_SUSTRAVEL": float32, // 3
  "TELEM_FL_SUSTRAVEL": float32, // 3
  "TELEM_FR_SUSTRAVEL": float32, // 3
  "TELEM_STEERBRAKE_BRAKEF": float32, // 3
  "TELEM_STEERBRAKE_BRAKER": float32, // 3
  "TELEM_STEERBRAKE_STEER": float32, // 3
};
