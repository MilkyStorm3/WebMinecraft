import { Float32Vector2, Vector2 } from "matrixgl";
import { Texture } from "./Texture"

export interface Tile {
    left: number,
    top: number,
    right: number,
    bottom: number
}

export class TileMap {

    public m_tileSizeGl: Float32Vector2;

    public m_countHorizontal;
    private m_countVertical;

    constructor(width: number, height: number, tileSizePx: number) {

        let texSize = new Vector2(width, height);

        this.m_countHorizontal = texSize.x / tileSizePx;
        this.m_countVertical = texSize.y / tileSizePx;

        let glSizeH = 1 / this.m_countHorizontal;
        let glSizeV = 1 / this.m_countVertical;

        this.m_tileSizeGl = new Vector2(glSizeH, glSizeV);

    }

    public GetTile(Xidx: number, Yidx: number): Tile {

        let x = Xidx * this.m_tileSizeGl.x;
        let y = Yidx * this.m_tileSizeGl.y;

        return {
            left: x,
            top: y,
            right: x + this.m_tileSizeGl.x,
            bottom: y + this.m_tileSizeGl.y
        };
    }




}