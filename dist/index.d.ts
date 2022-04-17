import React from "react";
import { ChartData, DynamicHeaderData } from "./types/types";
declare type ChartProps = {
    width: number;
    height: number;
    data: ChartData;
    children?: (headerData: DynamicHeaderData) => React.ReactNode;
};
declare const Chart: ({ width, height, data, children }: ChartProps) => JSX.Element;
export default Chart;
