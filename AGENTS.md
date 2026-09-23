# AGENTS.md - Time Cycles Trading Indicator

## Project Overview
This is a Pine Script v6 TradingView indicator for visualizing time-based cycles (90min, 30min, 10min) across trading sessions (Asia, London, NY AM/PM). Main file: `Time-Cycles-V4.pine`.

## Build / Validation Commands

### Pine Script
- **Validation**: TradingView compiles Pine Script on save automatically
- **Manual Check**: Use `tradingview_pine_check` tool or paste into TradingView Pine Editor
- **Static Analysis**: Use `tradingview_pine_analyze` tool (offline, no chart needed)

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
- Track all lines/fills in arrays: `all_lines`, `all_fills`, `line_bars`, `fill_bars`
- Delete old objects when `prev_asia_bar` moves forward
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
Pine Script is interpreted by TradingView. There are no traditional test commands. Code is validated by:
1. TradingView compiler on save
2. `tradingview_pine_check` tool
3. `tradingview_pine_analyze` tool (offline static analysis)