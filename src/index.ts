import { Vector4Base } from "matrixgl/lib/vector_base";
import { canvas, gl, ToRadian, Init } from "./Core/Setup"
import { VertexBuffer, IndexBuffer, LayoutAttribute } from "./Core/Graphics/Buffer"
import { Shader } from "./Core/Graphics/Shader"
import { RendererCommands } from "./Core/Graphics/Renderer"
import { Camera, ControlKeyMap } from "./Core/Graphics/Camera"
import { Texture } from "./Core/Graphics/Texture"
import { TileMap } from "./Core/Graphics/TileMap"
import { Cube } from "./Core/Graphics/Cube"
import { DrawCrosshair } from "./Core/Graphics/Crosshair"

import { Vector3, Vector4, Matrix4, Quaternion, Float32Vector3, Vector2 } from 'matrixgl';

const log = document.querySelector("#log");
Init();

let tileMap = new TileMap(1024, 416, 32);
let tileLamp = tileMap.GetTile(7, 8);
let tileLampOff = tileMap.GetTile(6, 8);
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
let AMORTIZATION = 0.95;
let drag = false;
let old_x: any, old_y: any;
let dX = 0, dY = 0;

let X = 0, prevX = 0;
let Y = 0, prevY = 0;
let yaw = 180, pitch = 0;

let mouseMove = function (e: any) {

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

    prevX = X;
    prevY = Y;

    X += e.movementX;
    Y += e.movementY;

    e.preventDefault();
};


let keyMap: ControlKeyMap = {

    W: false,
    S: false,
    A: false,
    D: false,
    Space: false,
    Shift: false
}

document.addEventListener('pointerlockerror', event => {

}, false);

document.addEventListener('pointerlockchange', event => {

    if (document.pointerLockElement !== canvas) {

        console.log("free");

        canvas.removeEventListener("mousemove", mouseMove);
        document.exitPointerLock();

        event.preventDefault();
    }

}, false);

let SetKeyState = (key: string, val: boolean) => {
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

    if (key == "F12") {
        return false;
    }
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

let time_old = 0;

let Blocks: Cube[] = [];
/* 
document.addEventListener("mousedown", ev => {


    Blocks.forEach(block => {

        block.Intersects(camera.GetCameraRay());

        block.SetTexture(tile);

    });
});
 */
texture.Bind();

// for (let i = 0; i < 10; i++) {
    // for (let j = 0; j < 10; j++) {
        let block = new Cube();
        // block.translation = new Vector3(1.2 + i, j, 2);
        // block.translation = new Vector3(1.2, 0, 2);
        Blocks.push(block);
    // }
// }

let animate = function (time: number) {

    let dt = time - time_old;


    Blocks.forEach(cube => {

        let i = cube.Intersects(camera.GetCameraRay());

        if (i) {
            cube.SetTexture(tileLamp);

        }
        else {
            cube.SetTexture(tileLampOff);
        }

        // let s = cube.GetLookAtSide(camera);
        // console.log(s.toString());

    });
    // console.log(i);



    time_old = time;

    camera.OnKey(keyMap);

    RendererCommands.UseViewPort();
    RendererCommands.Clear();

    Blocks.forEach(cube => cube.Draw(camera));

    DrawCrosshair();


    window.requestAnimationFrame(animate);
}

animate(0);
