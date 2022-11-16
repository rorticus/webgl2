import {AttributeSource, IBO, IndexBuffer, PositionBuffer, VBO} from "./buffers";

class Geometry {
    vertices: Float32Array = new Float32Array();
    indices: Uint16Array = new Uint16Array();

    private positionBuffer: VBO | null = null;
    private indexBuffer: IBO | null = null;

    getPositionBuffer(gl: WebGL2RenderingContext) {
        if(!this.positionBuffer) {
            this.positionBuffer = new VBO(this.vertices);
        }

        return this.positionBuffer.getBuffer(gl);
    }

    getIndexBuffer(gl: WebGL2RenderingContext) {
        if(!this.indexBuffer) {
            this.indexBuffer = new IBO(this.indices);
        }

        return this.indexBuffer.getBuffer(gl);
    }

    getAttributeSource(gl: WebGL2RenderingContext): AttributeSource {
        return {
            [PositionBuffer]: this.getPositionBuffer(gl),
            [IndexBuffer]: this.getIndexBuffer(gl)
        }
    }

    draw(gl: WebGL2RenderingContext) {
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}

export default Geometry;