import Geometry from "./geometry";
import Material from "./material";
import { Uniforms } from "./unforms";

class Model {
  geometry: Geometry;
  material: Material;

  constructor(geometry: Geometry, material: Material) {
    this.geometry = geometry;
    this.material = material;
  }

  prepare(gl: WebGL2RenderingContext, renderUniforms: Uniforms) {
    this.material.prepare(
      gl,
      this.geometry.getAttributeSource(gl),
      renderUniforms
    );
  }

  draw(gl: WebGL2RenderingContext) {
    this.geometry.draw(gl, this.material.uniformMap);
  }
}

export default Model;
