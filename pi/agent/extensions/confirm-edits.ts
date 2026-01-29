import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Editor, type EditorTheme, Key, matchesKey, truncateToWidth } from "@mariozechner/pi-tui";

interface ConfirmResult {
  confirmed: boolean;
  feedback?: string;
}

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "write" && event.toolName !== "edit") {
      return;
    }

    const path = event.input.path || "unknown";

    const result = await ctx.ui.custom<ConfirmResult>((tui, theme, _kb, done) => {
      let selectedIndex = 0; // 0 = Yes, 1 = No
      let editMode = false;
      let cachedLines: string[] | undefined;

      const editorTheme: EditorTheme = {
        borderColor: (s) => theme.fg("accent", s),
        selectList: {
          selectedPrefix: (t) => theme.fg("accent", t),
          selectedText: (t) => theme.fg("accent", t),
          description: (t) => theme.fg("muted", t),
          scrollInfo: (t) => theme.fg("dim", t),
          noMatch: (t) => theme.fg("warning", t),
        },
      };
      const editor = new Editor(tui, editorTheme);

      function refresh() {
        cachedLines = undefined;
        tui.requestRender();
      }

      function submit() {
        const feedback = editor.getText().trim();
        done({
          confirmed: selectedIndex === 0,
          feedback: feedback || undefined,
        });
      }

      function handleInput(data: string) {
        // In edit mode
        if (editMode) {
          if (matchesKey(data, Key.escape)) {
            editMode = false;
            refresh();
            return;
          }
          if (matchesKey(data, Key.enter)) {
            submit();
            return;
          }
          editor.handleInput(data);
          refresh();
          return;
        }

        // In selection mode
        if (matchesKey(data, Key.left) || matchesKey(data, Key.right)) {
          selectedIndex = selectedIndex === 0 ? 1 : 0;
          refresh();
          return;
        }

        if (matchesKey(data, Key.tab)) {
          editMode = true;
          refresh();
          return;
        }

        if (matchesKey(data, Key.enter) || data === "y" || data === "Y") {
          if (data === "y" || data === "Y") selectedIndex = 0;
          submit();
          return;
        }

        if (data === "n" || data === "N") {
          selectedIndex = 1;
          submit();
          return;
        }

        if (matchesKey(data, Key.escape)) {
          done({ confirmed: false });
          return;
        }
      }

      function render(width: number): string[] {
        if (cachedLines) return cachedLines;

        const lines: string[] = [];
        const add = (s: string) => lines.push(truncateToWidth(s, width));

        add(theme.fg("accent", "─".repeat(width)));
        add(theme.fg("accent", theme.bold(" Confirm Edit")));
        add("");
        add(theme.fg("text", ` Allow ${event.toolName} to ${path}?`));
        add("");

        // Yes/No buttons
        const yesBtn = selectedIndex === 0
          ? theme.bg("selectedBg", theme.fg("text", " Yes "))
          : theme.fg("muted", " Yes ");
        const noBtn = selectedIndex === 1
          ? theme.bg("selectedBg", theme.fg("text", " No "))
          : theme.fg("muted", " No ");

        add(` ${yesBtn}  ${noBtn}`);

        // Show editor if in edit mode
        if (editMode) {
          add("");
          add(theme.fg("muted", " Feedback (optional):"));
          for (const line of editor.render(width - 2)) {
            add(` ${line}`);
          }
        }

        add("");
        if (editMode) {
          add(theme.fg("dim", " Enter to submit • Esc to go back"));
        } else {
          add(theme.fg("dim", " ←→ or y/n to select • Tab to add feedback • Enter to confirm"));
        }
        add(theme.fg("accent", "─".repeat(width)));

        cachedLines = lines;
        return lines;
      }

      return {
        render,
        invalidate: () => { cachedLines = undefined; },
        handleInput,
      };
    });

    if (!result.confirmed) {
      const reason = result.feedback
        ? `Blocked by user: ${result.feedback}`
        : "Blocked by user";
      return { block: true, reason };
    }

    // If confirmed with feedback, inject a steering message
    if (result.feedback) {
      pi.sendMessage({
        customType: "confirm-edits",
        content: `User feedback on ${event.toolName}: ${result.feedback}`,
        display: true,
      }, { deliverAs: "steer" });
    }
  });
}
