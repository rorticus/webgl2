import ObjFileImport from "unplugin-obj/vite";
import MtlFileImport from "unplugin-mtl/vite";
import glsl from "vite-plugin-glsl";

export default {
  plugins: [ObjFileImport(), MtlFileImport(), glsl()],
};
