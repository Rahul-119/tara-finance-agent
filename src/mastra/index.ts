import dotenv from "dotenv";
dotenv.config();

import { Mastra } from "@mastra/core";
import { taraAgent } from "./agents/taraAgent.js";

export const mastra = new Mastra({agents: { taraAgent }});