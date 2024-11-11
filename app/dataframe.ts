export default class DataFrame {

  // Fields need to be initizlied to a default value so that the constructor
  // can call Object.keys(this) to enumerate them
  "Timestamp(s)": number = 0;
  "Acc Temp 1(Cel)": number = 0;
  "Acc Temp 2(Cel)": number = 0;
  "Acc Temp 3(Cel)": number = 0;
  "Acc Temp 4(Cel)": number = 0;
  "Acc Temp 5(Cel)": number = 0;
  "Acc Temp 6(Cel)": number = 0;
  "Acc Temp 7(Cel)": number = 0;
  "Acc Temp 8(Cel)": number = 0;
  "Acc Temp 9(Cel)": number = 0;
  "Acc Temp 10(Cel)": number = 0;
  "Acc Temp 11(Cel)": number = 0;
  "Acc Temp 12(Cel)": number = 0;
  "Acc Temp 13(Cel)": number = 0;
  "Acc Temp 14(Cel)": number = 0;
  "Acc Temp 15(Cel)": number = 0;
  "Acc Temp 16(Cel)": number = 0;
  "Acc Temp 17(Cel)": number = 0;
  "Acc Temp 18(Cel)": number = 0;
  "Acc Temp 19(Cel)": number = 0;
  "Acc Temp 20(Cel)": number = 0;
  "Acc Temp 21(Cel)": number = 0;
  "Acc Temp 22(Cel)": number = 0;
  "Acc Temp 23(Cel)": number = 0;
  "Acc Temp 24(Cel)": number = 0;
  "Acc Temp 25(Cel)": number = 0;
  "Acc Temp 26(Cel)": number = 0;
  "Acc Temp 27(Cel)": number = 0;
  "Acc Temp 28(Cel)": number = 0;

  "Acc Voltage 1(V)": number = 0;
  "Acc Voltage 2(V)": number = 0;
  "Acc Voltage 3(V)": number = 0;
  "Acc Voltage 4(V)": number = 0;
  "Acc Voltage 5(V)": number = 0;
  "Acc Voltage 6(V)": number = 0;
  "Acc Voltage 7(V)": number = 0;
  "Acc Voltage 8(V)": number = 0;
  "Acc Voltage 9(V)": number = 0;
  "Acc Voltage 10(V)": number = 0;
  "Acc Voltage 11(V)": number = 0;
  "Acc Voltage 12(V)": number = 0;
  "Acc Voltage 13(V)": number = 0;
  "Acc Voltage 14(V)": number = 0;
  "Acc Voltage 15(V)": number = 0;
  "Acc Voltage 16(V)": number = 0;
  "Acc Voltage 17(V)": number = 0;
  "Acc Voltage 18(V)": number = 0;
  "Acc Voltage 19(V)": number = 0;
  "Acc Voltage 20(V)": number = 0;
  "Acc Voltage 21(V)": number = 0;
  "Acc Voltage 22(V)": number = 0;
  "Acc Voltage 23(V)": number = 0;
  "Acc Voltage 24(V)": number = 0;
  "Acc Voltage 25(V)": number = 0;
  "Acc Voltage 26(V)": number = 0;
  "Acc Voltage 27(V)": number = 0;
  "Acc Voltage 28(V)": number = 0;

  "Brake Pressure Front(PSI)": number = 0;
  "Brake Pressure Rear(PSI)": number = 0;
  "Current to Acc(A)": number = 0;

  "Hall Effect Sensor - FL(Hz)": number = 0;
  "Hall Effect Sensor - FR(Hz)": number = 0;
  "Hall Effect Sensor - RL(Hz)": number = 0;
  "Hall Effect Sensor - RR(Hz)": number = 0;

  "Altitude(ft)": number = 0;
  "Latitude(ft)": number = 0;
  "Longitude(ft)": number = 0;
  "Speed(mph)": number = 0;

  "x acceleration(m/s^2)": number = 0;
  "y acceleration(m/s^2)": number = 0;
  "z acceleration(m/s^2)": number = 0;

  "x gyro(deg)": number = 0;
  "y gyro(deg)": number = 0;
  "z gyro(deg)": number = 0;

  "Suspension Travel - FL(V)": number = 0;
  "Suspension Travel - FR(V)": number = 0;
  "Suspension Travel - RL(V)": number = 0;
  "Suspension Travel - RR(V)": number = 0;
  "Suspension Force - FL(Oh)": number = 0;
  "Suspension Force - FR(Oh)": number = 0;
  "Suspension Force - RL(Oh)": number = 0;
  "Suspension Force - RR(Oh)": number = 0;

  "Acc Air Intake Temp(C)": number = 0;
  "Acc Air Exhaust Temp(C)": number = 0;

  "Steering(Deg)": number = 0;

  "Acc Air Intake Pressure(PSI)": number = 0;
  "Acc Intake Air Flow Rate(m^3/sec)": number = 0;

  constructor(values: number[]) {
    // Get all the keys of the class
    const keys = Object.keys(this);

    if (values.length != keys.length) {
      console.warn(`WARN: ${values.length} columns recieved instead of ${keys.length}!`);
    }

    // Assign values from the array to the fields
    keys.forEach((key, index) => {
      (this as any)[key] = index < values.length ? values[index] : null;
    });
  }
}
