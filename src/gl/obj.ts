import { vec3, Vec3 } from "./vec3";
import Geometry from "./geometry";
import { NormalBuffer, PositionBuffer } from "./buffers";
import { BoundingSphere } from "./boundingSphere";

interface MaterialDefiniton {
  name: string;
  diffuse: number[];
  ambient: number[];
  specularColor: number[];
  specularExponent: number;
  density: number;
  dissolve: number;
}

export function loadObj(
  data: string,
  materials: Record<string, MaterialDefiniton> = {}
): Geometry {
  const lines = data.split("\n");

  const vertices: Vec3[] = [];
  const normals: Vec3[] = [];

  let currentGroup = "";
  const groups: Record<string, number[]> = {
    "": [],
  };

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

          groups[currentGroup]!.push(offset / 3 - 1);
        }
      }
    } else if (line.indexOf("usemtl ") === 0) {
      currentGroup = line.split(" ")[1];
      groups[currentGroup] = [];
    }
  }

  return new Geometry(
    {
      [PositionBuffer]: { type: "vec3", data: new Float32Array(allVertices) },
      [NormalBuffer]: { type: "vec3", data: new Float32Array(allNormals) },
    },

    Object.keys(groups).map((name) => ({
      indices: new Uint16Array(groups[name]),
      uniforms: {
        diffuse: {
          type: "vec3",
          value: vec3(...(materials[name]?.diffuse || [1, 1, 1])),
        },
        emissive: {
          type: "vec3",
          value: vec3(...(materials[name]?.ambient || [0, 0, 0])),
        },
      },
    })),
    BoundingSphere.calculateForVertices(allVertices)
  );
}

export function loadMaterials(mtl: string): Record<string, MaterialDefiniton> {
  const materials: Record<string, MaterialDefiniton> = {};

  let currentMaterial = "";

  mtl.split("\n").forEach((line) => {
    const l = line.trim();
    if (l.startsWith("newmtl")) {
      currentMaterial = l.split(" ")[1];
      materials[currentMaterial] = {
        name: currentMaterial,
        diffuse: [0, 0, 0],
        ambient: [0, 0, 0],
        specularColor: [0, 0, 0],
        specularExponent: 0,
        density: 0,
        dissolve: 0,
      };
    } else if (l.startsWith("Kd")) {
      const values = l.split(" ").map(parseFloat);
      materials[currentMaterial].diffuse = values.slice(1);
    } else if (l.startsWith("Ka")) {
      const values = l.split(" ").map(parseFloat);
      materials[currentMaterial].ambient = values.slice(1);
    }
  });

  return materials;
}
