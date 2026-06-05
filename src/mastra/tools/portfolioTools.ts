import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
    getPortfolioValue,
    getPortfolioAllocation,
    getPortfolioPerformance
} from "../../tools/portfolio.js";

export const portfolioValueTool = createTool({
    id: "portfolio-value",

    description:
        "Get total portfolio value",

    inputSchema: z.object({}),

    execute: async () => {
        return await getPortfolioValue();
    }
});

export const portfolioAllocationTool = createTool({
    id: "portfolio-allocation",

    description:
        "Get portfolio allocation",

    inputSchema: z.object({}),

    execute: async () => {
        return await getPortfolioAllocation();
    }
});

export const portfolioPerformanceTool = createTool({
    id: "portfolio-performance",

    description:
        "Get portfolio invested amount, current value, gain/loss and return percentage",

    inputSchema: z.object({}),

    execute: async () => {
        return await getPortfolioPerformance();
    }
});