import polars as pl
import numpy as np
import pyarrow as pa
import math
import random
import datetime

# Creating Fake Simulation Data To Then Pretend It's Live Telemetry Data

# Note: Each characteristic does not act in relation to each other as it would
# in real life, but the indvidual characteristics themselves are reflective of reality(if that makes any sense)

# Cols 0-27: Acc Temp(Cel)
# Cols 28-55: Acc Voltage(V)
# Cols 56-57: Break Pressure Front & Rear(PSI)
# Col 58: Current to Acc(A)
# Cols 59-62: Hall Effect Sensors - FL,FR,RL,RR(Hz)
# Col 63: Altitude(ft)
# Col 64: Latitude(ft)
# Col 65: Longitude(ft)
# Col 66: Speed(mph)
# Col 67-69: x,y, and z acceleration(m/s^2)
# Col 70-72: x, y, and z gyro(deg)
# Cols 73-76: Suspension Travel - FL,FR,RL,RR(V)
# Cols 77-80: Suspension Force - FL,FR,RL,RR(Oh)
# Col 81: Acc Air Intake Temp(C)
# Col 82: Acc Air Exhaust Temp(C)
# Col 83: Steering(Deg)
# Col 84: Acc Air Intake Pressure(PSI)
# Col 85: Acc Intake Air Flow Rate(m^3/sec)

