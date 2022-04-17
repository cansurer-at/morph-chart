import { ChartData, DataPoint, DataPoints } from "../types/types";
import { Path } from "./path";
import React from "react";
declare type PathData = {
    minPrice: number;
    maxPrice: number;
    datapoints: DataPoints;
    path: string;
};
export default class ChartModel {
    data: ChartData;
    width: number;
    height: number;
    state: number;
    pathData: PathData;
    parsedPath: Path;
    morphing: boolean;
    /**
     *
     */
    constructor(_data: ChartData, _width: number, _height: number, _state: number);
    calcPath: () => PathData;
    changeState: (state: number, morph: boolean | undefined, ref: React.RefObject<SVGPathElement>) => void;
    morphPath: (oldPath: string, newPath: (t: number) => string, newState: number, graphRef: React.RefObject<SVGPathElement>) => void;
    getInterpolatedPath: () => (t: number) => string;
    getXYValues: (xPosition: number, maxDataPoints: number) => {
        dataPointsIndex: number;
        xValue: number;
        yValue: number;
    };
    getYOnGraph: (x: number) => number;
    getMaxDataPoints: () => number;
    getPercentChangeFromIndex: (index: number) => number;
    getLatestDataPoint: () => DataPoint;
    getDataPointByIndex: (index: number) => DataPoint;
    getDataPointsLength: () => number;
}
export {};
