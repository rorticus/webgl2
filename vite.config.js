import ObjFileImport from "unplugin-obj/vite";
import MtlFileImport from "unplugin-mtl/vite";

export default {
  plugins: [ObjFileImport(), MtlFileImport()],
};
