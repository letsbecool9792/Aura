import "@ethersproject/shims";
import { install } from "react-native-quick-crypto";
global.Buffer = require("buffer").Buffer;

install();


(global as any).location = {
  protocol: "file:",
};

(global as any).process = {
  ...global.process,
  version: "v16.0.0",
  browser: true,
};