import pool from "../db/connection.js";

export async function getSpendByCategory(category: string) {
    const result = await pool.query(
        `
        SELECT
            category,
            ROUND(SUM(amount)::numeric, 2) AS total_spend
        FROM transactions
        WHERE category = $1
          AND amount > 0
        GROUP BY category
        `,
        [category]
    );

    return result.rows[0] ?? {
        category,
        total_spend: 0
    };
}

export async function getMerchantSpend(merchant: string) {
    const result = await pool.query(
        `
        SELECT
            normalized_merchant,
            ROUND(SUM(amount)::numeric,2) AS total_spend
        FROM transactions
        WHERE normalized_merchant = $1
          AND amount > 0
        GROUP BY normalized_merchant
        `,
        [merchant.toLowerCase()]
    );

    return result.rows[0] ?? {
        normalized_merchant: merchant.toLowerCase(),
        total_spend: 0
    };
}

export async function getLargestExpense() {
    const result = await pool.query(
        `
        SELECT *
        FROM transactions
        WHERE amount > 0
          AND category <> 'transfer'
        ORDER BY amount DESC
        LIMIT 1
        `
    );

    return result.rows[0] ?? null;
}

export async function getTopMerchants(limit: number) {
    const result = await pool.query(
        `
        SELECT
            normalized_merchant,
            SUM(amount) AS total_spend,
            COUNT(*) AS transaction_count
        FROM transactions
        WHERE amount > 0
          AND category <> 'transfer'
        GROUP BY normalized_merchant
        ORDER BY total_spend DESC
        LIMIT $1
        `,
        [limit]
    );

    return result.rows;
}

export async function getSpendingSummary() {

    const totalSpend = await pool.query(`
        SELECT
            COALESCE(SUM(amount), 0) AS total_spend
        FROM transactions
        WHERE amount > 0
          AND category <> 'transfer'
    `);

    const topMerchant = await pool.query(`
        SELECT
            normalized_merchant,
            SUM(amount) AS total_spend
        FROM transactions
        WHERE amount > 0
          AND category <> 'transfer'
        GROUP BY normalized_merchant
        ORDER BY total_spend DESC
        LIMIT 1
    `);

    const topCategory = await pool.query(`
        SELECT
            category,
            SUM(amount) AS total_spend
        FROM transactions
        WHERE amount > 0
          AND category <> 'transfer'
        GROUP BY category
        ORDER BY total_spend DESC
        LIMIT 1
    `);

    const txCount = await pool.query(`
        SELECT COUNT(*) AS transaction_count
        FROM transactions
    `);

    return {
        totalSpend: totalSpend.rows[0].total_spend,
        topMerchant: topMerchant.rows[0],
        topCategory: topCategory.rows[0],
        transactionCount: txCount.rows[0].transaction_count
    };
}