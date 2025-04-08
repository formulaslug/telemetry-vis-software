import { ColumnName } from "@/app/data-processing/datatypes";

type YAxisInfo = {
    columnNames: ColumnName[];
    label?: string;
    units?: string;
};
type XAxisInfo = {
    columnName: ColumnName;
    label?: string;
    units?: string;
};

export default interface StackedLineChartConfig {
    yAxesInfo: YAxisInfo[];
    xAxisInfo: XAxisInfo;

    title?: string;
}
