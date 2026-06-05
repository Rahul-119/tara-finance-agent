import fs from "fs";

const questions = JSON.parse(
    fs.readFileSync("./eval/questions.json", "utf8")
);

async function run() {
    for (const question of questions) {
        try {
            const response = await fetch(
                "http://localhost:3000/ask",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        question
                    })
                }
            );

            const data = await response.json();

            console.log("\n================================");
            console.log("QUESTION:");
            console.log(question);

            console.log("\nANSWER:");
            console.log(data.answer);
        } catch (error) {
            console.log("\n================================");
            console.log("QUESTION:");
            console.log(question);

            console.log("\nERROR:");
            console.log(error);
        }
    }
}

run();