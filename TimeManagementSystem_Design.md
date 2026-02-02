# Time Management System Design

## 1. Overview
This system handles attendance, shifts, time tracking, and overtime calculation for an IT company. It supports 4 shift types, including cross-midnight shifts.

## 2. Shift Configuration
The system supports 4 specific shifts. Example configuration:
1. **Morning Shift**: 06:00 AM - 03:00 PM
2. **General Shift**: 09:00 AM - 06:00 PM
3. **Evening Shift**: 02:00 PM - 11:00 PM
4. **Night Shift**: 10:00 PM - 07:00 AM (Next Day)

*Note: All shifts include a break duration (e.g., 1 hour).*

## 3. Attendance Rules & Logic

### A. Check-In & Date Assignment
*   **Rule**: Attendance is counted for the "Logical Date" of the shift, not necessarily the calendar date of the check-in.
*   **Night Shift Special Case**: If a user checks in at 10:00 PM on Monday, the attendance date is **Monday**, even if they check out on Tuesday.
*   **Implementation**: 
    1.  Find the assigned shift for the employee.
    2.  Determine the "Shift Start Time" relative to the current time.
    3.  Assign `Attendance Date = Shift Start Date`.

### B. Duration Calculation
*   **Gross Duration**: `CheckOutTime - CheckInTime`
*   **Break Deduction**: 
    *   Each shift has a defined `BreakDuration` (e.g., 60 mins).
    *   `ActualWorkedHours` = `GrossDuration` - `BreakDuration`.
    *   *Edge Case*: If `GrossDuration` < `BreakDuration`, `ActualWorkedHours` = 0.

### C. Status Determination
*   **Target**: 8 Hours (Actual Worked).
*   **Status Rules**:
    1.  **Absent**: No Check-In.
    2.  **Half Day**: `ActualWorkedHours` < 6 hours.
    3.  **Early Checkout / Partial Present**: 6 hours <= `ActualWorkedHours` < 8 hours.
    4.  **Present**: `ActualWorkedHours` >= 8 hours.

### D. Overtime Calculation
*   **Threshold**: Work beyond shift hours (usually > 8 hours actual work).
*   **Formula**: `Overtime = Max(0, ActualWorkedHours - 8.0)`
*   *Note*: Overtime is logged on the same "Attendance Date".

### E. Grace Time
*   **Grace Period**: 10 minutes.
*   **Late Entry**: If `CheckInTime` > `ShiftStartTime + 10mins`, flag as "Late Entry".

## 4. Workflows

### Check-In Workflow
1.  User clicks "Check In".
2.  System identifies current Shift from Roster.
3.  System creates a `TimeLog` entry:
    *   `date`: Shift Date.
    *   `checkIn`: Current Timestamp.
    *   `shiftSnapshot`: Captures shift timings to preserve history.
4.  System flags `Late Entry` if applicable.

### Check-Out Workflow
1.  User clicks "Check Out".
2.  System finds the open `TimeLog` session.
3.  Updates `checkOut` timestamp.
4.  **Calculations**:
    *   `GrossHours` = Sum of all session durations.
    *   `NetHours` = `GrossHours` - `Shift.breakDuration`.
    *   `Overtime` = `NetHours` > 8 ? `NetHours` - 8 : 0.
5.  **Status Update**:
    *   Set status to Present / Half Day / Early Checkout based on `NetHours`.

## 5. Technical Implementation Plan
1.  **Database**: Start with `TimeLog` schema instructions.
2.  **Backend Logic**: Update `timeLog.controller.js` with new formulas.
3.  **Frontend**: Update Admin/Employee dashboards to display these new calculated fields.
