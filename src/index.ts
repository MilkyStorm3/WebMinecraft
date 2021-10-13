import { Vector4Base } from "matrixgl/lib/vector_base";
import { canvas, gl, ToRadian, Init } from "./Core/Setup"
import { VertexBuffer, IndexBuffer, LayoutAttribute } from "./Core/Graphics/Buffer"
import { Shader } from "./Core/Graphics/Shader"
import { RendererCommands } from "./Core/Graphics/Renderer"
import { Camera } from "./Core/Graphics/Camera"
import { Texture } from "./Core/Graphics/Texture"
import { TileMap } from "./Core/Graphics/TileMap"
import {Cube} from "./Core/Graphics/Cube"

import { Vector3, Vector4, Matrix4, Quaternion, Float32Vector3 } from 'matrixgl';

const log = document.querySelector("#log");
Init();
    
let tileMap = new TileMap(1024, 416, 32);
let tileLamp = tileMap.GetTile(7,8);
let tile = tileMap.GetTile(2,0);



/*=================== SHADERS =================== */




let texture = new Texture();
// texture.Load("https://i.imgur.com/D9JxVTq.png");
texture.Load("https://i.imgur.com/afT7RAI.png");

/*======== Associating attributes to vertex shader =====*/



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
let blah:Cube = new Cube();
let c3:Cube = new Cube();

c1.SetTexture(tile);
blah.SetTexture(tileLamp);
c3.SetTexture(tile);


texture.Bind();

var animate = function (time: number) {

    var dt = time - time_old;

    if (!drag) {
        dX *= AMORTIZATION, dY *= AMORTIZATION;
        THETA += dX, PHI += dY;
    }

    c1.ResetTransform();
    c1.Translate(1.2,0,2);
    c1.RotateX(PHI);
    c1.RotateY(THETA);

    blah.ResetTransform();
    blah.Translate(-1,0,0);
    blah.RotateX(PHI);
    blah.RotateY(THETA);

    c3.ResetTransform();
    c3.Scale(0.2,0.2,0.2);
    c3.RotateX(0.7);
    c3.RotateY(0.2);


    time_old = time;

    RendererCommands.UseViewPort();
    RendererCommands.Clear();

    c1.Draw(camera);
    blah.Draw(camera);
    c3.Draw(camera);


    window.requestAnimationFrame(animate);
}

animate(0);
