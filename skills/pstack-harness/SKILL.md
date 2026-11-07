---
name: pstack-harness
description: Use once per session before following pstack skill instructions in Pi. Maps the Cursor tool names, subagent fields, model slugs, rules, and paths that pstack skills assume onto their Pi equivalents.
---

# pstack in Pi

pstack skills use Cursor names. Read this file once per session, then map each Cursor name in a skill with the tables below. `<pstack>` means the folder that holds the pstack `skills/` directory; Pi names a skill's folder when it loads the skill. If a Cursor field has no row, drop it and say so. Never pass a field or value the tool schema rejects.

## Tools

| Cursor | Pi |
| --- | --- |
| `Task` | Pi has no built-in subagents. Prefer doing the work inline. When a skill truly needs an isolated or parallel worker, run `pi -p "<full brief>" [model flags]` with the `bash` tool. The worker is a fresh headless Pi with no conversation context, so put everything it needs in the brief and read its stdout. If the session's tool list shows a subagent tool from an installed package, use that instead. |
| `AskQuestion` | Ask in plain text in your reply and stop. |
| Open a todolist | Keep the list in your replies and update it at each phase. |
| Run another pstack skill (`/name` or "the **name** skill") | `read` `<pstack>/skills/<name>/SKILL.md` and follow it. Most pstack skills set `disable-model-invocation: true`, so they never load on their own and a missing catalog entry does not mean pstack is absent. When you tell the user to type one, write `/skill:<name>`. |
| `Grep`, `Glob` | The built-in `grep` and `find` tools. |

## Subagent fields

`Task` fields have no Pi schema. Fold each one into the brief or the `pi -p` flags:

| Cursor | Pi |
| --- | --- |
| `subagent_type: generalPurpose` | Put the goal and constraints in the brief. A `pi -p` worker runs with the default tools (`read`, `bash`, `edit`, `write`, `grep`, `find`, `ls`). |
| `poteto-agent`, `comment-sicko` | Paste the body of `<pstack>/agents/<name>.md` at the top of the brief. Pi never registers agent files on its own. |
| `readonly: true` | Say "do not edit files; report findings only" in the brief. With `pi -p`, add `--deny-tool edit --deny-tool write`. |
| `readonly: false` | Default. |
| `environment: "cloud"` | `git worktree add` a fresh branch first, then name the worktree path and the branch the worker checks out. |
| `environment: "local"` | Omit. |
| `cloud_base_branch: <b>` | Tell the worker to check out `<b>` first. |
| `run_in_background: true` | Start `pi -p ... > <file> 2>&1 &` with `bash`, keep working, and read `<file>` when you need the result. |
| `resume` | Start a new `pi -p` and paste the earlier result into its brief. |
| `file_attachments` | List the paths in the brief. |
| `is_background: true` (agent frontmatter) | Omit. |

## Models

| Cursor | Pi |
| --- | --- |
| `claude-<family>-<version>-<effort>[-fast]`, such as `claude-opus-5-5-xhigh` | `--model <family>` (the fuzzy match, such as `opus`) and `--thinking <effort>`, or one `--model opus:xhigh`. Drop `-fast`. |
| A `grok-*` or `gpt-*` slug | `--model grok` or `--model gpt` when a provider serves it; `pi --list-models grok` shows what matches. Otherwise omit the model, run on the session model, and say so. |
| Any other unknown slug | Run `pi --list-models <guess>` once. No match means omit the model and say so. |
| `auto` or `inherit-parent` | Omit `--model` and `--thinking`. |
| `The pstack-models.mdc` rule, `~/.cursor/rules/pstack-models.mdc` | Pi has no rules files and this port ships no `setup-pstack`. To pin per-role models, keep one line per role (`<role>: <model> <thinking>`) in `~/.pi/agent/AGENTS.md`, which Pi loads into every session. Read it when its lines are not already in context. With no file or no line for the role, use the skill's default slug mapped through the rows above. |
| A role value `<model> <effort>`, such as `opus high` | `--model "opus:high"` on `pi -p`, or the same model and thinking level chosen in the session. |

Thinking levels are `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`, clamped to what the model supports.

## Paths

| Cursor | Pi |
| --- | --- |
| `.cursor/skills/`, `~/.cursor/skills/` | `.agents/skills/` and `~/.agents/skills/`, plus Pi's own skill locations. |
| `~/.cursor/plugins/`, `.cursor-plugin/plugin.json` | Wherever pstack-pi is installed. To find pstack files, take the absolute path Pi printed when it loaded a pstack skill, or search `~/.pi/agent/` (npm and git package caches) and `~/.agents/skills/` for a path ending in `skills/poteto-mode/SKILL.md`. Newest copy wins. |
| `.cursor/rules/*.mdc`, always-applied rules | `AGENTS.md` in the working directory or its parents. `~/.pi/agent/AGENTS.md` applies everywhere. Pi never reads `.mdc` files. |
| `https://github.com/cursor/plugins/blob/main/pstack/<path>` | `<pstack>/<path>` when that file exists. The package ships the skills, `docs/guide/`, and `agents/`. Read the local copy and never fetch it. Give the user the URL when they need a link. |
| Transcripts in `~/.cursor/projects/<slug>/agent-transcripts/` | `~/.pi/agent/sessions/--<slug>--/<timestamp>_<session-id>.jsonl`. The slug is the workspace path without its leading separator and with each `/`, `\`, and `:` changed to `-`, so `/Users/you/proj` is `--Users-you-proj--`. The newest `.jsonl` directly in that folder is the current session. Read only this workspace's folder. |

## Cursor-only features

Pi has no Cursor Automations, Bugbot, Cursor cloud agents, or built-in PR tool. When a step needs one, put one line in your reply, `Skipped in Pi: <step>. <reason>.`, then go on to the next step. Do not stop, ask, or retry. When a later step needs what the skipped step made, such as a URL or a key, leave a placeholder and name it in the line.

| Cursor | Pi |
| --- | --- |
| Cursor Automations: routines, `update_state` routine calls, `api2.cursor.sh/automations` webhooks, routine wakes, and `SendToUser` secret requests | Skip with the line. |
| Bugbot | Bugbot comments on a GitHub PR are ordinary review threads, so triage them with the forge command that the step gives. Skip a step that starts, waits for, or configures Bugbot when the PR has no Bugbot check or comment. |
| Cursor cloud agents | `environment: "cloud"` maps to a worktree, as in Subagent fields. Skip a step that needs the cloud agent itself, such as its dashboard status or its own machine. |
| A built-in PR tool | Use the forge command that the step gives, such as `gh pr create`. That is not a skip, so write no line. |
