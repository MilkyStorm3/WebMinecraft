import { gl, canvas } from "../Setup"

export class RendererCommands {
    constructor() {

    }

    public static Clear(): void {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    public static UseViewPort(width: number = canvas.width, height: number = canvas.height): void {
        gl.viewport(0.0, 0.0, width, height);
    }
}


export class Renderer {
    
    constructor() {

    }


}