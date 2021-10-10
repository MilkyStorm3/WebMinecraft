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


    public m_cameraTarget = new Vector3(0,0,0); //? we assume that the camera is always looking at the origin of the coordinate system
    public cameraDirection = new Vector3(0,0,1); //? direction
    public cameraUp = new Vector3(0,1,0);
    
    public GetPvMatrix(): Matrix4x4 {
        
        // let mtx = Matrix4.lookAt(this.position,this.m_cameraTarget,new Vector3(0,1,0));
      
        //! lookat = position + front-direction
        let mtx = Matrix4.lookAt(this.position,this.position.add(this.cameraDirection), this.cameraUp);

        return this.m_projectionMatrix.mulByMatrix4x4(mtx);
    }
}

