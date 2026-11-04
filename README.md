# hack1984-local-agent

A tool-calling agent in one file with no dependencies, for the **HACK1984 Local Inference** workshop (Sat Nov 7, 300 Mass Ave, Boston). It talks to anything that speaks the OpenAI chat completions API, so the same code runs on a local model through Ollama, or on a hosted one (Groq, OpenAI) by changing one environment variable.

## You need

- [Ollama](https://ollama.com/download) running, with a model pulled: `ollama pull qwen2.5:7b`
- Node.js 20.6 or newer (`node --version`)
- git

## Run it (Checkpoint 3)

```bash
git clone https://github.com/shourya0523/hack1984-local-agent
cd hack1984-local-agent
cp .env.example .env        # Windows PowerShell: copy .env.example .env
npm start
```

`.env` points at Ollama by default:

```
BASE_URL=http://localhost:11434/v1
API_KEY=ollama
MODEL=qwen2.5:7b
```

Use the 7B. The 3B fumbles tool calls. On an 8 GB laptop, run `ollama stop llama3.2:3b` first so both models aren't loaded at once. `npm run check` tells you whether the agent can reach your model.

## Give it hands (Checkpoint 3, part two)

Open `tools.js`, copy the `get_time` tool, and make one that only your laptop can answer: read a file in `~/notes`, search a folder you'd never upload, or check your battery. Restart with `npm start` and ask something that needs it. A red `[tool]` line means the model called your tool. If it made something up instead, tighten the tool's `description`.

Stuck or behind? `git checkout checkpoint-3` has a finished version with `read_note`, `search_folder` and `check_battery`.

## Laptop says no?

Swap the three lines in `.env` for the Groq fallback (the key is on the whiteboard and is revoked after the event):

```
BASE_URL=https://api.groq.com/openai/v1
API_KEY=gsk_...
MODEL=llama-3.3-70b-versatile
```

Same agent, hosted model. Note that your prompts now leave the laptop, which is the opposite of the point, so switch back when you can.

## Organizers

`usb/` has the script for preparing the offline USB drives (installers and models).
