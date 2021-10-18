import { Tile } from "./TileMap";
import { Texture } from "./Texture";
import { VertexBuffer, IndexBuffer, LayoutAttribute } from "./Buffer";
import { gl, Init } from "../Setup";
import { Shader } from "./Shader";
import { Float32Vector2, Float32Vector3, Float32Vector4, Matrix3x3, Matrix4, Matrix4x4, Vector2, Vector3, Vector4 } from "matrixgl";
import { Camera } from "./Camera";
import { Ray } from "./Ray";
import { MyMath } from "../Maths"

const UnitCubeVertexData = [

    // Front
    0.5, 0.5, 0.5, // top right 
    0.5, -.5, 0.5, // bottom right
    -.5, 0.5, 0.5, // top left
    -.5, 0.5, 0.5, // top left
    0.5, -.5, 0.5, // bottom right
    -.5, -.5, 0.5, // bottom left 
    //OK

    // Left
    -.5, 0.5, 0.5, // positove z is further
    -.5, -.5, 0.5,
    -.5, 0.5, -.5,
    -.5, 0.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, -.5,

    // Back
    .5, 0.5, -.5,
    .5, -.5, -.5,
    -0.5, 0.5, -.5,
    -0.5, 0.5, -.5,
    .5, -.5, -.5,
    -0.5, -.5, -.5,

    // Right
    0.5, 0.5, -.5,
    0.5, -.5, -.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    0.5, -.5, -.5,

    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, -.5,
    //OK

    // Underside
    0.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, -.5,
];


function GenSymetricTextureCoordinates(tile: Tile) {
    return [
        //FRONT
        tile.left, tile.top, // top left
        tile.left, tile.bottom,  // bottom left 
        tile.right, tile.top, // top right

        tile.right, tile.top, // top right
        tile.left, tile.bottom,  // bottom left 
        tile.right, tile.bottom, // bottom right


        tile.left, tile.top, // top left
        tile.left, tile.bottom,  // bottom left 
        tile.right, tile.top, // top right

        tile.right, tile.top, // top right
        tile.left, tile.bottom,  // bottom left 
        tile.right, tile.bottom, // bottom right


        //back
        tile.right, tile.top, // top right
        tile.right, tile.bottom, // bottom right
        tile.left, tile.top, // top left

        tile.left, tile.top, // top left
        tile.right, tile.bottom, // bottom right
        tile.left, tile.bottom,  // bottom left 
        //Right

        tile.left, tile.top,
        tile.left, tile.bottom,
        tile.right, tile.top,
        tile.right, tile.top,
        tile.right, tile.bottom,
        tile.left, tile.bottom,

        //Top
        tile.right, tile.top, // top right
        tile.right, tile.bottom, // bottom right
        tile.left, tile.top, // top left

        tile.left, tile.top, // top left
        tile.right, tile.bottom, // bottom right
        tile.left, tile.bottom,  // bottom left 


        //Underside

        tile.right, tile.bottom,
        tile.right, tile.top,
        tile.left, tile.bottom,
        tile.left, tile.bottom,
        tile.right, tile.top,
        tile.left, tile.top,


    ];
}

const vertCode =
    `attribute vec3 position;
    uniform mat4 CameraMatrix;
    uniform mat4 Mmatrix;
    // attribute vec3 color;
    attribute vec2 tex;
    // varying vec3 vColor;
    varying vec2 vTex;
    void main(void) { 
    gl_Position = CameraMatrix*Mmatrix*vec4(position, 1.);
    // vColor = color;
    vTex = tex;
    }`;

const fragCode =
    `
    precision mediump float;
    // varying vec3 vColor;
    varying vec2 vTex;
    uniform sampler2D texId;
    void main(void) {
    // gl_FragColor = vec4(vColor, 1.);
    // gl_FragColor = vec4(1.0,1.0,1.0, 1.);
    gl_FragColor = texture2D(texId,vTex);
    }`;

interface BoundingBox {

    min: Float32Vector3,
    max: Float32Vector3

}

export enum LookAtSide {

    None,
    Left,
    Right,
    Top,
    Bottom,
    Front,
    Rear
}

export class Cube {

