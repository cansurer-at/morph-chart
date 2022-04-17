export declare type DataPoint = {
    value: number;
    label: string | null;
};
export declare type DataPoints = {
    maxDataPoints?: number;
    points: DataPoint[];
};
export declare type ChartData = {
    chartLabels: string[] | null;
    chartData: DataPoints[];
    title?: string;
    graphColor?: string;
    buttonColor?: string;
    header?: {
        currentValue: {
            display: boolean;
            update?: boolean;
            prefix?: string;
            suffix?: string;
        };
        percentageChange: {
            display: boolean;
            update?: boolean;
        };
        labels: {
            display: boolean;
            update?: boolean;
        };
    };
    cursor?: {
        display: boolean;
        lineColor: string | null;
        cursorColor: string | null;
    };
    currentValueDisplayPrefix?: string;
    partialGraph?: boolean;
};
export declare type ChartCursor = {
    x: number;
    y: number;
    show: boolean;
};
export declare type DynamicHeaderData = {
    title: string | undefined;
    dataPointValue: number | null;
    percentChange: number | null;
    label: string | null;
};
export declare type HeaderConfig = {
    currentValue: {
        display: boolean;
        update?: boolean;
        prefix?: string;
        suffix?: string;
    };
    percentageChange: {
        display: boolean;
        update?: boolean;
    };
    labels: {
        display: boolean;
        update?: boolean;
    };
};
