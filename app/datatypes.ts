import { Field, Precision, Schema } from "apache-arrow";
import { Float, Float32, Int64, Timestamp, Utf8 } from "apache-arrow/type";

// (just a shorter alias)
const float32 = new Float(Precision.SINGLE);

const columnDataTypes = {
  "Acc Temp 1(Cel)": float32,
  "Acc Temp 2(Cel)": float32,
  "Acc Temp 3(Cel)": float32,
  "Acc Temp 4(Cel)": float32,
  "Acc Temp 5(Cel)": float32,
  "Acc Temp 6(Cel)": float32,
  "Acc Temp 7(Cel)": float32,
  "Acc Temp 8(Cel)": float32,
  "Acc Temp 9(Cel)": float32,
  "Acc Temp 10(Cel)": float32,
  "Acc Temp 11(Cel)": float32,
  "Acc Temp 12(Cel)": float32,
  "Acc Temp 13(Cel)": float32,
  "Acc Temp 14(Cel)": float32,
  "Acc Temp 15(Cel)": float32,
  "Acc Temp 16(Cel)": float32,
  "Acc Temp 17(Cel)": float32,
  "Acc Temp 18(Cel)": float32,
  "Acc Temp 19(Cel)": float32,
  "Acc Temp 20(Cel)": float32,
  "Acc Temp 21(Cel)": float32,
  "Acc Temp 22(Cel)": float32,
  "Acc Temp 23(Cel)": float32,
  "Acc Temp 24(Cel)": float32,
  "Acc Temp 25(Cel)": float32,
  "Acc Temp 26(Cel)": float32,
  "Acc Temp 27(Cel)": float32,
  "Acc Temp 28(Cel)": float32,
  "Acc Voltage 1(V)": float32,
  "Acc Voltage 2(V)": float32,
  "Acc Voltage 3(V)": float32,
  "Acc Voltage 4(V)": float32,
  "Acc Voltage 5(V)": float32,
  "Acc Voltage 6(V)": float32,
  "Acc Voltage 7(V)": float32,
  "Acc Voltage 8(V)": float32,
  "Acc Voltage 9(V)": float32,
  "Acc Voltage 10(V)": float32,
  "Acc Voltage 11(V)": float32,
  "Acc Voltage 12(V)": float32,
  "Acc Voltage 13(V)": float32,
  "Acc Voltage 14(V)": float32,
  "Acc Voltage 15(V)": float32,
  "Acc Voltage 16(V)": float32,
  "Acc Voltage 17(V)": float32,
  "Acc Voltage 18(V)": float32,
  "Acc Voltage 19(V)": float32,
  "Acc Voltage 20(V)": float32,
  "Acc Voltage 21(V)": float32,
  "Acc Voltage 22(V)": float32,
  "Acc Voltage 23(V)": float32,
  "Acc Voltage 24(V)": float32,
  "Acc Voltage 25(V)": float32,
  "Acc Voltage 26(V)": float32,
  "Acc Voltage 27(V)": float32,
  "Acc Voltage 28(V)": float32,
  "Brake Pressure Front(PSI)": float32,
  "Brake Pressure Rear(PSI)": float32,
  "Current to Acc(A)": float32,
  "Hall Effect Sensor - FL(Hz)": float32,
  "Hall Effect Sensor - FR(Hz)": float32,
  "Hall Effect Sensor - RL(Hz)": float32,
  "Hall Effect Sensor - RR(Hz)": float32,
  "Altitude(ft)": float32,
  "Latitude(ft)": float32,
  "Longitude(ft)": float32,
  "Speed(mph)": float32,
  "x acceleration(m/s^2)": float32,
  "y acceleration(m/s^2)": float32,
  "z acceleration(m/s^2)": float32,
  "x gyro(deg)": float32,
  "y gyro(deg)": float32,
  "z gyro(deg)": float32,
  "Suspension Travel - FL(V)": float32,
  "Suspension Travel - FR(V)": float32,
  "Suspension Travel - RL(V)": float32,
  "Suspension Travel - RR(V)": float32,
  "Suspension Force - FL(Oh)": float32,
  "Suspension Force - FR(Oh)": float32,
  "Suspension Force - RL(Oh)": float32,
  "Suspension Force - RR(Oh)": float32,
  "Acc Air Intake Temp(C)": float32,
  "Acc Air Exhaust Temp(C)": float32,
  "Steering(Deg)": float32,
  "Acc Air Intake Pressure(PSI)": float32,
  "Acc Intake Air Flow Rate(m^3/sec)": float32,
  "Timestamp(s)": float32,
};
export const columnNames = Object.keys(columnDataTypes) as ColumnName[];

// columnDataTypes and columnNames are for use at runtime; everything with a
// PascalCase name is purely for type-checking at compile time

// A type for column names mapped to their datatype
export type DataRow = typeof columnDataTypes;

// Union of all Column names
export type ColumnName = keyof DataRow;

// Maps keynames to vectors of that datatype, in the same fashion as "struct of
// arrays"
export type DataArrays = {
  // [K in keyof DataRow]: DataRow[K]["TArray"]; // for typed arrays
  [K in keyof DataRow]: DataRow[K]["TValue"][]; // for regular arrays
};

// Generate a dictionary with keys for each column name that are mapped to empty
// but preallocated TypedArrays of size `len`.
export function emptyDataArrays(/*rows: number*/): DataArrays {
  return columnNames.reduce((acc, key) => {
    // for typed arrays:
    // acc[key] = new columnDataTypes[key].ArrayType(rows);
    // for regular arrays:
    acc[key] = new Array();
    return acc;
  }, {} as DataArrays);
}

// list of Field objects for Table's Schema (basically just (keyname,type) pairs)
const fields = columnNames.map((key) =>
  // for now we use nullabe: true. Eventually the backend should alleviate this
  Field.new({ name: key, type: columnDataTypes[key], nullable: true }),
);

// This schema is only used for initial instantiation of the empty arrow Table.
// I found that it's consistently slower to create the Table from record batches
// with a schema specified.
// This must be *exactly* identical to the schema sent over the websocket,
// otherwise table creation will fail.
export const schema = new Schema<DataRow>(fields);
