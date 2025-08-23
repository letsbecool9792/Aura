import "@ethersproject/shims";
import { install } from "react-native-quick-crypto";
global.Buffer = require("buffer").Buffer;

install();

// Needed so that 'stream-http' chooses the right default protocol.
(global as any).location = {
  protocol: "file:",
};

// Mock process for node polyfills
(global as any).process = {
  ...global.process,
  version: "v16.0.0",
  browser: true,
};

import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "./providers/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}
