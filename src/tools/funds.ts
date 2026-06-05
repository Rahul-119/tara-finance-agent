import pool from "../db/connection.js";

export async function getFundPerformance(fundId: string) {
    const result = await pool.query(
        `
        SELECT
            nav_date,
            nav_value
        FROM fund_nav
        WHERE fund_id = $1
        ORDER BY nav_date
        `,
        [fundId]
    );

    if (result.rows.length === 0) {
        throw new Error(`Fund '${fundId}' not found`);
    }

    const first = Number(result.rows[0].nav_value);

    const last = Number(
        result.rows[result.rows.length - 1].nav_value
    );

    return {
        fundId,
        startNav: first,
        endNav: last,
        returnPct: Number(
            (((last - first) / first) * 100).toFixed(2)
        )
    };
}

export async function getBestPerformingFund() {
    const result = await pool.query(`
        WITH ranked_nav AS (
            SELECT
                fund_id,
                nav_value,
                ROW_NUMBER() OVER (
                    PARTITION BY fund_id
                    ORDER BY nav_date ASC
                ) AS rn_first,
                ROW_NUMBER() OVER (
                    PARTITION BY fund_id
                    ORDER BY nav_date DESC
                ) AS rn_last
            FROM fund_nav
        ),

        first_last AS (
            SELECT
                fund_id,
                MAX(CASE WHEN rn_first = 1 THEN nav_value END) AS first_nav,
                MAX(CASE WHEN rn_last = 1 THEN nav_value END) AS last_nav
            FROM ranked_nav
            GROUP BY fund_id
        )

        SELECT
            f.id AS fund_id,
            f.name,
            ROUND(
                (
                    (last_nav - first_nav)
                    / first_nav
                ) * 100
            ,2) AS return_pct
        FROM first_last fl
        JOIN funds f
            ON fl.fund_id = f.id
        ORDER BY return_pct DESC
        LIMIT 1
    `);

    return result.rows[0];
}   