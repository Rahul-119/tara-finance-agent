import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";

import { taraAgent } from "./mastra/agents/taraAgent.js";

function log(message: object) {
	fs.appendFileSync(
		"app.log",
		JSON.stringify(message) + "\n"
	);
}

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.json({
		message: "Tara Finance Assistant API",
		endpoint: "POST /ask"
	});
});

app.post("/ask", async (req, res) => {
	const requestId = crypto.randomUUID();
	const start = Date.now();
	const question = req.body.question;

	try {
		if (!question) {
			return res.status(400).json({
				answer: "question is required",
			});
		}

		log({
			requestId,
			question,
			status: "started"
		});

		const response = await taraAgent.generate(question);

		log({
			requestId,
			question,
			status: "success",
			latencyMs: Date.now() - start
		});

		res.json({
			answer: response.text,
		});

	} catch (error) {
		console.error("ASK ERROR:", error);

        log({
            requestId,
            question,
            status: "failure",
            error: String(error),
            latencyMs: Date.now() - start
        });

        res.status(500).json({
            answer: String(error)
        });
	}
});

app.get("/health", async (req, res) => {
    res.json({
        databaseUrlExists: !!process.env.DATABASE_URL,
        googleKeyExists: !!process.env.GOOGLE_API_KEY,
    });
});

import pool from "./db/connection.js";

app.get("/db-health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            connected: true,
            time: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            connected: false,
            error: String(error)
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});