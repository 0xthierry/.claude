# Claude Code Configuration

My personal [Claude Code](https://claude.com/claude-code) configuration with custom slash commands and agents for structured software development workflows.

## Credits & Inspiration

This configuration is heavily inspired by the work of **[HumanLayer](https://github.com/humanlayer/humanlayer)** and specifically the talk:

- **[No Vibes Allowed: Solving Hard Problems in Complex Codebases](https://www.youtube.com/watch?v=rmvDxxNubIg&t=2s)** by Dex Horthy, HumanLayer

The commands and agents here are adapted from HumanLayer's approach with slight modifications for my personal workflow. Full credit goes to them for the underlying methodology and design patterns.

## Overview

This configuration provides a structured workflow for working with complex codebases:

1. **Research** the codebase to understand what exists
2. **Plan** implementations with detailed phases and success criteria
3. **Implement** plans with verification at each phase
4. **Validate** that implementations match the plan
5. **Commit** and **describe PRs** with proper context

## Slash Commands

| Command | Description |
|---------|-------------|
| `/create-plan` | Create detailed implementation plans through interactive research and iteration |
| `/implement-plan` | Execute approved plans from `./plans/` with phase-by-phase verification |
| `/iterate-plan` | Update existing plans based on feedback with thorough research |
| `/validate-plan` | Verify implementation against plan, check success criteria, identify issues |
| `/research-codebase` | Document the codebase as-is for historical context (no suggestions, just facts) |
| `/describe-pr` | Generate comprehensive PR descriptions following repository templates |
| `/commit` | Create git commits with user approval (no Claude attribution) |

## Agents

Specialized agents that can be spawned for parallel research tasks:

| Agent | Purpose |
|-------|---------|
| `codebase-locator` | Find WHERE files and components live in the codebase |
| `codebase-analyzer` | Understand HOW specific code works (with file:line references) |
| `codebase-pattern-finder` | Find similar implementations and existing patterns to model after |
| `thoughts-analyzer` | Extract high-value insights from research documents |
| `web-search-researcher` | Research external documentation and web resources |

All agents are **documentarians, not critics** - they describe what exists without suggesting improvements.

## Folder Structure

```
~/.claude/
├── agents/              # Custom agent definitions
│   ├── codebase-analyzer.md
│   ├── codebase-locator.md
│   ├── codebase-pattern-finder.md
│   ├── thoughts-analyzer.md
│   └── web-search-researcher.md
├── commands/            # Slash command definitions
│   ├── commit.md
│   ├── create-plan.md
│   ├── describe-pr.md
│   ├── implement-plan.md
│   ├── iterate-plan.md
│   ├── research-codebase.md
│   └── validate-plan.md
├── hack/                # Utility scripts
│   ├── port-utils.sh    # Find available ports
│   └── spec_metadata.sh # Gather git/timestamp metadata
├── settings.json        # Claude Code settings
└── .gitignore           # Excludes plans, sessions, credentials, etc.
```

## Typical Workflow

```
1. /research-codebase   → Understand what exists
2. /create-plan         → Design the implementation
3. /iterate-plan        → Refine based on feedback
4. /implement-plan      → Execute phase by phase
5. /validate-plan       → Verify implementation
6. /commit              → Create clean commits
7. /describe-pr         → Generate PR description
```

## Key Design Principles

- **Plans are first-class artifacts** - Written to `./plans/` with clear phases and success criteria
- **Automated vs Manual verification** - Plans distinguish between what can be automated and what needs human testing
- **Incremental implementation** - Each phase is implemented and verified before moving on
- **No Claude attribution in commits** - The `/commit` command creates commits as if the user wrote them
- **Documentation over critique** - Agents document what exists without suggesting improvements

## Installation

Copy this folder to `~/.claude/` or merge with your existing configuration.

## License

MIT - Feel free to adapt for your own workflows.

---

*Again, huge thanks to [HumanLayer](https://github.com/humanlayer/humanlayer) for the foundational ideas that made this configuration possible.*
