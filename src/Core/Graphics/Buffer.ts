import { gl } from "../Setup"

export enum LayoutAttribute {
    none = 0,
    vec1f,
    vec2f,
    vec3f,
    vec4f
}

const AttribCompomentCount = new Map();
AttribCompomentCount.set(LayoutAttribute.vec1f, 1);
AttribCompomentCount.set(LayoutAttribute.vec2f, 2);
AttribCompomentCount.set(LayoutAttribute.vec3f, 3);
AttribCompomentCount.set(LayoutAttribute.vec4f, 4);

const AttribType = new Map();
AttribType.set(LayoutAttribute.vec1f, gl.FLOAT);
AttribType.set(LayoutAttribute.vec2f, gl.FLOAT);
AttribType.set(LayoutAttribute.vec3f, gl.FLOAT);
AttribType.set(LayoutAttribute.vec4f, gl.FLOAT);

const SizeOfType = new Map();
SizeOfType.set(gl.FLOAT, 4);


class VertexLayout {

    private attribs: LayoutAttribute[] = [];

    constructor() {
        //todo use vertex array
    }

    public Add(att: LayoutAttribute) {
        this.attribs.push(att);
    }

    public Apply(startIdx:number = 0): void {

        let vertexSize = 0;        
        this.attribs.forEach(atr=>{
            vertexSize+=AttribCompomentCount.get(atr)*SizeOfType.get(AttribType.get(atr));
        });

        let offset = 0;
        for (let idx = startIdx; idx < this.attribs.length + startIdx; idx++) {
            const el = this.attribs[idx- startIdx];
            const compomentCount = AttribCompomentCount.get(el);
            const type = AttribType.get(el);
            gl.vertexAttribPointer(idx, compomentCount, type, false, vertexSize, offset);
            offset += compomentCount * SizeOfType.get(type);
            gl.enableVertexAttribArray(idx);
        }
    }

}

export class VertexBuffer {

    private m_GlBuffer;
    public layout: VertexLayout;

    constructor() {
        this.m_GlBuffer = gl.createBuffer();
        this.layout = new VertexLayout();
    }

    public Bind(): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_GlBuffer);
    }

    public UploadData(data: number[]): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_GlBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public UnBind(): void {
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public Kill(): void {
        gl.deleteBuffer(this.m_GlBuffer);
    }
}

export class IndexBuffer {

    private m_GlBuffer;

    constructor() {
        this.m_GlBuffer = gl.createBuffer();
    }

    public Bind(): void {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.m_GlBuffer);
    }

    public UnBind(): void {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    public UploadData(data: number[]): void {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.m_GlBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    public Kill(): void {
        gl.deleteBuffer(this.m_GlBuffer);
    }
}
