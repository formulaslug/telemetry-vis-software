import polars as pl
import numpy as np
import pyarrow as pa
import math
import random
import datetime

# List of some data to consider:
# Acc Temp(Cel)
# Acc Voltage(V)
# Break Pressure Front & Rear(PSI)
# Current to Acc(A)
# Hall Effect Sensors - FL,FR,RL,RR(Hz)
# Altitude(ft)
# Latitude(ft)
# Longitude(ft)
# Speed(mph)
# x,y, and z acceleration(m/s^2)
# x, y, and z gyro(deg)
# Suspension Travel - FL,FR,RL,RR(V)
# Suspension Force - FL,FR,RL,RR(Oh)
# Acc Air Intake Temp(C)
# Acc Air Exhaust Temp(C)
# Steering(Deg)
# Acc Air Intake Pressure(PSI)
# Acc Intake Air Flow Rate(m^3/sec)

# Real data schema:
data_columns = {
  ":Lap": pa.float32(), # 91
  ":LapTime": pa.float32(), # 91
  ":Time": pa.float32(), # 91
  "APPS_1": pa.float32(), # 104
  "APPS_2": pa.float32(), # 104
  "APPS_Travel_1": pa.float32(), # 104
  "APPS_Travel_2": pa.float32(), # 104
  "Avg_Cell_Temp": pa.float32(), # 104
  "BMS_Balancing": pa.float32(), # 104
  "BMS_Fault": pa.float32(), # 104
  "BSPD_Fault": pa.float32(), # 101
  "Battery Volts (Internal)": pa.float32(), # 101
  "Brake_Sensor_F": pa.float32(), # 101
  "Brake_Sensor_R": pa.float32(), # 101
  "Brakes": pa.float32(), # 104
  "Brakes_On": pa.float32(), # 101
  "CAN_Flag": pa.float32(), # 104
  "Charging": pa.float32(), # 104
  "Cockpit_Switch": pa.float32(), # 104
  "Fans:Value": pa.float32(), # 104
  "Fans_On": pa.float32(), # 104
  "GLV_Voltage": pa.float32(), # 104
  "GPSi_Altitude": pa.float32(), # 88
  "GPSi_Altitude:Sensor": pa.float32(), # 88
  "GPSi_CNoAverage": pa.float32(), # 90
  "GPSi_CNoMax": pa.float32(), # 90
  "GPSi_Course": pa.float32(), # 90
  "GPSi_DayUTC": pa.float32(), # 90
  "GPSi_HoursUTC": pa.float32(), # 90
  "GPSi_Latitude": pa.float32(), # 90
  "GPSi_Longitude": pa.float32(), # 90
  "GPSi_MinutesUTC": pa.float32(), # 90
  "GPSi_MonthUTC": pa.float32(), # 90
  "GPSi_NumHighCNo": pa.float32(), # 90
  "GPSi_SatelliteCount": pa.float32(), # 90
  "GPSi_SatellitesInUse": pa.float32(), # 90
  "GPSi_SecondsUTC": pa.float32(), # 90
  "GPSi_Speed": pa.float32(), # 90
  "GPSi_Status": pa.float32(), # 101
  "GPSi_Valid": pa.float32(), # 101
  "GPSi_YearUTC": pa.float32(), # 90
  "GPSi_hAcc": pa.float32(), # 101
  "GPSi_hAcc:Sensor": pa.float32(), # 101
  "GPSi_vAcc": pa.float32(), # 101
  "GPSi_vAcc:Sensor": pa.float32(), # 101
  "IMD_Fault": pa.float32(), # 101
  "Max_Cell_Temp": pa.float32(), # 104
  "Motor_On": pa.float32(), # 104
  "Odometer:Modifier.2": pa.float32(), # 1
  "Pedal_Travel": pa.float32(), # 104
  "Precharge:Value": pa.float32(), # 104
  "Precharge_Done": pa.float32(), # 104
  "RTDS_Queue": pa.float32(), # 104
  "SME_CURRLIM_ChargeCurrentLim": pa.float32(), # 104
  "SME_CURRLIM_DischargeCurrentLim": pa.float32(), # 104
  "SME_CURRLIM_UNUSED_INT_1": pa.float32(), # 83
  "SME_TEMP_BusCurrent": pa.float32(), # 104
  "SME_TEMP_ControllerTemperature": pa.float32(), # 104
  "SME_TEMP_DC_Bus_V": pa.float32(), # 104
  "SME_TEMP_FaultCode": pa.float32(), # 104
  "SME_TEMP_FaultLevel": pa.float32(), # 104
  "SME_TEMP_MotorTemperature": pa.float32(), # 104
  "SME_THROTL_Forward": pa.float32(), # 104
  "SME_THROTL_MBB_Alive": pa.float32(), # 104
  "SME_THROTL_MaxSpeed": pa.float32(), # 104
  "SME_THROTL_PowerReady": pa.float32(), # 104
  "SME_THROTL_Reverse": pa.float32(), # 104
  "SME_THROTL_TorqueDemand": pa.float32(), # 104
  "SME_TRQSPD_Controller_Overtermp": pa.float32(), # 104
  "SME_TRQSPD_Forward": pa.float32(), # 104
  "SME_TRQSPD_Hydraulic": pa.float32(), # 104
  "SME_TRQSPD_Key_switch_overvolt": pa.float32(), # 104
  "SME_TRQSPD_Key_switch_undervolt": pa.float32(), # 104
  "SME_TRQSPD_MotorFlags": pa.float32(), # 104
  "SME_TRQSPD_Park_Brake": pa.float32(), # 104
  "SME_TRQSPD_Pedal_Brake": pa.float32(), # 104
  "SME_TRQSPD_Powering_Enabled": pa.float32(), # 104
  "SME_TRQSPD_Powering_Ready": pa.float32(), # 104
  "SME_TRQSPD_Precharging": pa.float32(), # 104
  "SME_TRQSPD_Reverse": pa.float32(), # 104
  "SME_TRQSPD_Running": pa.float32(), # 104
  "SME_TRQSPD_SOC_Low_Hydraulic": pa.float32(), # 104
  "SME_TRQSPD_SOC_Low_Traction": pa.float32(), # 104
  "SME_TRQSPD_Speed": pa.float32(), # 104
  "SME_TRQSPD_Torque": pa.float32(), # 104
  "SME_TRQSPD_Traction": pa.float32(), # 104
  "SME_TRQSPD_contactor_closed": pa.float32(), # 104
  "Seg0_TEMP_0": pa.float32(), # 104
  "Seg0_TEMP_1": pa.float32(), # 104
  "Seg0_TEMP_2": pa.float32(), # 104
  "Seg0_TEMP_3": pa.float32(), # 104
  "Seg0_TEMP_4": pa.float32(), # 104
  "Seg0_TEMP_5": pa.float32(), # 104
  "Seg0_TEMP_6": pa.float32(), # 104
  "Seg0_VOLT_0": pa.float32(), # 104
  "Seg0_VOLT_1": pa.float32(), # 104
  "Seg0_VOLT_2": pa.float32(), # 104
  "Seg0_VOLT_3": pa.float32(), # 104
  "Seg0_VOLT_4": pa.float32(), # 104
  "Seg0_VOLT_5": pa.float32(), # 104
  "Seg0_VOLT_6": pa.float32(), # 104
  "Seg1_TEMP_0": pa.float32(), # 104
  "Seg1_TEMP_1": pa.float32(), # 104
  "Seg1_TEMP_2": pa.float32(), # 104
  "Seg1_TEMP_3": pa.float32(), # 104
  "Seg1_TEMP_4": pa.float32(), # 104
  "Seg1_TEMP_5": pa.float32(), # 104
  "Seg1_TEMP_6": pa.float32(), # 104
  "Seg1_VOLT_0": pa.float32(), # 104
  "Seg1_VOLT_1": pa.float32(), # 104
  "Seg1_VOLT_2": pa.float32(), # 104
  "Seg1_VOLT_3": pa.float32(), # 104
  "Seg1_VOLT_4": pa.float32(), # 104
  "Seg1_VOLT_5": pa.float32(), # 104
  "Seg1_VOLT_6": pa.float32(), # 104
  "Seg2_TEMP_0": pa.float32(), # 104
  "Seg2_TEMP_1": pa.float32(), # 104
  "Seg2_TEMP_2": pa.float32(), # 104
  "Seg2_TEMP_3": pa.float32(), # 104
  "Seg2_TEMP_4": pa.float32(), # 104
  "Seg2_TEMP_5": pa.float32(), # 104
  "Seg2_TEMP_6": pa.float32(), # 104
  "Seg2_VOLT_0": pa.float32(), # 104
  "Seg2_VOLT_1": pa.float32(), # 104
  "Seg2_VOLT_2": pa.float32(), # 104
  "Seg2_VOLT_3": pa.float32(), # 104
  "Seg2_VOLT_4": pa.float32(), # 104
  "Seg2_VOLT_5": pa.float32(), # 104
  "Seg2_VOLT_6": pa.float32(), # 104
  "Seg3_TEMP_0": pa.float32(), # 104
  "Seg3_TEMP_1": pa.float32(), # 104
  "Seg3_TEMP_2": pa.float32(), # 104
  "Seg3_TEMP_3": pa.float32(), # 104
  "Seg3_TEMP_4": pa.float32(), # 104
  "Seg3_TEMP_5": pa.float32(), # 104
  "Seg3_TEMP_6": pa.float32(), # 104
  "Seg3_VOLT_0": pa.float32(), # 104
  "Seg3_VOLT_1": pa.float32(), # 104
  "Seg3_VOLT_2": pa.float32(), # 104
  "Seg3_VOLT_3": pa.float32(), # 104
  "Seg3_VOLT_4": pa.float32(), # 104
  "Seg3_VOLT_5": pa.float32(), # 104
  "Seg3_VOLT_6": pa.float32(), # 104
  "Shutdown_Closed": pa.float32(), # 104
  "Speed Input": pa.float32(), # 101
  "Status": pa.float32(), # 101
  "Status:Value": pa.float32(), # 101
  "Steering_Sensor": pa.float32(), # 101
  "TS_Current": pa.float32(), # 104
  "TS_Ready": pa.float32(), # 104
  "TS_Voltage": pa.float32(), # 104
  "Odometer:Modifier.1": pa.float32(), # 100
  "Seconds": pa.float32(), # 16
  "VDM_GPS_ALTITUDE": pa.float32(), # 6
  "VDM_GPS_Latitude": pa.float32(), # 6
  "VDM_GPS_Longitude": pa.float32(), # 6
  "VDM_GPS_SATELLITES_IN_USE": pa.float32(), # 6
  "VDM_GPS_SPEED": pa.float32(), # 6
  "VDM_GPS_TRUE_COURSE": pa.float32(), # 6
  "VDM_GPS_VALID1": pa.float32(), # 6
  "VDM_GPS_VALID2": pa.float32(), # 6
  "VDM_UTC_DATE_DAY": pa.float32(), # 6
  "VDM_UTC_DATE_MONTH": pa.float32(), # 6
  "VDM_UTC_DATE_YEAR": pa.float32(), # 6
  "VDM_UTC_TIME_HOURS": pa.float32(), # 6
  "VDM_UTC_TIME_MINUTES": pa.float32(), # 6
  "VDM_UTC_TIME_SECONDS": pa.float32(), # 6
  "VDM_X_AXIS_ACCELERATION": pa.float32(), # 6
  "VDM_X_AXIS_YAW_RATE": pa.float32(), # 6
  "VDM_Y_AXIS_ACCELERATION": pa.float32(), # 6
  "VDM_Y_AXIS_YAW_RATE": pa.float32(), # 6
  "VDM_Z_AXIS_ACCELERATION": pa.float32(), # 6
  "VDM_Z_AXIS_YAW_RATE": pa.float32(), # 6
  "Shutdown:Value": pa.float32(), # 3
  "TELEM_BL_SUSTRAVEL": pa.float32(), # 3
  "TELEM_BR_SUSTRAVEL": pa.float32(), # 3
  "TELEM_FL_SUSTRAVEL": pa.float32(), # 3
  "TELEM_FR_SUSTRAVEL": pa.float32(), # 3
  "TELEM_STEERBRAKE_BRAKEF": pa.float32(), # 3
  "TELEM_STEERBRAKE_BRAKER": pa.float32(), # 3
  "TELEM_STEERBRAKE_STEER": pa.float32(), # 3
}

t0 = datetime.datetime.now()


def createdf():
    # Default item
    series_list = [pl.Series(k, [math.sin((datetime.datetime.now() - t0).total_seconds() + i/10)], pl.Float32) for i, k in enumerate(data_columns)]
    # :Time
    series_list[2] = pl.Series(":Time", [(datetime.datetime.now() - t0).total_seconds()], pl.Float32)
    df = pl.DataFrame(series_list)

    return df

# def get_schema():
#     # for now, we use nullable: True. In the future, the backend should
#     # automatically clear / interpolate rows with null/zero/near-zero values
#     fields = [pa.field(*c, nullable=True) for c in data_columns.items()]
#     timestamps = pa.field("Timestamp(s)", pa.float32(), nullable=True)
#     # print(timestamps)
#     return pa.schema(fields + [timestamps])

def get_schema():
    # for now, we use nullable: True. In the future, the backend should
    # automatically clear / interpolate rows with null/zero/near-zero values
    fields = [pa.field(*c, nullable=True) for c in data_columns.items()]
    # print(timestamps)

    return pa.schema(fields)
