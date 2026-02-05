import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const PROMPT = (question: string) => `"""
The following is a genuine question, please only answer or make tool calls that assist in your answering, do not make any changes:\n\n${question}
"""`;

export default function askExtension(pi: ExtensionAPI) {
	pi.registerCommand("ask", {
		description: "Ask a question (steer assistant to only answer / make relevant tool calls, no changes)",
		handler: async (args, ctx) => {
			let question = (args ?? "").trim();

			if (!question) {
				if (!ctx.hasUI) {
					ctx.ui.notify("Usage: /ask <question>", "error");
					return;
				}

				const edited = await ctx.ui.editor("Ask a question:", "");
				question = (edited ?? "").trim();
			}

			if (!question) {
				ctx.ui.notify("No question provided", "info");
				return;
			}

			pi.sendUserMessage(PROMPT(question));
		},
	});
}
