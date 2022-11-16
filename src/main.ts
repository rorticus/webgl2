import Material from "./gl/material";
import {createFragmentShader, createVertexShader} from "./gl/shaders";
import Geometry from "./gl/geometry";
import Model from "./gl/model";

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl2')!;

const vertices = [
    -0.5, 0.5, 0,
    -0.5, -0.5, 0,
    0.5, -0.5, 0,
    0.5, 0.5, 0,
];

const indices = [
    0, 1, 2, 0, 2, 3
];

const geometry = new Geometry();
geometry.vertices = new Float32Array(vertices);
geometry.indices = new Uint16Array(indices);

const material = new Material(gl, createVertexShader(gl, (document.getElementById('vertex-shader') as HTMLScriptElement).text.trim()), createFragmentShader(gl, (document.getElementById('fragment-shader') as HTMLScriptElement).text.trim()))
const model = new Model(geometry, material);

// draw it
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

model.prepare(gl);
model.draw(gl);

export {};