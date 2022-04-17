import { ChartData, DataPoints, HeaderConfig } from "../types/types";
export default class DataLoader {
    chartLabels: string[] | null;
    chartData: DataPoints[];
    title?: string;
    graphColor: string;
    buttonColor?: string;
    header: HeaderConfig;
    cursor: {
        display: boolean;
        lineColor: string | null;
        cursorColor: string | null;
    };
    currentValueDisplayPrefix: string;
    partialGraph: boolean;
    /**
     * Assign default values if not given
     */
    constructor({ chartLabels, chartData, title, graphColor, buttonColor, header, cursor, currentValueDisplayPrefix, partialGraph }: ChartData);
    throwErrorOnInvalidParameters: (data: ChartData) => void;
}
