import polars as pl
import numpy as np
import math
import random
import datetime

#Creating Fake Simulation Data To Then Pretend It's Live Telemetry Data

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

t0 = datetime.datetime.now()
def createdf():
    simLength:float = 5.0       # how many seconds to run the simulation for
    simStepsPerSec:int = 100    # how many simulation steps per second
    # rowcount = int(simLength * simStepsPerSec)
    rowcount = 1

    data_columns = (
        "Acc Temp 1(Cel);"
        "Acc Temp 2(Cel);"
        "Acc Temp 3(Cel);"
        "Acc Temp 4(Cel);"
        "Acc Temp 5(Cel);"
        "Acc Temp 6(Cel);"
        "Acc Temp 7(Cel);"
        "Acc Temp 8(Cel);"
        "Acc Temp 9(Cel);"
        "Acc Temp 10(Cel);"
        "Acc Temp 11(Cel);"
        "Acc Temp 12(Cel);"
        "Acc Temp 13(Cel);"
        "Acc Temp 14(Cel);"
        "Acc Temp 15(Cel);"
        "Acc Temp 16(Cel);"
        "Acc Temp 17(Cel);"
        "Acc Temp 18(Cel);"
        "Acc Temp 19(Cel);"
        "Acc Temp 20(Cel);"
        "Acc Temp 21(Cel);"
        "Acc Temp 22(Cel);"
        "Acc Temp 23(Cel);"
        "Acc Temp 24(Cel);"
        "Acc Temp 25(Cel);"
        "Acc Temp 26(Cel);"
        "Acc Temp 27(Cel);"
        "Acc Temp 28(Cel);"
        "Acc Voltage 1(V);"
        "Acc Voltage 2(V);"
        "Acc Voltage 3(V);"
        "Acc Voltage 4(V);"
        "Acc Voltage 5(V);"
        "Acc Voltage 6(V);"
        "Acc Voltage 7(V);"
        "Acc Voltage 8(V);"
        "Acc Voltage 9(V);"
        "Acc Voltage 10(V);"
        "Acc Voltage 11(V);"
        "Acc Voltage 12(V);"
        "Acc Voltage 13(V);"
        "Acc Voltage 14(V);"
        "Acc Voltage 15(V);"
        "Acc Voltage 16(V);"
        "Acc Voltage 17(V);"
        "Acc Voltage 18(V);"
        "Acc Voltage 19(V);"
        "Acc Voltage 20(V);"
        "Acc Voltage 21(V);"
        "Acc Voltage 22(V);"
        "Acc Voltage 23(V);"
        "Acc Voltage 24(V);"
        "Acc Voltage 25(V);"
        "Acc Voltage 26(V);"
        "Acc Voltage 27(V);"
        "Acc Voltage 28(V);"
        "Break Pressure Front(PSI);"
        "Break Pressure Rear(PSI);"
        "Current to Acc(A);"
        "Hall Effect Sensor - FL(Hz);"
        "Hall Effect Sensor - FR(Hz);"
        "Hall Effect Sensor - RL(Hz);"
        "Hall Effect Sensor - RR(Hz);"
        "Altitude(ft);"
        "Latitude(ft);"
        "Longitude(ft);"
        "Speed(mph);"
        "x acceleration(m/s^2);"
        "y acceleration(m/s^2);"
        "z acceleration(m/s^2);"
        "x gyro(deg);"
        "y gyro(deg);"
        "z gyro(deg);"
        "Suspension Travel - FL(V);"
        "Suspension Travel - FR(V);"
        "Suspension Travel - RL(V);"
        "Suspension Travel - RR(V);"
        "Suspension Force - FL(Oh);"
        "Suspension Force - FR(Oh);"
        "Suspension Force - RL(Oh);"
        "Suspension Force - RR(Oh);"
        "Acc Air Intake Temp(C);"
        "Acc Air Exhaust Temp(C);"
        "Steering(Deg);"
        "Acc Air Intake Pressure(PSI);"
        "Acc Intake Air Flow Rate(m^3/sec)"
    )

    column_names = data_columns.split(";")
    total_cols = len(column_names)
    #table = [rowcount][total_cols]

    # Initialize the data array
    data = np.zeros((rowcount, total_cols))

    # Generate Acc Temp Data
    for col in range(0, 28):
        horiz_shift = random.uniform(-0.5, 0.5)
        time = np.arange(rowcount) / simStepsPerSec
        data[:, col] = 1 + np.sin(time - horiz_shift) * 0.5

    # Generate Acc Voltage Data
    for col in range(28, 56):
        horiz_shift = random.uniform(-0.3, 0.3)
        time = np.arange(rowcount) / simStepsPerSec
        data[:, col] = 1 + np.sin(time - horiz_shift) * 0.5

    # Brake Pressure
    data[:int(300), 56:58] = 0  # First 3 seconds are zero
    data[300:, 56] = (np.arange(300, rowcount) / simStepsPerSec) * 0.5 - 3  # Arbitrary equation for brake pressure

    # Current to Acc
    total_voltage = 6000  # Arbitrary voltage
    resistance = 50  # Arbitrary resistance
    capacitance = 300  # Arbitrary capacitance
    data[:, 58] = total_voltage / resistance * np.exp(-np.arange(rowcount) / (resistance * capacitance))

    # RPM Wheel Data
    for col in range(59, 63):
        time = np.arange(rowcount) / simStepsPerSec
        data[:, col] = np.where(time < 4, 1000 * time, 4000)  # Linear eq up to 4 seconds, then peak

    # Altitude and Latitude: Assuming constant at 0
    data[:, 63] = 0  # Altitude
    data[:, 64] = 0  # Latitude

    # Longitude: Arbitrary quadratic function
    data[:, 65] = 10.73 * (np.arange(rowcount) / simStepsPerSec) ** 2

    # Speed: Same arbitrary acceleration
    data[:, 66] = 10.73 * (np.arange(rowcount) / simStepsPerSec)

    #Assuming gyro is 0
    data[:, 70:73] = 0

    #I do not have enough physics knowledge to do these
    data[:, 73:] = 0

    return pl.DataFrame(data, schema = column_names)
