/**
 * Plan Review Server
 *
 * HTTP server that serves the plan review web page and handles
 * the submission of review decisions.
 */

import http from "node:http";
import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ImplementationPlan } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface PlanReviewResult {
	decision: "approve" | "modify" | "reject";
	selectedPhases: number[];
	priority: string;
	approach: string;
	requirements: string[];
	constraints: string[];
	notes: string;
}

interface PlanServerOptions {
	plan: ImplementationPlan;
	cwd: string;
	timeout: number;
	onSubmit: (result: PlanReviewResult) => void;
	onCancel: () => void;
}

interface ServerHandle {
	url: string;
	close: () => void;
}

export async function startPlanServer(options: PlanServerOptions): Promise<ServerHandle> {
	const { plan, cwd, timeout, onSubmit, onCancel } = options;
	const sessionToken = randomUUID();

	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let lastActivity = Date.now();

	const resetTimeout = () => {
		lastActivity = Date.now();
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			onCancel();
		}, timeout * 1000);
	};

	resetTimeout();

	const server = http.createServer((req, res) => {
		const url = new URL(req.url || "/", `http://${req.headers.host}`);
		const urlSessionToken = url.searchParams.get("session");

		// CORS headers for local development
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type");

		if (req.method === "OPTIONS") {
			res.writeHead(200);
			res.end();
			return;
		}

		// Serve static files
		if (req.method === "GET") {
			resetTimeout();

			if (url.pathname === "/" || url.pathname === "/index.html") {
				const htmlPath = join(__dirname, "form", "index.html");
				if (!existsSync(htmlPath)) {
					res.writeHead(500, { "Content-Type": "text/plain" });
					res.end("Form HTML not found");
					return;
				}

				let html = readFileSync(htmlPath, "utf-8");
				
				// Inject plan data
				const planData = JSON.stringify({
					plan,
					cwd,
					sessionToken,
					timeout,
				});
				
				html = html.replace("__PLAN_DATA_JSON__", planData);
				html = html.replace(/__SESSION_TOKEN__/g, sessionToken);

				res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
				res.end(html);
				return;
			}

			if (url.pathname === "/styles.css") {
				const cssPath = join(__dirname, "form", "styles.css");
				if (existsSync(cssPath)) {
					res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
					res.end(readFileSync(cssPath, "utf-8"));
					return;
				}
			}

			if (url.pathname === "/script.js") {
				const jsPath = join(__dirname, "form", "script.js");
				if (existsSync(jsPath)) {
					res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
					res.end(readFileSync(jsPath, "utf-8"));
					return;
				}
			}

			// Heartbeat endpoint
			if (url.pathname === "/heartbeat") {
				resetTimeout();
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ ok: true, remaining: Math.max(0, timeout - Math.floor((Date.now() - lastActivity) / 1000)) }));
				return;
			}
		}

		// Handle form submission
		if (req.method === "POST" && url.pathname === "/submit") {
			let body = "";
			req.on("data", (chunk) => {
				body += chunk;
			});
			req.on("end", () => {
				try {
					const result = JSON.parse(body) as PlanReviewResult;
					
					if (timeoutId) {
						clearTimeout(timeoutId);
					}

					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ success: true }));

					// Give the browser time to show success state
					setTimeout(() => {
						onSubmit(result);
					}, 500);
				} catch (err) {
					res.writeHead(400, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ error: "Invalid JSON" }));
				}
			});
			return;
		}

		// Handle cancel
		if (req.method === "POST" && url.pathname === "/cancel") {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ success: true }));

			setTimeout(() => {
				onCancel();
			}, 500);
			return;
		}

		// 404 for everything else
		res.writeHead(404, { "Content-Type": "text/plain" });
		res.end("Not Found");
	});

	// Find an available port
	return new Promise((resolve, reject) => {
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			if (!address || typeof address === "string") {
				reject(new Error("Failed to get server address"));
				return;
			}

			const url = `http://127.0.0.1:${address.port}/?session=${sessionToken}`;

			resolve({
				url,
				close: () => {
					if (timeoutId) {
						clearTimeout(timeoutId);
					}
					server.close();
				},
			});
		});

		server.on("error", reject);
	});
}
