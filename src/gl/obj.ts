import { vec3, Vec3 } from "./vec3";
import Geometry from "./geometry";

export function loadObj(data: string) {
  const lines = data.split("\n");

  const vertices: Vec3[] = [];
  const normals: Vec3[] = [];
  const indices: number[] = [];

  const allVertices: number[] = [];
  const allNormals: number[] = [];

  let offset = 0;

  for (const line of lines) {
    if (line.indexOf("v ") === 0) {
      const values = line.split(" ").map(parseFloat);
      vertices.push(vec3(values[1], values[2], values[3]));
    } else if (line.indexOf("vn ") === 0) {
      const values = line.split(" ").map(parseFloat);
      normals.push(vec3(values[1], values[2], values[3]));
    } else if (line.indexOf("f ") === 0) {
      const faceData = line.split(" ").map((s) => s.split("/").map(parseFloat));
      const faceIndices = faceData.map((d) => d[0] - 1);
      const faceNormals = faceData.map((d) => d[2] - 1);

      if (faceIndices.length === 4) {
        for (let i = 1; i < faceIndices.length; i++) {
          allVertices[offset] = vertices[faceIndices[i]][0];
          allVertices[offset + 1] = vertices[faceIndices[i]][1];
          allVertices[offset + 2] = vertices[faceIndices[i]][2];

          allNormals[offset] = normals[faceNormals[i]][0];
          allNormals[offset + 1] = normals[faceNormals[i]][1];
          allNormals[offset + 2] = normals[faceNormals[i]][2];

          offset += 3;

          indices.push(offset / 3 - 1);
        }
      }
    }
  }

  const g = new Geometry();
  g.vertices = new Float32Array(allVertices);
  g.normals = new Float32Array(allNormals);
  g.indices = new Uint16Array(indices);

  return g;
}
