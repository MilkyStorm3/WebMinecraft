import { Vector4Base } from "matrixgl/lib/vector_base";
import { canvas, gl, ToRadian } from "./Core/Setup"
import { VertexBuffer, IndexBuffer, LayoutAttribute } from "./Core/Graphics/Buffer"
import { Shader } from "./Core/Graphics/Shader"
import { RendererCommands } from "./Core/Graphics/Renderer"
import { Camera } from "./Core/Graphics/Camera"
import { Texture } from "./Core/Graphics/Texture"
import { TileMap } from "./Core/Graphics/TileMap"
import {Cube} from "./Core/Graphics/Cube"

import { Vector3, Vector4, Matrix4, Quaternion, Float32Vector3 } from 'matrixgl';

const log = document.querySelector("#log");

    
let tileMap = new TileMap(1024, 416, 32);
// let tile = tileMap.GetTile(7,8);
let tile = tileMap.GetTile(2,0);



/*=================== SHADERS =================== */

let vertCode =
    `attribute vec3 position;
    uniform mat4 PVmatrix;
    uniform mat4 Mmatrix;
    // attribute vec3 color;
    attribute vec2 tex;
    // varying vec3 vColor;
    varying vec2 vTex;
    void main(void) { 
    gl_Position = PVmatrix*Mmatrix*vec4(position, 1.);
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

let shader = new Shader();
shader.Compile(vertCode, fragCode);

let texture = new Texture();
// texture.Load("https://i.imgur.com/D9JxVTq.png");
texture.Load("https://i.imgur.com/afT7RAI.png");

/*======== Associating attributes to vertex shader =====*/



shader.Bind();

/*==================== MATRIX ====================== */

let camera = new Camera({
    fovYRadian: ToRadian(60),
    aspectRatio: canvas.width / canvas.height,
    near: 1,
    far: 100
},
    new Vector3(0, 0, -6)
);


window.addEventListener('wheel', ({ deltaY }) => {
    if (deltaY > 0) {
        camera.position.z -= 0.3;
    }
    else if (deltaY < 0) {
        camera.position.z += 0.3;
    }
});


/*================= Mouse events ======================*/
var AMORTIZATION = 0.95;
var drag = false;
var old_x: any, old_y: any;
var dX = 0, dY = 0;

var mouseDown = function (e: any) {
    drag = true;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
    return false;
};

var mouseUp = function (e: any) {
    drag = false;
};


var mouseMove = function (e: any) {
    if (!drag) return false;
    dX = (e.pageX - old_x) * 2 * Math.PI / canvas.width,
        dY = (e.pageY - old_y) * 2 * Math.PI / canvas.height;
    THETA += dX;
    PHI += dY;
    old_x = e.pageX;
    old_y = e.pageY;



    e.preventDefault();
};



canvas.addEventListener("mousedown", mouseDown, false);
canvas.addEventListener("mouseup", mouseUp, false);
canvas.addEventListener("mouseout", mouseUp, false);
canvas.addEventListener("mousemove", mouseMove, false);


/*=================== Drawing =================== */

var THETA = 0,
    PHI = 0;
var time_old = 0;

let c1:Cube = new Cube();
let c2:Cube = new Cube();
let c3:Cube = new Cube();

c1.SetTexture(tile);
c2.SetTexture(tile);
c3.SetTexture(tile);

texture.Bind();

var animate = function (time: number) {

    var dt = time - time_old;

    if (!drag) {
        dX *= AMORTIZATION, dY *= AMORTIZATION;
        THETA += dX, PHI += dY;
    }

    let modelMatrix2 = Matrix4.identity().translate(-1, 0, 0);
    modelMatrix2 = modelMatrix2.rotateX(PHI);
    modelMatrix2 = modelMatrix2.rotateY(THETA);

    let modelMatrix = Matrix4.identity().translate(1.2, 0, 2);
    modelMatrix = modelMatrix.rotateX(PHI);
    modelMatrix = modelMatrix.rotateY(THETA);

    let modelMatrix3 = Matrix4.identity().scale(0.2, 0.2, 0.2);
    modelMatrix3 = modelMatrix3.rotateX(0.7);
    modelMatrix3 = modelMatrix3.rotateY(0.2);

    time_old = time;
    gl.enable(gl.DEPTH_TEST);

    gl.depthFunc(gl.LEQUAL);

    RendererCommands.UseViewPort();

    RendererCommands.Clear();

    shader.SetUniformMat4("PVmatrix", camera.GetPvMatrix().values);
    shader.SetUniformMat4("Mmatrix", modelMatrix.values);

    c1.Draw();
    
    //cube2
    shader.SetUniformMat4("PVmatrix", camera.GetPvMatrix().values);
    shader.SetUniformMat4("Mmatrix", modelMatrix2.values);
    c2.Draw();


    //cube3
    shader.SetUniformMat4("PVmatrix", camera.GetPvMatrix().values);
    shader.SetUniformMat4("Mmatrix", modelMatrix3.values);
    c3.Draw();


    window.requestAnimationFrame(animate);
}

animate(0);
