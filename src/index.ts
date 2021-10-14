import { Vector4Base } from "matrixgl/lib/vector_base";
import { canvas, gl, ToRadian, Init } from "./Core/Setup"
import { VertexBuffer, IndexBuffer, LayoutAttribute } from "./Core/Graphics/Buffer"
import { Shader } from "./Core/Graphics/Shader"
import { RendererCommands } from "./Core/Graphics/Renderer"
import { Camera, ControlKeyMap } from "./Core/Graphics/Camera"
import { Texture } from "./Core/Graphics/Texture"
import { TileMap } from "./Core/Graphics/TileMap"
import { Cube } from "./Core/Graphics/Cube"

import { Vector3, Vector4, Matrix4, Quaternion, Float32Vector3, Vector2 } from 'matrixgl';

const log = document.querySelector("#log");
Init();

let tileMap = new TileMap(1024, 416, 32);
let tileLamp = tileMap.GetTile(7, 8);
let tile = tileMap.GetTile(2, 0);



/*=================== SHADERS =================== */




let texture = new Texture();
// texture.Load("https://i.imgur.com/D9JxVTq.png");
texture.Load("https://i.imgur.com/afT7RAI.png");

/*======== Associating attributes to vertex shader =====*/



/*==================== MATRIX ====================== */
let fov = 60;

let camera = new Camera({
    fovYRadian: ToRadian(fov),
    aspectRatio: canvas.width / canvas.height,
    near: 1,
    far: 100
},
    new Vector3(0, 0, -6)
);
camera.cameraSpeed = 0.1;

window.addEventListener('wheel', ({ deltaY }) => {

    if (fov < 45 && fov > 1) {
        fov += deltaY;
        camera.SetFov(fov);
    }
    // if (deltaY > 0) {

    // }
    // else if (deltaY < 0) {

    // }
});


/*================= Mouse events ======================*/
var AMORTIZATION = 0.95;
var drag = false;
var old_x: any, old_y: any;
var dX = 0, dY = 0;

// var mouseDown = function (e: any) {
//     drag = true;
//     old_x = e.pageX, old_y = e.pageY;
//     e.preventDefault();
//     return false;
// };

// var mouseUp = function (e: any) {
//     drag = false;
// };

let X = 0, prevX = 0;
let Y = 0, prevY = 0;
let yaw = 180, pitch = 0;

var mouseMove = function (e: any) {

    let xOffset = X - prevX;
    let yOffset = prevY - Y;
    let sensitivity = 0.1;
    let pitchLimit = 150;

    yaw += xOffset * sensitivity;
    pitch += yOffset * sensitivity;

    

    if (pitch > pitchLimit)
        pitch = pitchLimit;

    if (pitch < -pitchLimit)
        pitch = -pitchLimit;

    let dir = new Vector3(0, 0, 0);
    dir.x = Math.cos(ToRadian(yaw)) * Math.cos(ToRadian(pitch));
    dir.y = Math.sin(ToRadian(pitch));
    dir.z = Math.sin(ToRadian(yaw)) * Math.cos(ToRadian(pitch));
    camera.cameraDirection = dir.normalize();


    // if (xOffset > 0) {
    //     //left
    //     // console.log("left"); 
    // }
    // if (xOffset < 0) {
    //     //right

    //     // console.log("right");
    // }

    // if (yOffset > 0) {
    //     //up

    //     // console.log("up");
    // }
    // if (yOffset < 0) {
    //     //down

    //     // console.log("down");
    // }
    // navigator.pointer.isLocked

    prevX = X;
    prevY = Y;


    //cube rotation
    X += e.movementX;
    Y += e.movementY;

    // if (!drag) return false;
    // dX = (e.pageX - old_x) * 2 * Math.PI / canvas.width,
    //     dY = (e.pageY - old_y) * 2 * Math.PI / canvas.height;
    // // THETA += dX;
    // PHI += dY;


    // old_x = e.pageX;
    // old_y = e.pageY;

    e.preventDefault();
};

// canvas.addEventListener("mousedown", mouseDown, false);
// canvas.addEventListener("mouseup", mouseUp, false);
// canvas.addEventListener("mouseout", mouseUp, false);
// canvas.addEventListener("mousemove", mouseMove, false);

// let key: string = "NULL";
let keyMap: ControlKeyMap = {

    W: false,
    S: false,
    A: false,
    D: false,
    Space: false,
    Shift: false
}

document.addEventListener('pointerlockerror', event => {
    // console.log("free by error");
    // document.exitPointerLock();
    // canvas.requestPointerLock();
    // canvas.removeEventListener("mousemove", mouseMove);
    // document.exitPointerLock();

    // event.preventDefault();

}, false);

document.addEventListener('pointerlockchange', event => {

    if (document.pointerLockElement !== canvas) {

        console.log("free");

        canvas.removeEventListener("mousemove", mouseMove);
        document.exitPointerLock();

        event.preventDefault();
    }

}, false);

let SetKeyState = (key:string, val:boolean) =>{
   switch (key) {
        case "W": keyMap.W = val; break;
        case "S": keyMap.S = val; break;
        case "A": keyMap.A = val; break;
        case "D": keyMap.D = val; break;
        case " ": keyMap.Space = val; break;
        case "SHIFT": keyMap.Shift = val; break;

        default: break;
    }
}

window.addEventListener("keydown", event => {

    let key = event.key.toUpperCase();
    console.log(key);

    // if (key == "F5" || key == "ESCAPE") {
    //     document.exitPointerLock();
    // }
    SetKeyState(key, true);
 

    event.preventDefault();



});


window.addEventListener("keyup", ev => {

    SetKeyState(ev.key.toUpperCase(), false);

});

canvas.requestPointerLock = canvas.requestPointerLock;
document.exitPointerLock = document.exitPointerLock;

canvas.onclick = () => {
    canvas.addEventListener("mousemove", mouseMove, false);
    canvas.requestPointerLock();
}



/*=================== Drawing =================== */

var THETA = 0,
    PHI = 0;
var time_old = 0;

let c1: Cube = new Cube();
let blah: Cube = new Cube();
let c3: Cube = new Cube();

c1.SetTexture(tile);
blah.SetTexture(tileLamp);
c3.SetTexture(tile);


texture.Bind();

var animate = function (time: number) {

    var dt = time - time_old;

    /* if (!drag) {
        dX *= AMORTIZATION, dY *= AMORTIZATION;
        THETA += dX, PHI += dY;
    } */

    c1.ResetTransform();
    c1.Translate(1.2, 0, 2);
    c1.RotateX(PHI);
    c1.RotateY(THETA);

    blah.ResetTransform();
    blah.Translate(-1, 0, 0);
    blah.RotateX(PHI);
    blah.RotateY(THETA);

    c3.ResetTransform();
    c3.Scale(0.2, 0.2, 0.2);
    c3.RotateX(0.7);
    c3.RotateY(0.2);


    time_old = time;

    camera.OnKey(keyMap);

    RendererCommands.UseViewPort();
    RendererCommands.Clear();

    c1.Draw(camera);
    blah.Draw(camera);
    c3.Draw(camera);


    window.requestAnimationFrame(animate);
}

animate(0);
