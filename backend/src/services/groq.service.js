const Groq = require('groq-sdk');
const logger = require('../utils/logger');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

console.log("Checking GROQ_API_KEY:", process.env.GROQ_API_KEY ? "Present" : "Missing");

// Tools Definitions
const tools = [
    {
        type: "function",
        function: {
            name: "getLeaveBalance",
            description: "Get the leave balance for the current employee or a specific employee.",
            parameters: {
                type: "object",
                properties: {
                    employeeId: {
                        type: "string",
                        description: "The ID or email of the employee. Use 'current_user' for the logged-in user."
                    }
                },
                required: ["employeeId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "applyLeave",
            description: "Apply for a leave request.",
            parameters: {
                type: "object",
                properties: {
                    leaveType: {
                        type: "string",
                        description: "Type of leave (Select exactly from: Casual Leave, Sick Leave, Annual Leave, Maternity Leave, Paternity Leave, Unpaid Leave)",
                        enum: ["Casual Leave", "Sick Leave", "Annual Leave", "Maternity Leave", "Paternity Leave", "Unpaid Leave"]
                    },
                    startDate: {
                        type: "string",
                        description: "Start date in YYYY-MM-DD format"
                    },
                    endDate: {
                        type: "string",
                        description: "End date in YYYY-MM-DD format"
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
            description: "Get the history of leave requests.",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Filter by status (Pending, Approved, Rejected)",
                        enum: ["Pending", "Approved", "Rejected"]
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getTodayAttendance",
            description: "Get today's attendance status and punch times.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "getMonthlyAttendance",
            description: "Get attendance records for a specific date range.",
            parameters: {
                type: "object",
                properties: {
                    startDate: { type: "string" },
                    endDate: { type: "string" }
                },
                required: ["startDate", "endDate"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "downloadPayslip",
            description: "Get the download link for a payslip.",
            parameters: {
                type: "object",
                properties: {
                    month: { type: "number" },
                    year: { type: "number" }
                },
                required: ["month", "year"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getSalaryBreakdown",
            description: "Get the breakdown of the latest salary.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "getMyProfile",
            description: "Get details of the currently logged-in employee.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "getMyProjects",
            description: "Get the list of projects assigned to the employee.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "getMyTasks",
            description: "Get the list of tasks assigned to the employee.",
            parameters: {
                type: "object",
                properties: {
                    status: {
                        type: "string",
                        description: "Filter by status (Pending, In Progress, Completed)",
                        enum: ["Pending", "In Progress", "Completed"]
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getMyShift",
            description: "Get the current shift details of the employee.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "getApplicationStatus",
            description: "Check the status of job applications for the user.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "getAnnouncements",
            description: "Get the latest company announcements.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "getHRPolicy",
            description: "Get information about specific HR policies.",
            parameters: {
                type: "object",
                properties: {
                    policyName: { type: "string", description: "Name of the policy (leave, notice period, work from home, reimbursement)" }
                },
                required: ["policyName"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getHolidayList",
            description: "Get the list of upcoming holidays.",
            parameters: { type: "object", properties: {} }
        }
    }
];

const chatWithAI = async (messages, user, toolChoice = "auto") => {
    try {
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful and professional HR Assistant for the HRM system. 
                    Your goal is to assist employees and admins with HR-related queries.
                    
                    Current User Context:
                    - Name: ${user.firstName} ${user.lastName}
                    - Role: ${user.role}
                    - Email: ${user.email}
                    
                    Today's Date: ${new Date().toISOString().split('T')[0]} (YYYY-MM-DD)
                    
                    Guidelines:
                    1. Be polite, concise, and professional.
                    2. Use the available tools to fetch real-time data when asked.
                    3. If you can't find information, kindly ask for clarification.
                    4. Do not make up facts; rely on the provided tools.
                    5. If a tool returns a JSON result, interpret it and summarize it for the user in a friendly way.
                    `
                },
                ...messages
            ],
            model: "llama-3.3-70b-versatile",
            tools: tools,
            tool_choice: toolChoice,
            temperature: 0.5,
            max_tokens: 1024,
        });

        const responseMessage = completion.choices[0].message;

        // Check if the model wants to call a function
        if (responseMessage.tool_calls) {
            return {
                type: 'function_call',
                tool_calls: responseMessage.tool_calls,
                message: responseMessage
            };
        }

        return {
            type: 'text',
            content: responseMessage.content
        };

    } catch (error) {
        logger.error('Groq Service Error:', error);
        throw new Error('Failed to communicate with AI service: ' + error.message);
    }
};

module.exports = {
    chatWithAI
};
