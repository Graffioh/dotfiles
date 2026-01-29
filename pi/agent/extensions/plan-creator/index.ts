/**
 * Plan Creator Extension
 *
 * Creates implementation plans and shows them via a web UI for review.
 * The web page displays the full plan with formatting, plus interactive
 * elements for approval, phase selection, notes, etc.
 */

import { complete, type UserMessage } from "@mariozechner/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { BorderedLoader } from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { startPlanServer, type PlanReviewResult } from "./server.js";

// ===== Types =====

export interface PlanPhase {
	number: number;
	name: string;
	description: string;
	tasks: string[];
	successCriteria: {
		automated: string[];
		manual: string[];
	};
	implementationNotes?: string;
}

export interface ImplementationPlan {
	title: string;
	overview: string;
	currentState?: string;
	desiredEndState?: string;
	outOfScope?: string[];
	phases: PlanPhase[];
	testingStrategy?: {
		unit: string[];
		integration: string[];
		manual: string[];
	};
	references?: string[];
}

interface PlanDetails {
	plan: ImplementationPlan;
	status: "pending" | "approved" | "rejected";
	review?: PlanReviewResult;
	savedPath?: string;
}

// ===== Constants =====

const PLAN_SYSTEM_PROMPT = `You are an expert implementation planner. Create detailed, actionable implementation plans through thorough analysis.

## Core Principles

1. **Be Skeptical & Thorough**:
   - Question vague requirements
   - Identify potential issues early
   - Don't assume - base decisions on provided context
   - Include specific file paths and references where relevant

2. **No Open Questions**:
   - The plan must be complete and actionable
   - Every decision must be made - do NOT leave unresolved questions
   - If context is insufficient, make reasonable assumptions and document them

3. **Be Practical**:
   - Focus on incremental, testable changes
   - Consider migration and rollback scenarios
   - Think about edge cases
   - Explicitly list what's OUT of scope

## Output Format

Output MUST be valid JSON matching this structure:
{
  "title": "string - descriptive title for the implementation",
  "overview": "string - 1-2 sentence summary of what we're implementing and why",
  "currentState": "string - what exists now, key constraints, relevant file paths (optional)",
  "desiredEndState": "string - specification of the desired end state and how to verify it",
  "outOfScope": ["string array - explicitly list what we're NOT doing to prevent scope creep"],
  "phases": [
    {
      "number": 1,
      "name": "Phase Name",
      "description": "What this phase accomplishes and high-level approach",
      "tasks": [
        "Specific task 1 with file path if relevant",
        "Specific task 2 with implementation details"
      ],
      "successCriteria": {
        "automated": [
          "Specific command to run: \`bun run test path/to/test.ts\`",
          "Type checking passes: \`bun run typecheck\`",
          "Linting passes: \`bun run lint\`"
        ],
        "manual": [
          "Feature works as expected when tested via [specific method]",
          "Edge case X is handled correctly"
        ]
      },
      "implementationNotes": "After completing this phase and automated verification passes, pause for manual confirmation before proceeding to next phase."
    }
  ],
  "testingStrategy": {
    "unit": ["What to unit test", "Key edge cases to cover"],
    "integration": ["End-to-end scenarios to test"],
    "manual": ["Specific manual testing steps"]
  },
  "references": ["Related files or documentation paths"]
}

## Guidelines

- Break work into 2-5 logical phases, each independently valuable
- Each phase should have SPECIFIC success criteria:
  - **Automated**: Runnable commands (test commands, lint, typecheck)
  - **Manual**: Specific verification steps a human must perform
- Include file paths where changes are needed
- Consider database migrations, API changes, and client updates
- For refactoring: maintain backwards compatibility, include migration strategy`;

const PLANS_DIR = join(homedir(), ".pi/plans");

// ===== Helpers =====

function ensurePlansDir(): void {
	if (!existsSync(PLANS_DIR)) {
		mkdirSync(PLANS_DIR, { recursive: true });
	}
}

function generatePlanId(): string {
	const now = new Date();
	const date = now.toISOString().split("T")[0];
	const time = now.toTimeString().split(" ")[0].replace(/:/g, "");
	return `${date}-${time}`;
}

