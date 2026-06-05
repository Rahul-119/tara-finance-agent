import { readFile, readdir } from "fs/promises";
import pool from "../db/connection.js";
import path from "path";
import dotenv from "dotenv";
import normalizeMerchant from "../utils/merchantNormalizer.js";
dotenv.config();

const dataDir = process.env.DATA_DIR;

if (!dataDir) {
	throw new Error("DATA_DIR not set");
}

async function loadJson(fileName: string) {
	const filePath = path.join(dataDir!, fileName);
	const fileContent = await readFile(filePath, "utf-8");
	const data = JSON.parse(fileContent);

	return data;
}

async function populate() {
	try {
		await pool.query("BEGIN");

		const funds = await loadJson("funds.json");

		console.log(`Loaded ${funds.length} entries`);

		for (const fnd of funds) {
			await pool.query(
				`INSERT INTO funds(id, name, category) 
                        VALUES($1, $2, $3)`,
				[fnd.id, fnd.name, fnd.category],
			);

			const fund_nav = fnd.nav;

			for (const nav of fund_nav) {
				await pool.query(
					`INSERT INTO fund_nav(fund_id, nav_date, nav_value) 
                        VALUES($1, $2, $3)`,
					[fnd.id, nav.date, nav.value],
				);
			}
		}

		const holdings = await loadJson("holdings.json");

		console.log(`Loaded ${holdings.length} entries`);

		for (const hds of holdings) {
			await pool.query(
				`INSERT INTO holdings (fund_id, units, purchase_date, purchase_nav) 
                        VALUES($1, $2, $3, $4)`,
				[hds.fund_id, hds.units, hds.purchase_date, hds.purchase_nav],
			);
		}

		const transactions = await loadJson("transactions.json");

		console.log(`Loaded ${transactions.length} entries`);

		for (const tx of transactions) {
			const normalizedMerchant = normalizeMerchant(tx.merchant);

			await pool.query(
				`INSERT INTO transactions (id, transaction_date, merchant, normalized_merchant, category, amount, currency, memo) 
                        VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
				[
					tx.id,
					tx.date,
					tx.merchant,
					normalizedMerchant,
					tx.category,
					tx.amount,
					tx.currency,
					tx.memo,
				],
			);
		}

		await pool.query("COMMIT");
	} catch (err) {
		await pool.query("ROLLBACK");
		throw err;
	}

	await pool.end();
}

populate().catch(console.error);