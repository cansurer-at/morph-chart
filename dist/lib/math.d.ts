export interface Vector<T = number> {
    x: T;
    y: T;
}
export declare const cubicBezier: (t: number, from: number, c1: number, c2: number, to: number) => number;
export declare const round: (value: number, precision?: number) => number;
export declare const cubicBezierYForX: (x: number, a: Vector, b: Vector, c: Vector, d: Vector, precision?: number) => number;
export declare const mapValues: (value: number, inputRange: number[], outputRange: number[]) => number;
export declare const relativePercent: (price: number, startPrice: number) => number;
