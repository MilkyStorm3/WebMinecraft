import { gl } from "../Setup"
import { Vector3, Vector4, Matrix4, Quaternion, Matrix4x4, Float32Vector2, Float32Vector3 } from 'matrixgl';


interface CameraSettings {
    fovYRadian: number,
    aspectRatio: number,
    near: number,
    far: number
}

export interface ControlKeyMap {

    W: boolean,
    S: boolean,
    A: boolean,
    D: boolean,
    Space: boolean,
    Shift: boolean
}

export class Camera {
    private m_projectionMatrix: Matrix4x4;
    private m_settings: CameraSettings;

    constructor(settings: CameraSettings, public position: Float32Vector3 = new Vector3(0, 0, 0)) {
        this.m_settings = settings;
        this.m_projectionMatrix = Matrix4.perspective(this.m_settings);
    }


    private m_cameraTarget = new Vector3(0, 0, 0); //? we assume that the camera is always looking at the origin of the coordinate system
    private cameraUp = new Vector3(0, 1, 0);
    
    public cameraDirection = new Vector3(0, 0, 1); //? direction
    public cameraSpeed: number = 0.2;

    public GetPvMatrix(): Matrix4x4 {

        // let mtx = Matrix4.lookAt(this.position,this.m_cameraTarget,new Vector3(0,1,0));

        //! lookat = position + front-direction
        let mtx = Matrix4.lookAt(this.position, this.position.add(this.cameraDirection), this.cameraUp);

        return this.m_projectionMatrix.mulByMatrix4x4(mtx);
    }

    public SetFov(fovRadian: number) {
        this.m_settings.fovYRadian = fovRadian;
        this.m_projectionMatrix = Matrix4x4.perspective(this.m_settings);
    }

    public OnKey(keyMap: ControlKeyMap) {

        if (keyMap.W) {
            let add = this.cameraDirection.mulByScalar(this.cameraSpeed);
            this.position = this.position.add(add);
        }

        if (keyMap.S) {
            let sub = this.cameraDirection.mulByScalar(this.cameraSpeed);
            this.position = this.position.sub(sub);
        }

        if (keyMap.A) {
            let sub2 = this.cameraDirection.cross(this.cameraUp).normalize().mulByScalar(this.cameraSpeed);
            this.position = this.position.sub(sub2);
        }
        if (keyMap.D) {
            let add2 = this.cameraDirection.cross(this.cameraUp).normalize().mulByScalar(this.cameraSpeed);
            this.position = this.position.add(add2);
        }

        if (keyMap.Shift) {
            this.position.y -= this.cameraSpeed;
        }

        if (keyMap.Space) {
            this.position.y += this.cameraSpeed;
        }

    }
}

