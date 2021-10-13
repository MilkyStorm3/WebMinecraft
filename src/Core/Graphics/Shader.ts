import { gl } from "../Setup"


export class Shader {

    private m_programId;
    private m_uniformLocations;

    constructor() {
        this.m_programId = gl.createProgram();
        this.m_uniformLocations = new Map<string, WebGLUniformLocation>();
    }

    public Compile(VertexSrc: string, FragmentSrc: string): void {

        let vertexShaderId = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShaderId, VertexSrc);
        gl.compileShader(vertexShaderId);

        let fragmentShaderId = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShaderId, FragmentSrc);
        gl.compileShader(fragmentShaderId);

        gl.attachShader(this.m_programId, vertexShaderId);
        gl.attachShader(this.m_programId, fragmentShaderId);

        gl.linkProgram(this.m_programId);

        gl.detachShader(this.m_programId, vertexShaderId);
        gl.detachShader(this.m_programId, fragmentShaderId);
        gl.deleteShader(vertexShaderId);
        gl.deleteShader(fragmentShaderId);
    }

    public Bind(): void {

        gl.useProgram(this.m_programId);

    }

    public Kill(): void {
        gl.deleteProgram(this.m_programId);
    }

    //! TEMP
    public GetId(): WebGLProgram {
        return this.m_programId;
    }

    private GetUniformLocation(name: string): WebGLUniformLocation {
        if (this.m_uniformLocations.has(name)) {
            return this.m_uniformLocations.get(name);
        }

        let location = gl.getUniformLocation(this.m_programId, name);
        this.m_uniformLocations.set(name, location);
        return location;
    }

    public SetUniformMat4(name: string, mat: Float32Array) {
        gl.uniformMatrix4fv(this.GetUniformLocation(name), false, mat);
    }

    public SetUniformInt(name: string, num: number) {
        gl.uniform1i(this.GetUniformLocation(name), num);
    }

    //todo add deletnion afterwords

}