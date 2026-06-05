import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
    getFundPerformance,
    getBestPerformingFund
} from "../../tools/funds.js";

export const fundPerformanceTool = createTool({
    id: "fund-performance",

    description:
        "Get performance of a specific fund",

    inputSchema: z.object({
        fundId: z.string()
    }),

    execute: async ({ fundId }) => {
        return await getFundPerformance(fundId);
    }
});

export const bestFundTool = createTool({
    id: "best-fund",

    description:
        "Get best performing fund",

    inputSchema: z.object({}),

    execute: async () => {
        return await getBestPerformingFund();
    }
});