# Plan Creator Extension

Creates implementation plans and displays them in a beautiful web-based review UI, inspired by the Claude Code planning workflow.

## Features

- **Plan Generation**: Uses the LLM to generate structured implementation plans
- **Web-based Review UI**: Opens a browser with:
  - **Full plan display** with nice formatting (overview, phases, tasks, success criteria)
  - **Decision controls** - Approve, Modify, or Reject
  - **Phase selection** - Choose which phases to include
  - **Priority & Approach** - Set execution preferences
  - **Requirements checkboxes** - Documentation, TDD, CI/CD, monitoring, etc.
  - **Constraints checkboxes** - Time, compatibility, API stability, etc.
  - **Notes textarea** - Add custom instructions or modifications
  - **Countdown timer** - Auto-timeout with activity reset
  - **Keyboard shortcuts** - ⌘+Enter to submit, Esc to cancel

## Installation

The extension is auto-discovered from `~/.pi/agent/extensions/plan-creator/`.

## Usage

### Via Tool (LLM can invoke directly)

```
create_plan({
  task: "Add user authentication with OAuth",
  context: "Use Google and GitHub as providers",
  contextFiles: ["src/auth/index.ts"]
})
```

### Via Command

```bash
/create-plan Add rate limiting to API endpoints
```

### Workflow

1. **Generate**: Use `/create-plan` or ask the agent to create a plan
2. **Review**: Browser opens with the full plan displayed
3. **Configure**: 
   - Select decision (Approve/Modify/Reject)
   - Choose phases to include
   - Set priority and approach
   - Check additional requirements
   - Add notes
4. **Submit**: Click Submit or press ⌘+Enter
5. **Execute**: Agent begins executing approved phases

## Commands

| Command | Description |
|---------|-------------|
| `/create-plan [task]` | Generate a new implementation plan |
| `/list-plans` | Browse saved plans |

## Plan Structure

Generated plans include:

```json
{
  "title": "Feature Name",
  "overview": "Brief summary",
  "currentState": "What exists now",
  "desiredEndState": "The goal",
  "outOfScope": ["Things NOT included"],
  "phases": [
    {
      "number": 1,
      "name": "Phase Name",
      "description": "What this phase does",
      "tasks": ["Task 1", "Task 2"],
      "successCriteria": {
        "automated": ["npm test", "npm run lint"],
        "manual": ["Verify in UI"]
      }
    }
  ],
  "testingStrategy": {
    "unit": ["Test X"],
    "integration": ["Test Y"],
    "manual": ["Verify Z"]
  }
}
```

## Review UI Features

### Decision Options
- ✅ **Approve** - Proceed with the plan as-is
- 🔄 **Modify** - Approve with modifications (use notes)
- ❌ **Reject** - Start over with a new plan

### Phase Selection
Multi-select checkboxes to include/exclude specific phases.

### Priority Levels
- 🔴 Critical - Needs immediate attention
- 🟠 High - Should be done soon
- 🟡 Medium - Normal priority (default)
- 🟢 Low - When time permits

### Approach Styles
- 🚀 Fast - Minimal review, focus on delivery
- ⚖️ Balanced - Reasonable review at each phase (default)
- 🔬 Thorough - Detailed review at every step

### Additional Requirements
- 📝 Generate detailed documentation
- 🧪 TDD - Write tests first
- 🔄 Set up CI/CD pipeline
- 📊 Add monitoring/logging
- 🔒 Security review required
- 📈 Performance benchmarks needed

### Constraints
- ⏰ Time constraint - deadline approaching
- 💾 Must maintain backward compatibility
- 🚫 Cannot modify existing APIs
- 📦 Limited to existing dependencies
- 🔧 Must use specific technologies

## Files

```
~/.pi/agent/extensions/plan-creator/
├── index.ts      # Main extension (tool + commands)
├── server.ts     # HTTP server for web UI
├── README.md     # This file
└── form/
    ├── index.html  # Review page template
    ├── styles.css  # Styling (dark/light theme)
    └── script.js   # Client-side interactivity
```

## Saved Plans

Approved plans are saved to `~/.pi/plans/` as Markdown files with:
- Full plan content
- Review decisions (priority, approach)
- Selected phases
- User notes
- Timestamps
