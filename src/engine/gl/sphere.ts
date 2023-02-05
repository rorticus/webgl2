import Geometry from "./geometry";
import icoSphere from "../../models/icosphere.obj";
import { loadObj } from "./obj";

/**
 * Create an icosahedron of unit size
 */
export function createIcoSphere(): Geometry {
  return loadObj(icoSphere);
}
