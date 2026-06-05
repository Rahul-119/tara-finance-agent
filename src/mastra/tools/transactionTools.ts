import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
    getMerchantSpend,
    getLargestExpense,
    getTopMerchants,
    getSpendByCategory
} from "../../tools/transactions.js";

export const merchantSpendTool = createTool({
    id: "merchant-spend",
    description: "Get spending for a merchant",
    inputSchema: z.object({
        merchant: z.string()
    }),

    execute: async ({ merchant }) => {
        return await getMerchantSpend(merchant);
    }
});

export const categorySpendTool = createTool({
    id: "category-spend",
    description: "Get spending for a category",
    inputSchema: z.object({
        category: z.string()
    }),

    execute: async ({ category }) => {
        return await getSpendByCategory(category);
    }
});

export const largestExpenseTool = createTool({
    id: "largest-expense",
    description: "Get largest expense transaction",
    inputSchema: z.object({}),

    execute: async () => {
        return await getLargestExpense();
    }
});

export const topMerchantsTool = createTool({
    id: "top-merchants",
    description: "Get top merchants by spending",
    inputSchema: z.object({
        limit: z.number().default(5)
    }),

    execute: async ({ limit }) => {
        return await getTopMerchants(limit);
    }
});