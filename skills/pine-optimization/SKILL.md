---
name: pine-optimization
description: Use this skill when the user wants to optimize Pine Script code for performance or reduce complexity.
---

# Pine Script Optimization Skill

This skill provides specialized knowledge and tools for making Pine Script code run faster and cleaner.

## When to use this skill
- User asks "optimize this script".
- User complains about "script taking too long to load".
- You encounter "Loop takes too long" runtime errors.

## Optimization Checklist (Mental Model)
1.  **Reduce Loop Scope:** Move calculations that don't depend on the current bar index OUT of the main scope or loops.
2.  **Use Built-ins:** `ta.sma()` is C++ optimized. Your manual for-loop SMA is not. Always use built-ins.
3.  **Limit Drawing Objects:** `line.new` and `label.new` are expensive. Use `max_lines_count` in `indicator()` or `strategy()` to limit the buffer.
4.  **Var Keyword:** Use `var` to initialize variables only once, saving re-initialization cost on every bar.

## Common Code Patterns

### Inefficient
```pinescript
// Calculated on every bar
float my_val = 0.0
for i = 0 to 10
    my_val := my_val + close[i]
```

### Optimized
```pinescript
// Calculated once
var float my_sum = 0.0
// Logic...
```

## Tools
*No external scripts currently attached to this skill.*