function planToMarkdown(plan: ImplementationPlan, review?: PlanReviewResult): string {
	const lines: string[] = [];

	lines.push(`# ${plan.title}`);
	lines.push("");
	
	if (review) {
		lines.push(`> **Status:** ${review.decision === "approve" ? "✅ Approved" : review.decision === "modify" ? "🔄 Approved with modifications" : "❌ Rejected"}`);
		lines.push(`> **Priority:** ${review.priority}`);
		lines.push(`> **Approach:** ${review.approach}`);
		lines.push("");
	}

	lines.push("## Overview");
	lines.push("");
	lines.push(plan.overview);
	lines.push("");

	if (plan.currentState) {
		lines.push("## Current State");
		lines.push("");
		lines.push(plan.currentState);
		lines.push("");
	}

	if (plan.desiredEndState) {
		lines.push("## Desired End State");
		lines.push("");
		lines.push(plan.desiredEndState);
		lines.push("");
	}

	if (plan.outOfScope && plan.outOfScope.length > 0) {
		lines.push("## Out of Scope");
		lines.push("");
		for (const item of plan.outOfScope) {
			lines.push(`- ${item}`);
		}
		lines.push("");
	}

	lines.push("## Implementation Phases");
	lines.push("");

	const selectedPhases = review?.selectedPhases || plan.phases.map((p) => p.number);

	for (const phase of plan.phases) {
		const included = selectedPhases.includes(phase.number);
		const status = included ? "✅" : "⏭️ Skipped";
		lines.push(`### Phase ${phase.number}: ${phase.name} ${status}`);
		lines.push("");
		
		if (!included) {
			lines.push("*This phase was excluded from the implementation scope.*");
			lines.push("");
			continue;
		}
		
		lines.push(phase.description);
		lines.push("");

		if (phase.tasks.length > 0) {
			lines.push("**Tasks:**");
			for (const task of phase.tasks) {
				lines.push(`- [ ] ${task}`);
			}
			lines.push("");
		}

		lines.push("**Success Criteria:**");
		lines.push("");
		if (phase.successCriteria.automated.length > 0) {
			lines.push("*Automated:*");
			for (const criterion of phase.successCriteria.automated) {
				lines.push(`- [ ] ${criterion}`);
			}
		}
		if (phase.successCriteria.manual.length > 0) {
			lines.push("");
			lines.push("*Manual:*");
			for (const criterion of phase.successCriteria.manual) {
				lines.push(`- [ ] ${criterion}`);
			}
		}
		lines.push("");

		if (phase.implementationNotes) {
			lines.push(`> **Implementation Note:** ${phase.implementationNotes}`);
			lines.push("");
		}

		lines.push("---");
		lines.push("");
	}

	if (plan.testingStrategy) {
		lines.push("## Testing Strategy");
		lines.push("");
		if (plan.testingStrategy.unit.length > 0) {
			lines.push("### Unit Tests");
			for (const item of plan.testingStrategy.unit) {
				lines.push(`- ${item}`);
			}
			lines.push("");
		}
		if (plan.testingStrategy.integration.length > 0) {
			lines.push("### Integration Tests");
			for (const item of plan.testingStrategy.integration) {
				lines.push(`- ${item}`);
			}
			lines.push("");
		}
		if (plan.testingStrategy.manual.length > 0) {
			lines.push("### Manual Testing");
			for (const item of plan.testingStrategy.manual) {
				lines.push(`- ${item}`);
			}
			lines.push("");
		}
	}

	if (review?.requirements && review.requirements.length > 0) {
		lines.push("## Additional Requirements");
		lines.push("");
		for (const req of review.requirements) {
			lines.push(`- ${req}`);
		}
		lines.push("");
	}

	if (review?.constraints && review.constraints.length > 0) {
		lines.push("## Constraints");
		lines.push("");
		for (const constraint of review.constraints) {
			lines.push(`- ${constraint}`);
		}
		lines.push("");
	}

	if (review?.notes) {
		lines.push("## User Notes");
		lines.push("");
		lines.push(review.notes);
		lines.push("");
	}

	if (plan.references && plan.references.length > 0) {
		lines.push("## References");
		lines.push("");
		for (const ref of plan.references) {
			lines.push(`- ${ref}`);
		}
		lines.push("");
	}

	lines.push("---");
	lines.push(`*Generated: ${new Date().toISOString()}*`);

	return lines.join("\n");
}

