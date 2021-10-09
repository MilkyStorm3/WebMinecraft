import { gl } from "../Setup"
import { Vector3, Vector4, Matrix4, Quaternion, Matrix4x4, Float32Vector2, Float32Vector3 } from 'matrixgl';


interface CameraSettings {
    fovYRadian: number,
    aspectRatio: number,
    near: number,
    far: number
}


export class Camera {
    private m_projectionMatrix: Matrix4x4;

    constructor(settings: CameraSettings, public position: Float32Vector3 = new Vector3(0,0,0)) {
        this.m_projectionMatrix = Matrix4.perspective(settings);
    }

    public GetPvMatrix(): Matrix4x4 {

        //Camera trasformation matrix
        let viewMatrix = Matrix4.identity().translate(this.position.x, this.position.y,this.position.z);
        return this.m_projectionMatrix.mulByMatrix4x4(viewMatrix);

    }
}

