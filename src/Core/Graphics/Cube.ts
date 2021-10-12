import { Tile } from "./TileMap";
import { Texture } from "./Texture";
import { VertexBuffer, IndexBuffer, LayoutAttribute } from "./Buffer";
import { gl } from "../Setup";

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


export class Cube {

    private static s_vb: VertexBuffer = new VertexBuffer();
    private m_tb: VertexBuffer = new VertexBuffer();
    private static s_ib: IndexBuffer = new IndexBuffer();

    private static s_initialized: boolean = false;


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

            Cube.s_initialized = true;

        }

        this.m_tb.layout.Add(LayoutAttribute.vec2f);
        this.m_tb.Bind();
        this.m_tb.layout.Apply(1);
    }

    public SetTexture(tile: Tile): void {

        this.m_tb.UploadData(GenSymetricTextureCoordinates(tile));

    }

    public Draw(): void {

        Cube.s_vb.Bind();
        Cube.s_ib.Bind();


        this.m_tb.Bind();

        let len = UnitCubeVertexData.length;

        gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_SHORT, 0);

    }
}