    public static s_vb: VertexBuffer = new VertexBuffer();
    public static s_ib: IndexBuffer = new IndexBuffer();
    public static s_initialized: boolean = false;
    public static s_Shader: Shader = new Shader();

    public m_tb: VertexBuffer;
    public m_modelMatrix = Matrix4.identity();

    public translation = new Vector3(0, 0, 0);


    constructor() {

        if (!Cube.s_initialized) {

            let IbData: number[] = [];

            for (let index = 0; index < UnitCubeVertexData.length / 3; index++) {
                IbData.push(index);
            }
            console.log("initialized");

            Cube.s_ib.UploadData(IbData);
            Cube.s_vb.UploadData(UnitCubeVertexData);

            Cube.s_vb.layout.Add(LayoutAttribute.vec3f);
            Cube.s_vb.Bind();

            Cube.s_Shader.Compile(vertCode, fragCode);
            Cube.s_vb.layout.Apply(Cube.s_Shader.GetAttribLocation("position"));

            Cube.s_initialized = true;

        }

        this.m_tb = new VertexBuffer();
        this.m_tb.layout.Add(LayoutAttribute.vec2f);

        this.m_tb.Bind();
        this.m_tb.layout.Apply(Cube.s_Shader.GetAttribLocation("tex"));

    }

    public SetTexture(tile: Tile): void {

        this.m_tb.UploadData(GenSymetricTextureCoordinates(tile));

    }

    public Draw(cameraMatrix: Matrix4x4, modelMatrix:Matrix4x4 = Matrix4.identity()): void {

        this.m_modelMatrix = modelMatrix;        

        Cube.s_vb.Bind();
        Cube.s_ib.Bind();
        Cube.s_Shader.Bind();
        Cube.s_vb.layout.Apply(Cube.s_Shader.GetAttribLocation("position"));

        this.m_tb.Bind();
        this.m_tb.layout.Apply(1);

        Cube.s_Shader.SetUniformInt("sampler2D", 0);

        this.m_modelMatrix = this.m_modelMatrix.translate(this.translation.x, this.translation.y, this.translation.z);


        let len = UnitCubeVertexData.length / 3;

        Cube.s_Shader.SetUniformMat4("Mmatrix", this.m_modelMatrix.values);
        Cube.s_Shader.SetUniformMat4("CameraMatrix", cameraMatrix.values);
        gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);

