# AGENTS.md - Time Cycles Trading Indicator

## Project Overview

This is a Pine Script v6 TradingView indicator for visualizing time-based cycles (90min, 30min, 10min) across trading sessions (Asia, London, NY AM/PM). Main file: `Time-Cycles-V4.pine`.
Active working file: `TC-SMT-v0.1.pine` (Time Cycles V4.0 + SMT V-4.1 merged into one script).
Documentation is located in parent directory: Pine-V6-documentation

## Division of labour — HARD RULE

**You edit the `.pine` file. The user drives TradingView.**

- NEVER launch TradingView Desktop or touch its GUI/editor/chart: no `tv_launch`, `pine_set_source`,
  `pine_compile` / `pine_smart_compile`, `capture_screenshot`, chart/data/UI/replay/alert tools.
  The user compiles, loads and looks at the chart himself; he reports back what he sees.
- Do not ask for a chart screenshot and do not wait on one. Code the change, state what it does,
  hand it over.
- Correctness comes from reading the code and the docs. The deliverable is the `.pine` edit —
  never block on, or claim, chart verification.

## Build / Validation Commands

### Pine Script

- **The user validates**: TradingView compiles on save; the user owns that step.
- **Optional pre-flight** (non-interactive, no app, no chart, takes source as an argument):
  - `tradingview_pine_check` — server-side compile, returns errors/warnings.
  - `tradingview_pine_analyze` — offline static analysis.
    Use them only when a syntax/compile signal is genuinely useful (e.g. a new UDT field or input
    group). Never treat them as required, and never let them delay the edit.
- **Reasoning checks** (preferred when they can answer the question): simulate the Pine math in a
  scratch script — minute-of-day indices, wrap-around windows, array bounds, line budgets.

### Python Scripts (project utility)

```bash
# Validate skill structure
python scripts/quick_validate.py <skill_directory>

# Skill packaging
python scripts/package_skill.py <skill_dir> <output_dir>
```

## Code Style Guidelines

### File Organization

- Use `.pine` extension (configured in `.vscode/settings.json`)
- Main indicator: `Time-Cycles-V4.pine` (version in indicator name)
- Edit existing files; do not create new files unless explicitly requested

### Pine Script v6 Conventions

**Version declaration** (required first line):

```pine
//@version=6
indicator("Name", overlay=true, max_lines_count=500, max_labels_count=500, max_boxes_count=500)
```

**Type definitions** (use custom types for structured data):

```pine
type Cycle
    line t
    line b
    linefill f
    int idx
    float h
    float l
    bool active
```

**Variables**:

- Use `var` for persistent state (lines, labels, arrays)
- Use `na` for uninitialized values
- Prefix color variables with `c_` (e.g., `c_90_a`, `c_asia`)
- Prefix line/style variables with `w_` (width), `s_` (style)

**Naming**:

- Group inputs: `grp_cyc`, `grp_ol`, `grp_col`, etc.
- Boolean toggles: `show_90`, `show_30`, `show_mid`
- Session prefixes: `asia_`, `london_`, `ny_am_`
- Cycle types: `c_` for cycles (e.g., `c_asia_90`)

**Line drawing**:

- Use `line.new()`, `line.set_x2()`, `line.set_y1()` for extension
- Use `extend=extend.both` for horizontal lines across chart
- Box borders: transparent `color.new(color.white, 100)`

**Input groups** (match existing pattern):

```pine
grp_cyc = "Cycles"
show_90 = input.bool(true, "90min", group=grp_cyc, inline="c1")
```

**Colors**: Use hex (`#787b86`) or `color.red`, `color.blue`, etc. Transparency via `color.new(col, transparency)`.

### Time Handling

- Always use "America/New_York" timezone for non-crypto
- Use "UTC" for crypto symbols
- Calculate `ny_m_total = ny_h * 60 + ny_m` for minute-of-day checks
- Session windows: Asia (1080-1440), London (150-420), NY AM (420-690)

### Drawing Cleanup

- Track every drawing in arrays (`all_boxes`, `all_vl`), oldest first
- Trim by COUNT, not by date: drop from the front once the array exceeds the cap
  (`Max Cycle Boxes`, `Max Lines`). The old "delete everything before `prev_asia_bar`"
  age-purge is gone — TradingView allows only 500 drawings per type, so the count is
  the real horizon and the user tunes history with the cap
- Use O(1) shift operations, avoid O(n²) reverse loops

### Error Handling

- If user provides an error, use MCP tool to fix syntax immediately
- Always scan for similar errors in the same file
- Check array bounds: use `array.size()` before `.get()`
- Guard `na` checks before accessing line/label properties

## Project Structure

```
├── Time-Cycles-V4.pine         # Main indicator (primary)
├── timeCyclesV4/               # Copy/working version
├── scripts/                    # Python utilities
│   ├── quick_validate.py       # Skill validation
│   ├── package_skill.py
│   └── init_skill.py
├── skills/                     # Skill definitions
│   ├── code-logic/SKILL.md
│   └── learn/SKILL.md
├── project-docs/               # Documentation
├── references/                 # Workflow docs
├── .vscode/settings.json       # File associations
└── SKILL.md                    # Default skill (coding guidelines)
```

## Key SKILL.md Guidelines

- **Simplicity first**: Minimum code that solves the problem
- **Surgical changes**: Touch only what you must; match existing style
- **Goal-driven**: Define success criteria before implementing
- **Think before coding**: Surface tradeoffs, don't hide confusion

## Session Quarter System (for reference)

- ASIA: 18:00-00:00 (4 × 90min quarters)
- LONDON: 00:00-06:00 (4 × 90min quarters)
- NY AM: 06:00-12:00 (4 × 90min quarters)
- NY PM: 12:00-18:00 (4 × 90min quarters)

Each 90min can be subdivided into 3 × 30min or 9 × 10min cycles.

## Input Settings Pattern

```pine
grp = "Group Name"
show = input.bool(true, "Label", group=grp, inline="x1")
color = input.color(color.red, "", group=grp, inline="x1")
width = input.int(1, "", 1, 3, group=grp, inline="x1")
style = input.string("Solid", "", ["Solid", "Dashed", "Dotted"], group=grp, inline="x1")
```

## Known Symbol Types

- Crypto: `syminfo.type == "crypto"` → UTC timezone
- Forex: `syminfo.type == "forex"` → 17:00 open
- Futures (NQ, ES, YM, RTY): 18:00 open

## No Build/Test Infrastructure

Pine Script is interpreted by TradingView. There are no traditional test commands and no local
runner. The user compiles and inspects on the chart; agent-side signals are limited to:

1. `tradingview_pine_check` (server compile) — optional pre-flight
2. `tradingview_pine_analyze` (offline static analysis) — optional pre-flight
3. A scratch simulation of the time/index math when the question is arithmetic, not syntax
   Never drive TradingView Desktop itself (see "Division of labour" above).

