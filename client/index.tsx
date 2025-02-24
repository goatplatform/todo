// @deno-types="@types/react"
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import { registerSchemas } from "../common/schema.ts";

registerSchemas();

const domNode = document.getElementById("root")!;

const root = createRoot(domNode);
root.render(<App />);