async function generatePlan(
	ctx: ExtensionContext,
	taskDescription: string,
	contextFiles: string[],
): Promise<ImplementationPlan | null> {
	if (!ctx.model) {
		ctx.ui.notify("No model selected", "error");
		return null;
	}

	// Build context from files
	let fileContext = "";
	for (const file of contextFiles) {
		if (existsSync(file)) {
			try {
				const content = readFileSync(file, "utf-8");
				fileContext += `\n\n--- File: ${file} ---\n${content}`;
			} catch {
				// Skip unreadable files
			}
		}
	}

	const userPrompt = `Create an implementation plan for the following task:

${taskDescription}

${fileContext ? `\nContext from files:${fileContext}` : ""}

Output ONLY valid JSON matching the required structure. No markdown, no explanation.`;

	const result = await ctx.ui.custom<ImplementationPlan | null>((tui, theme, _kb, done) => {
		const loader = new BorderedLoader(tui, theme, `Generating plan using ${ctx.model!.id}...`);
		loader.onAbort = () => done(null);

		const doGenerate = async () => {
			const apiKey = await ctx.modelRegistry.getApiKey(ctx.model!);
			const userMessage: UserMessage = {
				role: "user",
				content: [{ type: "text", text: userPrompt }],
				timestamp: Date.now(),
			};

			const response = await complete(
				ctx.model!,
				{ systemPrompt: PLAN_SYSTEM_PROMPT, messages: [userMessage] },
				{ apiKey, signal: loader.signal },
			);

			if (response.stopReason === "aborted") {
				return null;
			}

			const text = response.content
				.filter((c): c is { type: "text"; text: string } => c.type === "text")
				.map((c) => c.text)
				.join("\n");

			// Extract JSON from response
			let jsonStr = text;
			const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
			if (jsonMatch) {
				jsonStr = jsonMatch[1];
			}

			try {
				return JSON.parse(jsonStr.trim()) as ImplementationPlan;
			} catch {
				const objMatch = text.match(/\{[\s\S]*\}/);
				if (objMatch) {
					try {
						return JSON.parse(objMatch[0]) as ImplementationPlan;
					} catch {
						return null;
					}
				}
				return null;
			}
		};

		doGenerate()
			.then(done)
			.catch(() => done(null));

		return loader;
	});

	return result;
}

async function openUrl(pi: ExtensionAPI, url: string): Promise<void> {
	const platform = process.platform;
	let result;
	if (platform === "darwin") {
		result = await pi.exec("open", [url]);
	} else if (platform === "win32") {
		result = await pi.exec("cmd", ["/c", "start", "", url]);
	} else {
		result = await pi.exec("xdg-open", [url]);
	}
	if (result.code !== 0) {
		throw new Error(result.stderr || `Failed to open browser (exit code ${result.code})`);
	}
}

// ===== Extension =====

