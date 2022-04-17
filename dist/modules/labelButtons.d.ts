import React from "react";
import ChartModel from "../lib/model";
interface LabelButtonsProps {
    chartLabels: string[] | null;
    chartModel: ChartModel;
    handleChartChangeClick: Function;
}
export declare const LabelButtons: React.FC<LabelButtonsProps>;
export {};