        this.m_tb.UnBind();

    }

    public GetShader(): Shader {
        Cube.s_Shader.Bind();
        return Cube.s_Shader;
    }

    private GetBoundaries(): BoundingBox {
        let t = this.translation;

        let max = new Vector4(0.5 + t.x, 0.5 + t.y, 0.5 + t.z, 1);
        let min = new Vector4(-0.5 + t.x, -0.5 + t.y, -0.5 + t.z, 1);

        max = MyMath.MulVectorByMatrix(max, this.m_modelMatrix);
        min = MyMath.MulVectorByMatrix(min, this.m_modelMatrix);

        return {
            max: new Vector3(max.x, max.y, max.z),
            min: new Vector3(min.x, min.y, min.z)
        }
    }

    private static Intersect(ray: Ray, box: BoundingBox): boolean {

        let { min, max } = box;

        let tmin = (min.x - ray.origin.x) / ray.direction.x;
        let tmax = (max.x - ray.origin.x) / ray.direction.x;

        if (tmin > tmax) {
            [tmin, tmax] = [tmax, tmin];
        }

        let tymin = (min.y - ray.origin.y) / ray.direction.y;
        let tymax = (max.y - ray.origin.y) / ray.direction.y;

        if (tymin > tymax) {
            [tymin, tymax] = [tymax, tymin];
        }

        if ((tmin > tymax) || (tymin > tmax))
            return false;

        if (tymin > tmin)
            tmin = tymin;

        if (tymax < tmax)
            tmax = tymax;

        let tzmin = (min.z - ray.origin.z) / ray.direction.z;
        let tzmax = (max.z - ray.origin.z) / ray.direction.z;

        if (tzmin > tzmax) {
            [tzmax, tzmin] = [tzmin, tzmax];
        }

        if ((tmin > tzmax) || (tzmin > tmax))
            return false;

        if (tzmin > tmin)
            tmin = tzmin;

        if (tzmax < tmax)
            tmax = tzmax;

        return true;

    }

    public Intersects(ray: Ray): boolean {

        return Cube.Intersect(ray, this.GetBoundaries());

    }

    public GetLookAtSide(camera: Camera): LookAtSide {

        let ray = camera.GetCameraRay();

        let faces = {

            top: {
                min: new Vector3(-0.5 + this.translation.x, 0.5 + this.translation.y, -0.5 + this.translation.z),
                max: new Vector3(0.5 + this.translation.x, 0.5 + this.translation.y, 0.5 + this.translation.z),
                midPoint: new Vector3(0, 0.5, 0)
            },

            bottom: {
                min: new Vector3(-0.5 + this.translation.x, -0.5 + this.translation.y, -0.5 + this.translation.z),
                max: new Vector3(0.5 + this.translation.x, -0.5 + this.translation.y, 0.5 + this.translation.z),
                midPoint: new Vector3(0, -0.5, 0)
            },

            right: {
                min: new Vector3(-0.5 + this.translation.x, -0.5 + this.translation.y, -0.5 + this.translation.z),
                max: new Vector3(-0.5 + this.translation.x, 0.5 + this.translation.y, 0.5 + this.translation.z),
                midPoint: new Vector3(-0.5, 0, 0)
            },

            left: {
                min: new Vector3(0.5 + this.translation.x, -0.5 + this.translation.y, -0.5 + this.translation.z),
                max: new Vector3(0.5 + this.translation.x, 0.5 + this.translation.y, 0.5 + this.translation.z),
                midPoint: new Vector3(0.5, 0, 0)
            },

            front: {
                min: new Vector3(-0.5 + this.translation.x, -0.5 + this.translation.y, -0.5 + this.translation.z),
                max: new Vector3(0.5 + this.translation.x, 0.5 + this.translation.y, -0.5 + this.translation.z),
                midPoint: new Vector3(0, 0, -0.5)
            },

            rear: {
                min: new Vector3(-0.5 + this.translation.x, -0.5 + this.translation.y, 0.5 + this.translation.z),
                max: new Vector3(0.5 + this.translation.x, 0.5 + this.translation.y, 0.5 + this.translation.z),
                midPoint: new Vector3(0, 0, 0.5)
            }
        };

        let intersections = [
            { side: LookAtSide.Front, if: Cube.Intersect(ray, { min: faces.front.min, max: faces.front.max }), distance: MyMath.CalcDistance3D(ray.origin, faces.front.midPoint) },
            { side: LookAtSide.Rear, if: Cube.Intersect(ray, { min: faces.rear.min, max: faces.rear.max }), distance: MyMath.CalcDistance3D(ray.origin, faces.rear.midPoint) },
            { side: LookAtSide.Top, if: Cube.Intersect(ray, { min: faces.top.min, max: faces.top.max }), distance: MyMath.CalcDistance3D(ray.origin, faces.top.midPoint) },
            { side: LookAtSide.Bottom, if: Cube.Intersect(ray, { min: faces.bottom.min, max: faces.bottom.max }), distance: MyMath.CalcDistance3D(ray.origin, faces.bottom.midPoint) },
            { side: LookAtSide.Left, if: Cube.Intersect(ray, { min: faces.left.min, max: faces.left.max }), distance: MyMath.CalcDistance3D(ray.origin, faces.left.midPoint) },
            { side: LookAtSide.Right, if: Cube.Intersect(ray, { min: faces.right.min, max: faces.right.max }), distance: MyMath.CalcDistance3D(ray.origin, faces.right.midPoint) }
        ]

        let occured: number[] = [];

        for (let i = 0; i < intersections.length; i++) {
            const element = intersections[i];
            if (element.if) {
                occured.push(i);
            }
        }

        if (occured.length) {
            let closest = intersections[occured[0]];
            occured.forEach(idx => {
                if (closest.distance > intersections[idx].distance) {
                    closest = intersections[idx];
                }
            });
            return closest.side;
        }

        return LookAtSide.None;

    }


}