// HACK1984 / Local Inference: a tool-calling agent in one file, no dependencies.
// Talks to anything that speaks the OpenAI chat completions API: Ollama, Groq, OpenAI.
import readline from "node:readline";
import { stdin, stdout } from "node:process";
import { tools } from "./tools.js";

// strips "# comments" that some Node versions leave on .env values
const env = (key, fallback) => (process.env[key] || fallback).split(/\s+#/)[0].trim();
const BASE_URL = env("BASE_URL", "http://localhost:11434/v1").replace(/\/$/, "");
const API_KEY = env("API_KEY", "ollama");
const MODEL = env("MODEL", "qwen2.5:7b");
const MAX_STEPS = 6; // stops the model from calling tools forever

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

const toolSpecs = tools.map(({ name, description, parameters }) => ({
  type: "function",
  function: { name, description, parameters },
}));

const messages = [
  {
    role: "system",
    content:
      "You are a helpful agent running on the user's own laptop. " +
      "When a tool can answer the question, call it instead of guessing. " +
      "Keep answers short.",
  },
];

async function chat() {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages, tools: toolSpecs }),
  }).catch(() => {
    throw new Error(`can't reach ${BASE_URL}. Is Ollama running? Try: ollama serve`);
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message;
}

async function runTool(call) {
  const tool = tools.find((t) => t.name === call.function.name);
  if (!tool) return `Error: no tool called ${call.function.name}`;
  let args = {};
  try {
    args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
  } catch {
    return "Error: arguments were not valid JSON";
  }
  console.log(red(`  [tool] ${tool.name}(${JSON.stringify(args)})`));
  try {
    const out = await tool.run(args);
    return typeof out === "string" ? out : JSON.stringify(out);
  } catch (err) {
    return `Error: ${err.message}`;
  }
}

async function turn(userText) {
  messages.push({ role: "user", content: userText });
  for (let step = 0; step < MAX_STEPS; step++) {
    const msg = await chat();
    messages.push(msg);
    if (!msg.tool_calls?.length) return msg.content;
    for (const call of msg.tool_calls) {
      messages.push({ role: "tool", tool_call_id: call.id, content: await runTool(call) });
    }
  }
  return "(stopped after too many tool calls)";
}

async function check() {
  try {
    const res = await fetch(`${BASE_URL}/models`, { headers: { Authorization: `Bearer ${API_KEY}` } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const { data = [] } = await res.json();
    const ids = data.map((m) => m.id);
    console.log(`Reached ${BASE_URL}. Models: ${ids.join(", ") || "(none)"}`);
    if (!ids.includes(MODEL)) console.log(red(`MODEL=${MODEL} is not in that list. Run: ollama pull ${MODEL}`));
    else console.log(`MODEL=${MODEL} is ready.`);
  } catch (err) {
    console.log(red(`Could not reach ${BASE_URL} (${err.message}). Is Ollama running? Try: ollama serve`));
    process.exitCode = 1;
  }
}

if (process.argv.includes("--check")) {
  await check();
} else {
  console.log(dim(`HACK1984 local agent / ${MODEL} @ ${BASE_URL}`));
  console.log(dim(`Tools: ${tools.map((t) => t.name).join(", ")}. Type "exit" to quit.\n`));
  const rl = readline.createInterface({ input: stdin, output: stdout, prompt: "you > " });
  rl.prompt();
  for await (const line of rl) {
    const text = line.trim();
    if (["exit", "quit", "/bye"].includes(text)) break;
    if (text) {
      try {
        console.log(`agent > ${await turn(text)}\n`);
      } catch (err) {
        console.log(red(`error > ${err.message}\n`));
      }
    }
    rl.prompt();
  }
  rl.close();
}
