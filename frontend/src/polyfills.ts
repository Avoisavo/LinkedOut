// Polyfills for Node.js modules in browser environment
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
  window.process = require("process/browser");
}

export {};
