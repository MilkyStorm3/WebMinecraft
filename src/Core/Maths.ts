import { Float32Vector2, Float32Vector3, Float32Vector4, Matrix4, Matrix4x4, Vector2, Vector3, Vector4 } from "matrixgl";

export class MyMath {
    constructor() {}

    public static CalcDistance3D(p0: Float32Vector3, p1: Float32Vector3): number {
        return Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2 + (p1.z - p0.z) ** 2);
    }

    public static MulVectorByMatrix(vec: Float32Vector4, mtx: Matrix4x4): Float32Vector4 {

        let mat = mtx.values;

        let x = mat[0] * vec.x + mat[1] * vec.y + mat[2] * vec.z + mat[3] * vec.w;
        let y = mat[4] * vec.x + mat[5] * vec.y + mat[6] * vec.z + mat[7] * vec.w;
        let z = mat[8] * vec.x + mat[9] * vec.y + mat[10] * vec.z + mat[11] * vec.w;
        let w = mat[12] * vec.x + mat[13] * vec.y + mat[14] * vec.z + mat[15] * vec.w;

        return new Vector4(x, y, z, w);
    }

}