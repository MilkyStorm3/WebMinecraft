import { Tile } from "./TileMap";
import { Texture } from "./Texture";
import { VertexBuffer, IndexBuffer, LayoutAttribute } from "./Buffer";
import { gl } from "../Setup";
import { Shader } from "./Shader";
import { Matrix4} from "matrixgl";
import { Camera } from "./Camera";

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

let vertCode =
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

let fragCode =
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



export class Cube {

    public static s_vb: VertexBuffer = new VertexBuffer();
    public static s_ib: IndexBuffer = new IndexBuffer();
    public static s_initialized: boolean = false;
    public static s_Shader: Shader = new Shader();

    public m_tb: VertexBuffer;
    public m_modelMatrix = Matrix4.identity();


    constructor() {

        if (!Cube.s_initialized) {

            let IbData: number[] = [];

            for (let index = 0; index < UnitCubeVertexData.length; index++) {
                IbData.push(index);
            }
            console.log("initialized");

            Cube.s_ib.UploadData(IbData);
            Cube.s_vb.UploadData(UnitCubeVertexData);

            Cube.s_vb.layout.Add(LayoutAttribute.vec3f);
            Cube.s_vb.Bind();
            Cube.s_vb.layout.Apply();

            Cube.s_Shader.Compile(vertCode, fragCode);

            Cube.s_initialized = true;

        }

        this.m_tb = new VertexBuffer();
        this.m_tb.layout.Add(LayoutAttribute.vec2f);

        this.m_tb.Bind();
        this.m_tb.layout.Apply(1);

    }

    public SetTexture(tile: Tile): void {

        this.m_tb.UploadData(GenSymetricTextureCoordinates(tile));

    }

    public Draw(camera: Camera): void {

        Cube.s_vb.Bind();
        Cube.s_ib.Bind();
        Cube.s_Shader.Bind();


        this.m_tb.Bind();
        this.m_tb.layout.Apply(1);

        Cube.s_Shader.SetUniformInt("sampler2D", 0);


        let len = UnitCubeVertexData.length;

        Cube.s_Shader.SetUniformMat4("Mmatrix", this.m_modelMatrix.values);
        Cube.s_Shader.SetUniformMat4("CameraMatrix", camera.GetPvMatrix().values);
        gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);

        this.m_tb.UnBind();

    }

    public GetShader(): Shader {
        Cube.s_Shader.Bind();
        return Cube.s_Shader;
    }

    public RotateX(radian: number): void {
        this.m_modelMatrix = this.m_modelMatrix.rotateX(radian);
    }

    public RotateY(radian: number): void {
        this.m_modelMatrix = this.m_modelMatrix.rotateY(radian);
    }

    public Translate(tx: number, ty: number, tz: number): void {
        this.m_modelMatrix = this.m_modelMatrix.translate(tx, ty, tz);
    }

    public ResetTransform(): void {
        this.m_modelMatrix = Matrix4.identity();
    }

    public Scale(x: number, y: number, z: number) {
        this.m_modelMatrix = this.m_modelMatrix.scale(x, y, z);
    }


}