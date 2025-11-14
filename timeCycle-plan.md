## Overview

Implement a Pine Script v6 indicator that displays time-based cycle boxes for trading sessions with nested 90-minute and 30-minute cycles.

## Core Requirements

- **Asia Session**: 20:00-00:00 (single session, no sub-cycles)
- **London Session**: 02:30-07:00 (90-minute cycles + 30-minute sub-cycles)
- **NY AM Session**: 07:00-11:30 (90-minute cycles + 30-minute sub-cycles)
- **NY PM Session**: 11:30-16:00 (90-minute cycles + 30-minute sub-cycles)
- **London Opening Range**: 01:30-02:00 (Orange color)

## Implementation Structure

### 1. Indicator Header & Settings

- Set `@version=6`
- Define indicator name and display settings
- Create input groups for:
- General settings (timezone, timeframe limits, max days)
- Session toggles and colors
- Cycle display options (boxes, text, transparency)
- Color scheme for cycles

### 2. Session Configuration

- **Asia**: Single 4-hour session (20:00-00:00)
- **London**: 4.5-hour session (02:30-07:00) = 3 × 90-min cycles, each with 3 × 30-min cycles
- **NY AM**: 4.5-hour session (07:00-11:30) = 3 × 90-min cycles, each with 3 × 30-min cycles
- **NY PM**: 4.5-hour session (11:30-16:00) = 3 × 90-min cycles, each with 3 × 30-min cycles
- **London OR**: 30-minute window (01:30-02:00) with Orange color

### 3. Data Structures

- Create `CycleGroup` type for managing cycle boxes with object pooling
- Pre-allocate box arrays for each session/cycle type
- Implement day-based rotation for history management

### 4. Time Detection Functions

- Function to generate time check arrays for sessions
- Convert session times to minutes for calculation
- Handle timezone conversions (default: America/New_York)
- Generate time checks for:
- London Opening Range (01:30-02:00)
- Asia session (20:00-00:00)
- London 90-min cycles (02:30-07:00)
- London 30-min cycles (02:30-07:00)
- NY AM 90-min cycles (07:00-11:30)
- NY AM 30-min cycles (07:00-11:30)
- NY PM 90-min cycles (11:30-16:00)
- NY PM 30-min cycles (11:30-16:00)
- Use High/Low price and time for drawing boxes.
- NO BOX extend
- GET High and LOW price for each cycle including time.

### 5. Cycle Management System

- `manage_pooled_cycles()` function to:
- Detect new day transitions
- Rotate day indices for history
- Initialize boxes on cycle start
- Update high/low during cycle
- Hide old boxes when history limit reached
- Apply colors and text labels

### 6. Color System

- Consistent color scheme across sessions:
- 90-minute cycles: 3 colors (A, M, D pattern)
- A (Red Color), M (Blue Color), D (Green Color)
- 30-minute cycles: Gray color
- London Opening Range: Orange
- Asia session: Purple
- NO Borders

### 7. Box Rendering

- Create boxes with proper time boundaries
- Update boxes in real-time during active cycles
- Apply transparency settings
- Show/hide text labels based on settings
- Respect timeframe limits

### 8. Input Parameters

- Session toggles (show/hide each session)
- Cycle toggles (90-min and 30-min separately)
- Color pickers for all cycle types
- Transparency controls
- Timezone selector
- Max days history limit 30 days.
- Timeframe limit for display

## File Structure

- All code goes into `[v1-Time-Cycles.pine](v1-Time-Cycles.pine)`
- Read and follow the documentation inside `pine-docs.md`

## Implementation Steps

1. **Setup**: Indicator header, version, and basic structure
2. **Inputs**: All user-configurable settings organized in groups
3. **Data Types**: CycleGroup type definition and initialization functions
4. **Time Logic**: Time check generation for all sessions
5. **Cycle Management**: Core pooling and management functions
6. **Execution**: Call cycle management for each session type
7. **Testing**: Verify all cycles display correctly with proper timing
8. **Coding**: Write fewer lines of code the better.
