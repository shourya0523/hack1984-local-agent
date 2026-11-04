// Tools the agent can call. Each one is: a name, a description the model reads,
// a JSON Schema for its arguments, and a run() function that does the real work.
//
// Checkpoint 3, part two: add ONE tool that only your laptop can answer.
// Ideas: read a file in ~/notes, search a folder you'd never upload, check your battery.
// Copy the get_time tool below, change it, restart with `npm start`, then ask the
// agent something that needs it. If you see a red [tool] line, it worked.

export const tools = [
  {
    name: "get_time",
    description: "Get the current local date and time on this laptop.",
    parameters: { type: "object", properties: {}, required: [] },
    run: async () => new Date().toString(),
  },

  // {
  //   name: "your_tool_here",
  //   description: "What it does, written for the model. Be specific.",
  //   parameters: {
  //     type: "object",
  //     properties: { path: { type: "string", description: "..." } },
  //     required: ["path"],
  //   },
  //   run: async ({ path }) => { /* do the thing, return a string */ },
  // },
];