export default function planCreator(pi: ExtensionAPI): void {
	// Register the create_plan tool
	pi.registerTool({
		name: "create_plan",
		label: "Create Plan",
		description: `Create an implementation plan and show it for user review via a web form.
Use this when the user asks you to create a plan, implementation strategy, or wants to break down a task into phases.
The plan will be shown in a web-based form where the user can:
- Approve or reject the plan
- Select which phases to include
- Set priority and approach
- Add additional requirements and notes`,
		parameters: Type.Object({
			task: Type.String({ description: "The task or feature to create a plan for" }),
			context: Type.Optional(
				Type.String({ description: "Additional context, requirements, or constraints" }),
			),
			contextFiles: Type.Optional(
				Type.Array(Type.String(), { description: "File paths to include as context" }),
			),
		}),

		async execute(_toolCallId, params, onUpdate, ctx, signal) {
			if (!ctx.hasUI) {
				return {
					content: [{ type: "text", text: "Error: UI not available (running in non-interactive mode)" }],
					details: { error: "no-ui" } as PlanDetails,
				};
			}

			onUpdate?.({ content: [{ type: "text", text: "Generating implementation plan..." }] });

			const taskDescription = params.context ? `${params.task}\n\nContext: ${params.context}` : params.task;
			const plan = await generatePlan(ctx, taskDescription, params.contextFiles || []);

			if (!plan) {
				return {
					content: [{ type: "text", text: "Failed to generate plan. Please try again with more details." }],
					details: { error: "generation-failed" } as PlanDetails,
				};
			}

			if (signal?.aborted) {
				return {
					content: [{ type: "text", text: "Plan generation was aborted." }],
					details: { plan, status: "pending" } as PlanDetails,
				};
			}

			onUpdate?.({ content: [{ type: "text", text: "Plan generated. Opening review page..." }] });

			// Start the plan review server and open browser
			return new Promise((resolve) => {
				let server: { close: () => void } | null = null;
				let resolved = false;

				const cleanup = () => {
					if (server) {
						server.close();
						server = null;
					}
				};

				const finish = (review: PlanReviewResult | null) => {
					if (resolved) return;
					resolved = true;
					cleanup();

					if (!review || review.decision === "reject") {
						const reason = review?.notes || "No reason provided";
						resolve({
							content: [{ type: "text", text: `Plan rejected.\n\nReason: ${reason}` }],
							details: { plan, status: "rejected", review } as PlanDetails,
						});
						return;
					}

					// Save approved plan
					ensurePlansDir();
					const planId = generatePlanId();
					const filename = `${planId}-${plan.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.md`;
					const filepath = join(PLANS_DIR, filename);
					const markdown = planToMarkdown(plan, review);
					writeFileSync(filepath, markdown);

					const selectedPhases = review.selectedPhases || plan.phases.map((p) => p.number);
					const phaseSummary = plan.phases
						.filter((p) => selectedPhases.includes(p.number))
						.map((p) => `${p.number}. ${p.name}`)
						.join("\n");

					let summary = `**Plan Approved: ${plan.title}**\n\n`;
					summary += `**Decision:** ${review.decision === "approve" ? "Approved" : "Approved with modifications"}\n`;
					summary += `**Priority:** ${review.priority}\n`;
					summary += `**Approach:** ${review.approach}\n\n`;
					summary += `**Selected Phases:**\n${phaseSummary}\n\n`;

					if (review.requirements && review.requirements.length > 0) {
						summary += `**Additional Requirements:**\n${review.requirements.map((r) => `- ${r}`).join("\n")}\n\n`;
					}

					if (review.constraints && review.constraints.length > 0) {
						summary += `**Constraints:**\n${review.constraints.map((c) => `- ${c}`).join("\n")}\n\n`;
					}

					if (review.notes) {
						summary += `**User Notes:**\n${review.notes}\n\n`;
					}

					summary += `Plan saved to: ${filepath}\n\n`;
					summary += `Begin executing Phase ${selectedPhases[0] || 1}: ${plan.phases.find((p) => p.number === (selectedPhases[0] || 1))?.name || "First phase"}`;

					resolve({
						content: [{ type: "text", text: summary }],
						details: { plan, status: "approved", review, savedPath: filepath } as PlanDetails,
					});
				};

				signal?.addEventListener("abort", () => finish(null), { once: true });

				startPlanServer({
					plan,
					cwd: ctx.cwd,
					timeout: 600,
					onSubmit: finish,
					onCancel: () => finish(null),
				})
					.then(async (handle) => {
						server = handle;
						try {
							await openUrl(pi, handle.url);
						} catch (err) {
							cleanup();
							const message = err instanceof Error ? err.message : String(err);
							resolve({
								content: [{ type: "text", text: `Failed to open browser: ${message}` }],
								details: { plan, status: "pending" } as PlanDetails,
							});
						}
					})
					.catch((err) => {
						cleanup();
						resolve({
							content: [{ type: "text", text: `Server error: ${err.message}` }],
							details: { plan, status: "pending" } as PlanDetails,
						});
					});
			});
		},

		renderCall(args, theme) {
			const task = (args.task as string) || "Implementation plan";
			const label = task.length > 50 ? task.slice(0, 47) + "..." : task;
			return new Text(theme.fg("toolTitle", theme.bold("create_plan ")) + theme.fg("muted", label), 0, 0);
		},

		renderResult(result, _options, theme) {
			const details = result.details as PlanDetails | undefined;
			if (!details?.plan) {
				const text = result.content[0];
				return new Text(text?.type === "text" ? text.text : "", 0, 0);
			}

			const statusColor = details.status === "approved" ? "success" : details.status === "rejected" ? "warning" : "muted";
			const statusText = details.status === "approved" ? "✓ Approved" : details.status === "rejected" ? "✗ Rejected" : "⏳ Pending";

			let output = `${theme.fg(statusColor, statusText)} ${theme.fg("accent", details.plan.title)}`;
			
			if (details.review) {
				output += `\n${theme.fg("dim", `Priority: ${details.review.priority} | Approach: ${details.review.approach}`)}`;
			}

			if (details.savedPath) {
				output += `\n${theme.fg("dim", `Saved: ${details.savedPath}`)}`;
			}

			return new Text(output, 0, 0);
		},
	});

	// Register /create-plan command
	pi.registerCommand("create-plan", {
		description: "Create an implementation plan for a task",
		handler: async (args, ctx) => {
			if (!ctx.hasUI) {
				ctx.ui.notify("create-plan requires interactive mode", "error");
				return;
			}

			let taskDescription = args?.trim();

			if (!taskDescription) {
				taskDescription = await ctx.ui.input("What would you like to plan?", "Describe the task or feature...");
				if (!taskDescription?.trim()) {
					ctx.ui.notify("Cancelled - no task provided", "info");
					return;
				}
			}

			// Trigger the tool via a user message
			pi.sendUserMessage(`Create an implementation plan for: ${taskDescription}`);
		},
	});

	// Register /list-plans command
	pi.registerCommand("list-plans", {
		description: "List saved implementation plans",
		handler: async (_args, ctx) => {
			ensurePlansDir();

			const { readdirSync } = await import("node:fs");
			const files = readdirSync(PLANS_DIR).filter((f) => f.endsWith(".md"));

			if (files.length === 0) {
				ctx.ui.notify("No saved plans found", "info");
				return;
			}

			const choice = await ctx.ui.select("Saved Plans", files);

			if (choice) {
				const filepath = join(PLANS_DIR, choice);
				ctx.ui.notify(`Plan file: ${filepath}`, "info");
				pi.sendUserMessage(`Read and summarize the plan at: ${filepath}`);
			}
		},
	});
}
