export const canvas = <HTMLCanvasElement>document.querySelector("#can");
export const gl = canvas.getContext("webgl2");
export const ToRadian = (degree: number) => { return (degree * .5) * Math.PI / 180 }
export const IsPowerOf2 = (value: number) => { return (value & (value - 1)) == 0; }

export const Init = () => {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
}