# data_columns = {
#     "Acc Temp 1(Cel)": pa.float32(),
#     "Acc Temp 2(Cel)": pa.float32(),
#     "Acc Temp 3(Cel)": pa.float32(),
#     "Acc Temp 4(Cel)": pa.float32(),
#     "Acc Temp 5(Cel)": pa.float32(),
#     "Acc Temp 6(Cel)": pa.float32(),
#     "Acc Temp 7(Cel)": pa.float32(),
#     "Acc Temp 8(Cel)": pa.float32(),
#     "Acc Temp 9(Cel)": pa.float32(),
#     "Acc Temp 10(Cel)": pa.float32(),
#     "Acc Temp 11(Cel)": pa.float32(),
#     "Acc Temp 12(Cel)": pa.float32(),
#     "Acc Temp 13(Cel)": pa.float32(),
#     "Acc Temp 14(Cel)": pa.float32(),
#     "Acc Temp 15(Cel)": pa.float32(),
#     "Acc Temp 16(Cel)": pa.float32(),
#     "Acc Temp 17(Cel)": pa.float32(),
#     "Acc Temp 18(Cel)": pa.float32(),
#     "Acc Temp 19(Cel)": pa.float32(),
#     "Acc Temp 20(Cel)": pa.float32(),
#     "Acc Temp 21(Cel)": pa.float32(),
#     "Acc Temp 22(Cel)": pa.float32(),
#     "Acc Temp 23(Cel)": pa.float32(),
#     "Acc Temp 24(Cel)": pa.float32(),
#     "Acc Temp 25(Cel)": pa.float32(),
#     "Acc Temp 26(Cel)": pa.float32(),
#     "Acc Temp 27(Cel)": pa.float32(),
#     "Acc Temp 28(Cel)": pa.float32(),
#     "Acc Voltage 1(V)": pa.float32(),
#     "Acc Voltage 2(V)": pa.float32(),
#     "Acc Voltage 3(V)": pa.float32(),
#     "Acc Voltage 4(V)": pa.float32(),
#     "Acc Voltage 5(V)": pa.float32(),
#     "Acc Voltage 6(V)": pa.float32(),
#     "Acc Voltage 7(V)": pa.float32(),
#     "Acc Voltage 8(V)": pa.float32(),
#     "Acc Voltage 9(V)": pa.float32(),
#     "Acc Voltage 10(V)": pa.float32(),
#     "Acc Voltage 11(V)": pa.float32(),
#     "Acc Voltage 12(V)": pa.float32(),
#     "Acc Voltage 13(V)": pa.float32(),
#     "Acc Voltage 14(V)": pa.float32(),
#     "Acc Voltage 15(V)": pa.float32(),
#     "Acc Voltage 16(V)": pa.float32(),
#     "Acc Voltage 17(V)": pa.float32(),
#     "Acc Voltage 18(V)": pa.float32(),
#     "Acc Voltage 19(V)": pa.float32(),
#     "Acc Voltage 20(V)": pa.float32(),
#     "Acc Voltage 21(V)": pa.float32(),
#     "Acc Voltage 22(V)": pa.float32(),
#     "Acc Voltage 23(V)": pa.float32(),
#     "Acc Voltage 24(V)": pa.float32(),
#     "Acc Voltage 25(V)": pa.float32(),
#     "Acc Voltage 26(V)": pa.float32(),
#     "Acc Voltage 27(V)": pa.float32(),
#     "Acc Voltage 28(V)": pa.float32(),
#     "Brake Pressure Front(PSI)": pa.float32(),
#     "Brake Pressure Rear(PSI)": pa.float32(),
#     "Current to Acc(A)": pa.float32(),
#     "Hall Effect Sensor - FL(Hz)": pa.float32(),
#     "Hall Effect Sensor - FR(Hz)": pa.float32(),
#     "Hall Effect Sensor - RL(Hz)": pa.float32(),
#     "Hall Effect Sensor - RR(Hz)": pa.float32(),
#     "Altitude(ft)": pa.float32(),
#     "Latitude(ft)": pa.float32(),
#     "Longitude(ft)": pa.float32(),
#     "Speed(mph)": pa.float32(),
#     "x acceleration(m/s^2)": pa.float32(),
#     "y acceleration(m/s^2)": pa.float32(),
#     "z acceleration(m/s^2)": pa.float32(),
#     "x gyro(deg)": pa.float32(),
#     "y gyro(deg)": pa.float32(),
#     "z gyro(deg)": pa.float32(),
#     "Suspension Travel - FL(V)": pa.float32(),
#     "Suspension Travel - FR(V)": pa.float32(),
#     "Suspension Travel - RL(V)": pa.float32(),
#     "Suspension Travel - RR(V)": pa.float32(),
#     "Suspension Force - FL(Oh)": pa.float32(),
#     "Suspension Force - FR(Oh)": pa.float32(),
#     "Suspension Force - RL(Oh)": pa.float32(),
#     "Suspension Force - RR(Oh)": pa.float32(),
#     "Acc Air Intake Temp(C)": pa.float32(),
#     "Acc Air Exhaust Temp(C)": pa.float32(),
#     "Steering(Deg)": pa.float32(),
#     "Acc Air Intake Pressure(PSI)": pa.float32(),
#     "Acc Intake Air Flow Rate(m^3/sec)": pa.float32(),
# }
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
    simLength: float = 5.0  # how many seconds to run the simulation for
    simStepsPerSec: int = 100  # how many simulation steps per second
    # rowcount = int(simLength * simStepsPerSec)
    rowcount = 1

    column_names = list(data_columns.keys())
    total_cols = len(column_names)
    # table = [rowcount][total_cols]

    # Initialize the data array
    data = np.zeros((rowcount, total_cols))

    # Generate Acc Temp Data
    for col in range(0, 28):
        # horiz_shift = random.uniform(-0.5, 0.5)
        # time = np.arange(rowcount) / simStepsPerSec
        # data[:, col] = 1 + np.sin(time - horiz_shift) * 0.5
        t = (datetime.datetime.now() - t0).total_seconds()
        data[:, col] = math.sin(t)

    # Generate Acc Voltage Data
    for col in range(28, 56):
        horiz_shift = random.uniform(-0.3, 0.3)
        time = np.arange(rowcount) / simStepsPerSec
        data[:, col] = 1 + np.sin(time - horiz_shift) * 0.5

    # Brake Pressure
    data[: int(300), 56:58] = 0  # First 3 seconds are zero
    data[300:, 56] = (
        np.arange(300, rowcount) / simStepsPerSec
    ) * 0.5 - 3  # Arbitrary equation for brake pressure

    # Current to Acc
    total_voltage = 6000  # Arbitrary voltage
    resistance = 50  # Arbitrary resistance
    capacitance = 300  # Arbitrary capacitance
    data[:, 58] = (
        total_voltage
        / resistance
        * np.exp(-np.arange(rowcount) / (resistance * capacitance))
    )

    # RPM Wheel Data
    for col in range(59, 63):
        time = np.arange(rowcount) / simStepsPerSec
        data[:, col] = np.where(
            time < 4, 1000 * time, 4000
        )  # Linear eq up to 4 seconds, then peak

    # Altitude and Latitude: Assuming constant at 0
    data[:, 63] = 0  # Altitude
    data[:, 64] = 0  # Latitude

    # Longitude: Arbitrary quadratic function
    data[:, 65] = 10.73 * (np.arange(rowcount) / simStepsPerSec) ** 2

    # Speed: Same arbitrary acceleration
    data[:, 66] = 10.73 * (np.arange(rowcount) / simStepsPerSec)

    # Assuming gyro is 0
    data[:, 70:73] = 0

    # I do not have enough physics knowledge to do these
    data[:, 73:] = 0

    data[:, 2] = (datetime.datetime.now() - t0).total_seconds()

    # df = pl.DataFrame(data, schema=column_names).cast(pl.Float32)
    # timestamps = pl.Series(
    #     "Timestamp(s)", [(datetime.datetime.now() - t0).total_seconds()]
    # ).cast(pl.Float32)
    # return df.with_columns(timestamps)
    return pl.DataFrame(data, schema=column_names).cast(pl.Float32)

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
