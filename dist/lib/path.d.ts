import { Vector } from "./math";
interface Curve {
    to: Vector;
    c1: Vector;
    c2: Vector;
}
export declare type Path = {
    move: Vector;
    curves: Curve[];
    close: boolean;
};
export declare const createPath: (move: Vector) => Path;
export declare const close: (path: Path) => void;
export declare const addCurve: (path: Path, c: Curve) => void;
export declare const parse: (d: string) => Path;
interface SelectedCurve {
    from: Vector;
    curve: Curve;
}
export declare const selectCurve: (path: Path, x: number) => SelectedCurve;
export declare const getYForX: (path: Path, x: number, precision?: number) => number;
export {};
