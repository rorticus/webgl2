import Geometry from "./geometry";
import Material from "./material";

class Model {
  geometry: Geometry;
  material: Material;

  constructor(geometry: Geometry, material: Material) {
    this.geometry = geometry;
    this.material = material;
  }

  prepare(gl: WebGL2RenderingContext) {
    this.material.prepare(gl, this.geometry.getAttributeSource(gl));
  }

  draw(gl: WebGL2RenderingContext) {
    this.geometry.draw(gl);
  }
}

export default Model;
