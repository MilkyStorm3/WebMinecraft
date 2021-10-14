import { gl } from "../Setup"
import { Shader } from "./Shader"
import { VertexBuffer, IndexBuffer, LayoutAttribute } from "./Buffer"

const vertexCode = `

    attribute vec2 position;    
    void main(void) {
        gl_Position = vec4(position, -1.0, 1.0);
    }
`;

const fragmentCode = `
    void main(void) {
        gl_FragColor = vec4(0.8, 0.2, 0.2, 1.0);
    }
`;


const shader = new Shader();
const vertexBuffer = new VertexBuffer();
const indexBuffer = new IndexBuffer();

let indicies = [
    3,2,1,3,1,0
];

indexBuffer.Bind();
indexBuffer.UploadData(indicies);

shader.Compile(vertexCode, fragmentCode);

vertexBuffer.Bind();
vertexBuffer.layout.Add(LayoutAttribute.vec2f);
vertexBuffer.layout.Apply(shader.GetAttribLocation("position"));

vertexBuffer.UploadData([
    -0.5, 0.5,
    -0.5, -0.5,
    0.5, -0.5,
    0.5, 0.5,
].map(el => el * 0.023));


export function DrawCrosshair() {
    
    shader.Bind();
    vertexBuffer.Bind();
    indexBuffer.Bind();
    vertexBuffer.layout.Apply(shader.GetAttribLocation("position"));

    gl.drawElements(gl.TRIANGLES, indicies.length, gl.UNSIGNED_SHORT, 0);    

}