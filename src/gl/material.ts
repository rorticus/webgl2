import {
    AttributeSource,
    IndexBuffer,
    PositionBuffer
} from "./buffers";

class Material {
    program: WebGLProgram;
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;

    attributes: Record<string, string> = {
        vPosition: PositionBuffer
    };

    attributeMap: { [key: string]: number} = {};

    constructor(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        const p = gl.createProgram()!;
        this.program = p;

        gl.attachShader(p, this.vertexShader);
        gl.attachShader(p, this.fragmentShader);

        gl.linkProgram(p);

        Object.keys(this.attributes).forEach(attributeName => {
            this.attributeMap[attributeName] = gl.getAttribLocation(this.program, attributeName);
        });
    }

    prepare(gl: WebGL2RenderingContext, attributeSource: AttributeSource) {
        gl.useProgram(this.program);

        Object.keys(this.attributes).forEach(attributeName => {
            const buffer = attributeSource[this.attributes[attributeName]];
            const attributePosition =this.attributeMap[attributeName];

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(attributePosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(attributePosition);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        });

        const indexBuffer = attributeSource[IndexBuffer];
        if(indexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        }
    }
}

export default Material;