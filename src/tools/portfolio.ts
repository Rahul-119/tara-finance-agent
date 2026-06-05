import pool from "../db/connection.js";

export async function getPortfolioValue() {
	const result = await pool.query(`
        SELECT SUM(h.units * fn.nav_value) AS portfolio_value
        FROM holdings h
        JOIN (
            SELECT DISTINCT ON (fund_id)
                fund_id,
                nav_value
            FROM fund_nav
            ORDER BY fund_id, nav_date DESC
        ) fn
        ON h.fund_id = fn.fund_id
    `);

	return {
		portfolioValue: Number(
			Number(result.rows[0].portfolio_value).toFixed(2),
		),
	};
}

export async function getPortfolioAllocation() {
	const result = await pool.query(`
        WITH latest_nav AS (
            SELECT DISTINCT ON (fund_id)
                fund_id,
                nav_value
            FROM fund_nav
            ORDER BY fund_id, nav_date DESC
        ),
        holding_values AS (
            SELECT
                h.fund_id,
                f.name,
                h.units * ln.nav_value AS current_value
            FROM holdings h
            JOIN latest_nav ln
                ON h.fund_id = ln.fund_id
            JOIN funds f
                ON h.fund_id = f.id
        )
        SELECT
            fund_id,
            name,
            ROUND(current_value::numeric,2) AS current_value,
            ROUND((current_value/SUM(current_value) OVER ()) * 100,2) AS allocation_pct
        FROM holding_values
        ORDER BY allocation_pct DESC
    `);

	return result.rows;
}

export async function getPortfolioPerformance() {
    const result = await pool.query(`
        WITH latest_nav AS (
            SELECT DISTINCT ON (fund_id)
                fund_id,
                nav_value
            FROM fund_nav
            ORDER BY fund_id, nav_date DESC
        )

        SELECT
            SUM(h.units * h.purchase_nav) AS invested_amount,
            SUM(h.units * ln.nav_value) AS current_value
        FROM holdings h
        JOIN latest_nav ln
            ON h.fund_id = ln.fund_id
    `);

    const invested = Number(result.rows[0].invested_amount);
    const current = Number(result.rows[0].current_value);

    const gainLoss = current - invested;

    return {
        investedAmount: Number(invested.toFixed(2)),
        currentValue: Number(current.toFixed(2)),
        gainLoss: Number(gainLoss.toFixed(2)),
        gainLossPct: Number(
            ((gainLoss / invested) * 100).toFixed(2)
        )
    };
}