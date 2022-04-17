import React from "react";
import ChartModel from "./lib/model";
import { DynamicHeaderData } from "./types/types";
interface ChartProps {
    chartModel: ChartModel;
    children?: (headerData: DynamicHeaderData) => React.ReactNode;
}
export declare const Graph: React.FC<ChartProps>;
export {};
