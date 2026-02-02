const HR_TOOLS = [
    {
        type: "function",
        function: {
            name: "getLeaveBalance",
            description: "Get the current ANNUAL leave balance for the employee (Total quota vs Used)",
            parameters: {
                type: "object",
                properties: {
                    employeeId: {
                        type: "string",
                        description: "The ID of the employee. Defaults to the current user if not provided. DO NOT ask the user for this unless they want to check someone else's balance."
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "applyLeave",
            // ... (skipping unchanged parts)
            // ...
            description: "Apply for a new leave request",
            parameters: {
                type: "object",
                properties: {
                    leaveType: {
                        type: "string",
                        enum: ["Sick Leave", "Casual Leave", "Annual Leave", "Maternity Leave", "Paternity Leave", "Unpaid Leave"],
                        description: "The type of leave"
                    },
                    startDate: {
                        type: "string",
                        description: "Start date of the leave (YYYY-MM-DD)"
                    },
                    endDate: {
                        type: "string",
                        description: "End date of the leave (YYYY-MM-DD)"
                    },
                    reason: {
                        type: "string",
                        description: "Reason for the leave"
                    }
                },
                required: ["leaveType", "startDate", "endDate", "reason"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getLeaveHistory",
            description: "Get the history of leave requests",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["Pending", "Approved", "Rejected"],
                        description: "Filter by status"
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getTodayAttendance",
            description: "Get today's attendance status",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getMonthlyAttendance",
            description: "Get attendance records for a specific date range",
            parameters: {
                type: "object",
                properties: {
                    startDate: {
                        type: "string",
                        description: "Start date (YYYY-MM-DD)"
                    },
                    endDate: {
                        type: "string",
                        description: "End date (YYYY-MM-DD)"
                    }
                },
                required: ["startDate", "endDate"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "downloadPayslip",
            description: "Get the payslip for a specific month",
            parameters: {
                type: "object",
                properties: {
                    month: {
                        type: "integer",
                        description: "Month number (1-12)"
                    },
                    year: {
                        type: "integer",
                        description: "Year (YYYY)"
                    }
                },
                required: ["month", "year"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getSalaryBreakdown",
            description: "Get the breakdown of the current salary",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getHolidayList",
            description: "Get the list of upcoming holidays",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getAnnouncements",
            description: "Get recent company announcements",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getApplicationStatus",
            description: "Get the status of job applications",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getNextInterview",
            description: "Check for upcoming interviews",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getFeedback",
            description: "Get feedback on applications",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getHRPolicy",
            description: "Get information about a specific HR policy",
            parameters: {
                type: "object",
                properties: {
                    policyName: {
                        type: "string",
                        description: "Name of the policy (e.g., 'leave', 'notice period', 'work from home')"
                    }
                },
                required: ["policyName"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getMyProfile",
            // ... (skipping unchanged parts)
            // ...
            description: "Get the employee's profile details (Name, ID, Department, Position, etc.)",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getMyProjects",
            description: "Get the list of projects assigned to the employee",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getMyTasks",
            description: "Get the list of tasks assigned to the employee",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        enum: ["To Do", "In Progress", "Completed", "Overdue"],
                        description: "Filter tasks by status"
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getMyShift",
            description: "Get the employee's current shift schedule",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    }
];

const SYSTEM_PROMPT = `You are an intelligent HR Assistant for Infolux. Your goal is to help employees with their HR-related queries efficiently and professionally.

You have access to a set of tools to retrieve data or perform actions.
1. ALWAYS use the provided tools when the user asks for specific data (leaves, attendance, payroll, projects, tasks, shifts, etc.).
2. If a tool requires parameters that are missing, ask the user for them politely.
3. If the user asks a general question (e.g., "How are you?"), respond naturally without calling tools.
4. If the user asks about something outside HR, politely decline.
5. When you get data from a tool, summarize it nicely for the user.
6. Be concise but friendly.
7. Current Date: ${new Date().toISOString().split('T')[0]}

IMPORTANT:
- For 'applyLeave', ensure you have the type, start date, end date, and reason.
- For 'downloadPayslip', ensure you have the month and year.
- If the user says "tomorrow", calculate the date based on the current date.
- **Leave Balance Note**: The 'getLeaveBalance' tool returns the ANNUAL quota (e.g., 30 days/year). If a user asks for "this month's leaves", clarify that the balance shown is their remaining allowance for the WHOLE YEAR, not just this month.
- **Strict Rule**: Use the native tool calling capability for all actions. Do not output raw JSON or code blocks. If you need to perform an action, call the tool directly.
- **Do NOT** use XML tags like <function=...> in your response. Just call the tool.
`;

module.exports = {
    HR_TOOLS,
    SYSTEM_PROMPT
};
