import { gl, IsPowerOf2 } from "../Setup"

//! todo fix textures!

export class Texture {
    private m_GlTexture: WebGLTexture;
    private m_image: HTMLImageElement;
    private m_fn: Function;

    constructor() {
        this.m_GlTexture = gl.createTexture();
        this.m_image = new Image();
        this.m_image.crossOrigin = "anonymous";

        gl.bindTexture(gl.TEXTURE_2D, this.m_GlTexture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

        this.m_fn = () => { }


        this.m_image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.m_GlTexture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, this.m_image);

            if (IsPowerOf2(this.m_image.width) && IsPowerOf2(this.m_image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            this.m_fn();
        };

    }

    public Bind(): void {
        gl.bindTexture(gl.TEXTURE_2D, this.m_GlTexture);
    }

    public Load(url: string): void {
        this.m_image.src = url;
    }

    public GetId(): WebGLTexture {
        return this.m_GlTexture;
    }

    public AfterLoad(fn: Function) {
        this.m_fn = fn;
    }
}
