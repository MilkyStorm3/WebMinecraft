import { canvas, gl, ToRadian, Init } from "./Core/Setup"
import { RendererCommands } from "./Core/Graphics/Renderer"
import { Camera, ControlKeyMap } from "./Core/Graphics/Camera"
import { Texture } from "./Core/Graphics/Texture"
import { TileMap } from "./Core/Graphics/TileMap"
import { Cube, LookAtSide } from "./Core/Graphics/Cube"
import { DrawCrosshair } from "./Core/Graphics/Crosshair"
import { MyMath } from "./Core/Maths"

import { Vector3, Vector4, Matrix4, Quaternion, Float32Vector3, Vector2, Matrix4x4 } from 'matrixgl';

const log = document.querySelector("#log");

Init();

let tileMap = new TileMap(1024, 416, 32);

let texturesAvailble = [
    tileMap.GetTile(2, 0), //grass
    tileMap.GetTile(6, 8),//lamp off
    tileMap.GetTile(7, 8), //lamp on
    tileMap.GetTile(23, 0),
    tileMap.GetTile(24, 0),
    tileMap.GetTile(25, 0),
    tileMap.GetTile(26, 0),
    tileMap.GetTile(27, 0),
    tileMap.GetTile(28, 0),
    tileMap.GetTile(29, 0),
    tileMap.GetTile(17, 1),
    tileMap.GetTile(16, 1),
    tileMap.GetTile(15, 1),
    tileMap.GetTile(14, 1),
    tileMap.GetTile(9, 1),
    tileMap.GetTile(8, 1),
    tileMap.GetTile(7, 1),
    tileMap.GetTile(6, 1),
    tileMap.GetTile(5, 1),
    tileMap.GetTile(4, 1),
    tileMap.GetTile(3, 1),
    tileMap.GetTile(2, 1),
    tileMap.GetTile(1, 1),
    tileMap.GetTile(0, 1),
    tileMap.GetTile(8, 3),
    tileMap.GetTile(9, 3),
    tileMap.GetTile(10, 3),
    tileMap.GetTile(11, 3),
    tileMap.GetTile(12, 3),
    tileMap.GetTile(13, 3),
    tileMap.GetTile(14, 3),
    tileMap.GetTile(15, 3),
    tileMap.GetTile(16, 3)

];

let curAcctiveIdx = 2;



let texture = new Texture();
texture.Load("https://i.imgur.com/afT7RAI.png");

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


    if (deltaY > 0) {
        curAcctiveIdx++;
    }
    else if (deltaY < 0) {
        if (curAcctiveIdx == 0) {
            curAcctiveIdx = texturesAvailble.length - 1;
            return false;
        }
        curAcctiveIdx--;
    }
});


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


let time_old = 0;

let Blocks: Cube[] = [];

function PickClosest(cubes: Cube[]) {
    let closest = cubes[0];
    let posMin = MyMath.CalcDistance3D(closest.translation, camera.position);

    for (let i = 0; i < cubes.length; i++) {
        const el = cubes[i];
        const posCur = MyMath.CalcDistance3D(camera.position, el.translation);

        if (posMin > posCur) {

            posMin = posCur;
            closest = el;
        }
    }

    return closest;
}

// function name(cubes:Cube[]) {}

function GetOffsetVector(side: LookAtSide): Float32Vector3 {

    if (side == LookAtSide.Top) return new Vector3(0, 1, 0);
    if (side == LookAtSide.Bottom) return new Vector3(0, -1, 0);
    if (side == LookAtSide.Left) return new Vector3(1, 0, 0);
    if (side == LookAtSide.Right) return new Vector3(-1, 0, 0);
    if (side == LookAtSide.Front) return new Vector3(0, 0, -1);
    if (side == LookAtSide.Rear) return new Vector3(0, 0, 1);

    return new Vector3(NaN, NaN, NaN);
}


document.addEventListener("mousedown", function (ev) {

    //? 2 - right
    //? 1 - wheel click
    //? 0 - left
    let cameraRay = camera.GetCameraRay();

    let intersectingBlocks: Cube[] = [];

    for (let i = 0; i < Blocks.length; i++) {
        const element = Blocks[i];
        if (element.Intersects(cameraRay)) {
            intersectingBlocks.push(Blocks[i]);
        }
    }

    if (!intersectingBlocks.length) return false;

    const closestBlock = PickClosest(intersectingBlocks);

    if (ev.button == 0) { //? left clock

        if (Blocks.length <= 1) return false;

        let idx = Blocks.findIndex(el => el == closestBlock);

        if (idx > -1) {
            Blocks.splice(idx, 1);
        }

    }

    if (ev.button == 2) { //? right click


        if (closestBlock.Intersects(camera.GetCameraRay())) {
            let side = closestBlock.GetLookAtSide(camera);
            let vec = GetOffsetVector(side);
            let newBlock = new Cube();
            newBlock.translation = closestBlock.translation.add(vec);
            newBlock.SetTexture(texturesAvailble[curAcctiveIdx % texturesAvailble.length]);
            Blocks.push(newBlock);

        }
    }
});

texture.Bind();

{
    let b = new Cube();
    b.SetTexture(texturesAvailble[curAcctiveIdx % texturesAvailble.length]);
    Blocks.push(b);
}

let scale = 0.2;
let pickedBlockVisualizer = new Cube();
pickedBlockVisualizer.m_modelMatrix = pickedBlockVisualizer.m_modelMatrix.rotateX(ToRadian(-45));
pickedBlockVisualizer.m_modelMatrix = pickedBlockVisualizer.m_modelMatrix.rotateY(ToRadian(45));
pickedBlockVisualizer.m_modelMatrix = pickedBlockVisualizer.m_modelMatrix.translate(3, -1.2, 0);
pickedBlockVisualizer.m_modelMatrix = pickedBlockVisualizer.m_modelMatrix.scale(scale, scale, scale);

let projection = Matrix4x4.perspective({
    fovYRadian: ToRadian(fov),
    aspectRatio: canvas.width / canvas.height,
    near: 1,
    far: 100
});
let view = Matrix4x4.lookAt(new Vector3(0, 0, 6), new Vector3(0, 0, 0), new Vector3(0, 1, 0));
let vp = projection.mulByMatrix4x4(view);

let animate = function (time: number) {

    let dt = time - time_old;

    time_old = time;

    let matrix = camera.GetPvMatrix();

    camera.OnKey(keyMap);

    RendererCommands.UseViewPort();
    RendererCommands.Clear();

    Blocks.forEach(cube => cube.Draw(matrix));

    DrawCrosshair();
    {
        pickedBlockVisualizer.SetTexture(texturesAvailble[curAcctiveIdx % texturesAvailble.length]);
        pickedBlockVisualizer.Draw(vp, pickedBlockVisualizer.m_modelMatrix);
    }

    window.requestAnimationFrame(animate);
}

animate(0);
