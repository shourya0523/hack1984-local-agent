// Tools the agent can call. Each one is: a name, a description the model reads,
// a JSON Schema for its arguments, and a run() function that does the real work.
//
// This is the finished version from Checkpoint 3, part two: three tools that only
// your laptop can answer. Nothing here leaves the machine.

import { readFile, readdir, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";
import path from "node:path";

const run = promisify(execFile);
const NOTES_DIR = path.join(os.homedir(), "notes");
const expand = (p) => (p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p);

export const tools = [
  {
    name: "get_time",
    description: "Get the current local date and time on this laptop.",
    parameters: { type: "object", properties: {}, required: [] },
    run: async () => new Date().toString(),
  },

  {
    name: "read_note",
    description:
      "Read a text file from the user's ~/notes folder. Call with no filename to list the notes first.",
    parameters: {
      type: "object",
      properties: { filename: { type: "string", description: "File name inside ~/notes, e.g. ideas.md" } },
      required: [],
    },
    run: async ({ filename } = {}) => {
      if (!filename) return (await readdir(NOTES_DIR)).join("\n") || "(no notes)";
      const file = path.resolve(NOTES_DIR, filename);
      if (!file.startsWith(NOTES_DIR)) return "Error: only files inside ~/notes";
      return (await readFile(file, "utf8")).slice(0, 8000);
    },
  },

  {
    name: "search_folder",
    description:
      "Search file names and text contents in a local folder for a word or phrase. Returns matching files and lines.",
    parameters: {
      type: "object",
      properties: {
        folder: { type: "string", description: "Folder to search, e.g. ~/Documents/private" },
        query: { type: "string", description: "Text to look for (case-insensitive)" },
      },
      required: ["folder", "query"],
    },
    run: async ({ folder, query }) => {
      const root = path.resolve(expand(folder));
      const q = query.toLowerCase();
      const hits = [];
      async function walk(dir, depth) {
        if (depth > 3 || hits.length >= 20) return;
        for (const entry of await readdir(dir, { withFileTypes: true })) {
          if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) { await walk(full, depth + 1); continue; }
          if (entry.name.toLowerCase().includes(q)) hits.push(`${full} (name match)`);
          if ((await stat(full)).size > 500_000) continue;
          const lines = (await readFile(full, "utf8").catch(() => "")).split("\n");
          lines.forEach((line, i) => {
            if (hits.length < 20 && line.toLowerCase().includes(q)) hits.push(`${full}:${i + 1}: ${line.trim().slice(0, 160)}`);
          });
        }
      }
      await walk(root, 0);
      return hits.join("\n") || `No matches for "${query}" in ${root}`;
    },
  },

  {
    name: "check_battery",
    description: "Check this laptop's battery percentage and whether it is charging.",
    parameters: { type: "object", properties: {}, required: [] },
    run: async () => {
      if (process.platform === "darwin") return (await run("pmset", ["-g", "batt"])).stdout.trim();
      if (process.platform === "win32") {
        const ps = "Get-CimInstance Win32_Battery | Select-Object EstimatedChargeRemaining,BatteryStatus | ConvertTo-Json";
        return (await run("powershell", ["-NoProfile", "-Command", ps])).stdout.trim() || "No battery found";
      }
      const base = "/sys/class/power_supply";
      for (const dev of await readdir(base).catch(() => [])) {
        if (!dev.startsWith("BAT")) continue;
        const cap = (await readFile(path.join(base, dev, "capacity"), "utf8")).trim();
        const status = (await readFile(path.join(base, dev, "status"), "utf8")).trim();
        return `${cap}% (${status})`;
      }
      return "No battery found (desktop, or a very confident laptop)";
    },
  },
];
