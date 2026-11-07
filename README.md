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

The agent ships with four tools that only your laptop can answer, all in `tools.js`:

- `get_time`: the laptop's clock
- `read_note`: reads a file in `~/notes` (try `mkdir -p ~/notes && echo "pitch at 11am Sunday" > ~/notes/ideas.md`)
- `search_folder`: searches a folder you'd never upload
- `check_battery`: battery level, on Mac, Windows or Linux

Ask something that needs one, like "what's in my ideas note?" A red `[tool]` line means the model called it. Then add your own: copy one of them in `tools.js`, change it, and restart with `npm start`. If the model made something up instead of calling your tool, tighten the tool's `description`.

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
