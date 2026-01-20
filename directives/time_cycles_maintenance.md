# Time Cycles Maintenance Directive

**Target File:** `Time-Cycles-V4.pine`

**Goal:** Ensure the Time Cycles indicator remains performant and bug-free during updates. Use version 6.

**Critical Checks (The "Recipe"):**
1.  **Drawing Limits:**
    - This script checks `max_lines_count` and `max_labels_count` in line 2.
    - *Rule:* If we add more visual features, we MUST increase these limits (up to 500 max).
    - *Check:* Are old lines being deleted? Look for `line.delete()` calls before `line.new()`.

2.  **Repainting Safety:**
    - The script uses `request.security` (Lines 506, 533, etc.).
    - *Rule:* Ensure `lookahead=barmerge.lookahead_on` is ONLY used for historical data (Previous Day High/Low), NOT for real-time signals.
    - *Check:* Verify no `request.security` calls are leaking future data into current bar calculations.

3.  **Visual Consistency:**
    - The script uses "Groups" for inputs (Line 12).
    - *Rule:* Any new input MUST belong to a defined group (`grp_cyc`, `grp_ol`, etc.). Do not leave inputs ungrouped.

4.  **Optimization (Skill: pine-optimization):**
    - Refer to `skills/pine-optimization` for array usage.
    - *Check:* Are we creating new arrays inside the loop? (Bad). Ensure `array.new_*` is only called once or strictly controlled.

5. **My own rules**
    - Read code and write fever lines of code the better.
    - Maintain all functionalities of the script.
    - Suggest improvements if any.
    - Strictly follow documentation on this local path /Users/zdenkovasic/Documents/CODING/Pine-RAG

**Process for Updates:**
1.  Read the user request.
2.  Check this list.
3.  Implement change.
4.  Verify against "Critical Checks" above.

