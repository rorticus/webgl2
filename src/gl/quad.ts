import Geometry from "./geometry";

export function createQuad() {
  return new Geometry(
    {
      position: {
        type: "vec3",
        data: new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]),
      },
      uv: {
        type: "vec2",
        data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      },
    },
    [
      {
        indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
      },
    ]
  );
}
