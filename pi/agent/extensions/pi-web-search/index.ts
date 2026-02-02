/**
 * Pi Web Search Extension - Exa API Integration
 *
 * A web search tool for pi using Exa's free API tier.
 * Similar to opencode's web search implementation.
 *
 * Features:
 * - Neural/keyword/auto search modes
 * - Content extraction (full text, highlights, summary)
 * - Configurable result count
 * - Domain filtering (include/exclude)
 *
 * Setup:
 *   1. Get a free API key from https://exa.ai
 *   2. Set EXA_API_KEY environment variable or add to .env file
 *
 * Usage:
 *   The LLM can call the web_search tool to search the web
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "@mariozechner/pi-ai";
import { Text } from "@mariozechner/pi-tui";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import dotenv from "dotenv";

// Exa API types
interface ExaSearchResult {
	title: string;
	url: string;
	publishedDate?: string;
	author?: string;
	score?: number;
	id: string;
	text?: string;
	highlights?: string[];
	highlightScores?: number[];
	summary?: string;
}

interface ExaSearchResponse {
	requestId: string;
	autopromptString?: string;
	results: ExaSearchResult[];
}

interface ExaErrorResponse {
	error: string;
	message?: string;
}

// Configuration
interface WebSearchConfig {
	apiKey?: string;
	defaultNumResults?: number;
	defaultSearchType?: "auto" | "keyword" | "neural";
	defaultContents?: {
		text?: boolean | { maxCharacters?: number; includeHtmlTags?: boolean };
		highlights?: boolean | { numSentences?: number; highlightsPerUrl?: number; query?: string };
		summary?: boolean | { query?: string };
	};
	includeDomains?: string[];
	excludeDomains?: string[];
}

// Load .env files
function loadEnvFiles(cwd: string): void {
	const envPaths = [
		path.join(cwd, ".env"),
		path.join(cwd, ".env.local"),
		path.join(cwd, ".env.development"),
		path.join(os.homedir(), ".env"),
	];

	for (const envPath of envPaths) {
		if (fs.existsSync(envPath)) {
			dotenv.config({ path: envPath });
		}
	}
}

// Load configuration from .web-search.json
function loadConfig(cwd: string): WebSearchConfig {
	const configPaths = [
		path.join(cwd, ".web-search.json"),
		path.join(os.homedir(), ".web-search.json"),
	];

	for (const configPath of configPaths) {
		if (fs.existsSync(configPath)) {
			try {
				const content = fs.readFileSync(configPath, "utf-8");
				return JSON.parse(content);
			} catch (e) {
				console.error(`Failed to parse ${configPath}:`, e);
			}
		}
	}

	return {};
}

// Get API key from config or environment
function getApiKey(config: WebSearchConfig): string | undefined {
	if (config.apiKey) {
		// Support $ENV_VAR syntax
		if (config.apiKey.startsWith("$")) {
			return process.env[config.apiKey.slice(1)];
		}
		return config.apiKey;
	}
	return process.env.EXA_API_KEY;
}

// Perform Exa search
async function exaSearch(
	query: string,
	options: {
		apiKey: string;
		numResults?: number;
		type?: "auto" | "keyword" | "neural";
		useAutoprompt?: boolean;
		contents?: WebSearchConfig["defaultContents"];
		includeDomains?: string[];
		excludeDomains?: string[];
		startPublishedDate?: string;
		endPublishedDate?: string;
	},
	signal?: AbortSignal
): Promise<ExaSearchResponse> {
	const {
		apiKey,
		numResults = 10,
		type = "auto",
		useAutoprompt = true,
		contents,
		includeDomains,
		excludeDomains,
		startPublishedDate,
		endPublishedDate,
	} = options;

	const body: Record<string, unknown> = {
		query,
		numResults,
		type,
		useAutoprompt,
	};

	// Add contents configuration
	if (contents) {
		body.contents = contents;
	} else {
		// Default: get text content
		body.contents = {
			text: { maxCharacters: 3000 },
			highlights: { numSentences: 3 },
		};
	}

	// Add domain filters
	if (includeDomains?.length) {
		body.includeDomains = includeDomains;
	}
	if (excludeDomains?.length) {
		body.excludeDomains = excludeDomains;
	}

	// Add date filters
	if (startPublishedDate) {
		body.startPublishedDate = startPublishedDate;
	}
	if (endPublishedDate) {
		body.endPublishedDate = endPublishedDate;
	}

	const response = await fetch("https://api.exa.ai/search", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
		},
		body: JSON.stringify(body),
		signal,
	});

	if (!response.ok) {
		const errorText = await response.text();
		let errorMessage: string;
		try {
			const errorJson = JSON.parse(errorText) as ExaErrorResponse;
			errorMessage = errorJson.message || errorJson.error || errorText;
		} catch {
			errorMessage = errorText;
		}
		throw new Error(`Exa API error (${response.status}): ${errorMessage}`);
	}

	return (await response.json()) as ExaSearchResponse;
}

// Format search results for LLM
function formatResults(response: ExaSearchResponse, includeContent: boolean): string {
	const lines: string[] = [];

	if (response.autopromptString) {
		lines.push(`Search enhanced to: "${response.autopromptString}"\n`);
	}

	lines.push(`Found ${response.results.length} results:\n`);

	for (let i = 0; i < response.results.length; i++) {
		const result = response.results[i];
		lines.push(`### ${i + 1}. ${result.title}`);
		lines.push(`URL: ${result.url}`);

		if (result.publishedDate) {
			lines.push(`Published: ${result.publishedDate}`);
		}
		if (result.author) {
			lines.push(`Author: ${result.author}`);
		}
		if (result.score !== undefined) {
			lines.push(`Relevance: ${(result.score * 100).toFixed(1)}%`);
		}

		if (includeContent) {
			if (result.summary) {
				lines.push(`\n**Summary:** ${result.summary}`);
			}

			if (result.highlights?.length) {
				lines.push(`\n**Key excerpts:**`);
				for (const highlight of result.highlights) {
					lines.push(`- "${highlight.trim()}"`);
				}
			}

			if (result.text) {
				const truncatedText =
					result.text.length > 2000 ? result.text.slice(0, 2000) + "..." : result.text;
				lines.push(`\n**Content:**\n${truncatedText}`);
			}
		}

		lines.push(""); // Empty line between results
	}

	return lines.join("\n");
}

// Truncate output for LLM context
function truncateOutput(text: string, maxLength: number = 50000): { text: string; truncated: boolean } {
	if (text.length <= maxLength) {
		return { text, truncated: false };
	}
	return {
		text: text.slice(0, maxLength) + "\n\n[Output truncated...]",
		truncated: true,
	};
}

export default function (pi: ExtensionAPI) {
	let config: WebSearchConfig = {};
	let cwd = process.cwd();

	// Load config on session start
	pi.on("session_start", async (_event, ctx) => {
		cwd = ctx.cwd;
		loadEnvFiles(cwd);
		config = loadConfig(cwd);
	});

	// Register the web_search tool
	pi.registerTool({
		name: "web_search",
		label: "Web Search",
		description: `Search the web using Exa AI. Returns relevant web pages with content.

Use this tool to:
- Find current information about topics
- Research documentation, APIs, or technical content
- Look up recent news or updates
- Find tutorials, guides, or examples

Parameters:
- query: The search query (be specific for better results)
- numResults: Number of results (1-10, default: 5)
- type: Search type - "auto" (default), "keyword", or "neural"
- includeContent: Whether to include page content (default: true)
- includeDomains: Only search these domains (e.g., ["github.com", "stackoverflow.com"])
- excludeDomains: Exclude these domains from results`,

		parameters: Type.Object({
			query: Type.String({ description: "Search query" }),
			numResults: Type.Optional(
				Type.Number({ description: "Number of results (1-10)", minimum: 1, maximum: 10 })
			),
			type: Type.Optional(
				StringEnum(["auto", "keyword", "neural"] as const, {
					description: "Search type: auto (default), keyword, or neural",
				})
			),
			includeContent: Type.Optional(
				Type.Boolean({ description: "Include page content in results (default: true)" })
			),
			includeDomains: Type.Optional(
				Type.Array(Type.String(), { description: "Only search these domains" })
			),
			excludeDomains: Type.Optional(
				Type.Array(Type.String(), { description: "Exclude these domains" })
			),
		}),

		async execute(toolCallId, params, signal, onUpdate, ctx) {
			const {
				query,
				numResults = config.defaultNumResults ?? 5,
				type = config.defaultSearchType ?? "auto",
				includeContent = true,
				includeDomains = config.includeDomains,
				excludeDomains = config.excludeDomains,
			} = params as {
				query: string;
				numResults?: number;
				type?: "auto" | "keyword" | "neural";
				includeContent?: boolean;
				includeDomains?: string[];
				excludeDomains?: string[];
			};

			// Check for API key
			const apiKey = getApiKey(config);
			if (!apiKey) {
				return {
					content: [
						{
							type: "text",
							text: `Error: EXA_API_KEY not found.

To use web search:
1. Get a free API key from https://exa.ai
2. Set the EXA_API_KEY environment variable:
   export EXA_API_KEY=your-api-key

Or add to .env file in your project or home directory.`,
						},
					],
					details: { error: "API key not found" },
					isError: true,
				};
			}

			// Show progress
			onUpdate?.({
				content: [{ type: "text", text: `Searching for: "${query}"...` }],
				details: { status: "searching" },
			});

			try {
				const contents = includeContent
					? {
							text: { maxCharacters: 3000 },
							highlights: { numSentences: 3 },
						}
					: undefined;

				const response = await exaSearch(
					query,
					{
						apiKey,
						numResults,
						type,
						useAutoprompt: true,
						contents,
						includeDomains,
						excludeDomains,
					},
					signal
				);

				const formatted = formatResults(response, includeContent);
				const { text: truncatedText, truncated } = truncateOutput(formatted);

				return {
					content: [{ type: "text", text: truncatedText }],
					details: {
						query,
						type,
						numResults: response.results.length,
						autoprompt: response.autopromptString,
						truncated,
						results: response.results.map((r) => ({
							title: r.title,
							url: r.url,
							score: r.score,
						})),
					},
				};
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				return {
					content: [{ type: "text", text: `Search failed: ${errorMessage}` }],
					details: { error: errorMessage },
					isError: true,
				};
			}
		},

		// Custom rendering for tool call
		renderCall(args, theme) {
			const { query, numResults, type, includeDomains } = args as {
				query: string;
				numResults?: number;
				type?: string;
				includeDomains?: string[];
			};

			let text = theme.fg("toolTitle", theme.bold("web_search "));
			text += theme.fg("accent", `"${query}"`);

			const opts: string[] = [];
			if (numResults) opts.push(`${numResults} results`);
			if (type && type !== "auto") opts.push(type);
			if (includeDomains?.length) opts.push(`domains: ${includeDomains.join(", ")}`);

			if (opts.length) {
				text += theme.fg("muted", ` (${opts.join(", ")})`);
			}

			return new Text(text, 0, 0);
		},

		// Custom rendering for tool result
		renderResult(result, { expanded, isPartial }, theme) {
			if (isPartial) {
				return new Text(theme.fg("warning", "Searching..."), 0, 0);
			}

			const details = result.details as {
				error?: string;
				numResults?: number;
				autoprompt?: string;
				truncated?: boolean;
				results?: Array<{ title: string; url: string; score?: number }>;
			};

			if (details?.error) {
				return new Text(theme.fg("error", `✗ ${details.error}`), 0, 0);
			}

			let text = theme.fg("success", `✓ Found ${details?.numResults ?? 0} results`);

			if (details?.autoprompt) {
				text += theme.fg("muted", ` (enhanced: "${details.autoprompt}")`);
			}

			if (details?.truncated) {
				text += theme.fg("warning", " [truncated]");
			}

			// Show result titles in expanded view
			if (expanded && details?.results?.length) {
				text += "\n";
				for (const r of details.results.slice(0, 5)) {
					const score = r.score !== undefined ? ` (${(r.score * 100).toFixed(0)}%)` : "";
					text += `\n  ${theme.fg("accent", "•")} ${r.title}${theme.fg("muted", score)}`;
					text += `\n    ${theme.fg("dim", r.url)}`;
				}
				if (details.results.length > 5) {
					text += theme.fg("muted", `\n  ... and ${details.results.length - 5} more`);
				}
			}

			return new Text(text, 0, 0);
		},
	});

	// Register /search command for quick searches
	pi.registerCommand("search", {
		description: "Quick web search (usage: /search <query>)",
		handler: async (args, ctx) => {
			if (!args?.trim()) {
				ctx.ui.notify("Usage: /search <query>", "warning");
				return;
			}

			const apiKey = getApiKey(config);
			if (!apiKey) {
				ctx.ui.notify("EXA_API_KEY not set. Get one at https://exa.ai", "error");
				return;
			}

			ctx.ui.notify(`Searching: ${args}...`, "info");

			try {
				const response = await exaSearch(args, {
					apiKey,
					numResults: 5,
					type: "auto",
					useAutoprompt: true,
					contents: {
						text: { maxCharacters: 1500 },
						highlights: { numSentences: 2 },
					},
				});

				const formatted = formatResults(response, true);
				const { text } = truncateOutput(formatted, 30000);

				// Send as a message to the agent
				pi.sendMessage(
					{
						customType: "web-search",
						content: `Web search results for "${args}":\n\n${text}`,
						display: true,
						details: { query: args, results: response.results.length },
					},
					{ triggerTurn: false }
				);
			} catch (error) {
				const msg = error instanceof Error ? error.message : String(error);
				ctx.ui.notify(`Search failed: ${msg}`, "error");
			}
		},
	});

	// Register message renderer for search results
	pi.registerMessageRenderer("web-search", (message, options, theme) => {
		const { expanded } = options;
		const details = message.details as { query?: string; results?: number };

		let text = theme.fg("accent", "🔍 ");
		text += theme.bold(`Web Search: "${details?.query ?? "unknown"}"`);
		text += theme.fg("muted", ` (${details?.results ?? 0} results)`);

		if (expanded) {
			text += "\n\n" + message.content;
		}

		return new Text(text, 0, 0);
	});
}
