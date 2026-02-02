// Sample Task Data for Testing
// Run this script to populate your database with sample tasks

const mongoose = require('mongoose');
const Task = require('./src/models/Task/Task');
const Employee = require('./src/models/Employee/Employee');
const Project = require('./src/models/Project/Project');

const sampleTasks = [
    {
        taskTitle: "Implement User Authentication Module",
        description: "Develop a secure user authentication system with JWT tokens, password hashing, and session management. Include login, logout, and password reset functionality.",
        taskType: "Feature",
        priority: "High",
        status: "In Progress",
        department: "Development",
        startDate: new Date('2025-12-01'),
        dueDate: new Date('2025-12-15'),
        estimatedHours: 40,
        progressPercent: 65,
        isStandaloneTask: false
    },
    {
        taskTitle: "Fix Payment Gateway Integration Bug",
        description: "Resolve the issue where payment confirmations are not being received from the payment gateway. Debug the webhook handler and ensure proper error handling.",
        taskType: "Bug",
        priority: "Urgent",
        status: "To Do",
        department: "Development",
        startDate: new Date('2025-12-05'),
        dueDate: new Date('2025-12-08'),
        estimatedHours: 16,
        progressPercent: 0,
        isStandaloneTask: true
    },
    {
        taskTitle: "Optimize Database Queries",
        description: "Analyze and optimize slow database queries. Add appropriate indexes, implement query caching, and refactor N+1 query problems.",
        taskType: "Improvement",
        priority: "Medium",
        status: "Review",
        department: "Development",
        startDate: new Date('2025-11-25'),
        dueDate: new Date('2025-12-10'),
        estimatedHours: 24,
        progressPercent: 90,
        isStandaloneTask: true
    },
    {
        taskTitle: "Research AI Integration Options",
        description: "Conduct research on various AI/ML integration options for the product recommendation system. Evaluate costs, capabilities, and implementation complexity.",
        taskType: "Research",
        priority: "Low",
        status: "In Progress",
        department: "Research",
        startDate: new Date('2025-12-01'),
        dueDate: new Date('2025-12-20'),
        estimatedHours: 32,
        progressPercent: 45,
        isStandaloneTask: true
    },
    {
        taskTitle: "Weekly Team Standup Meeting",
        description: "Conduct weekly team standup meeting to discuss progress, blockers, and upcoming tasks. Review sprint goals and adjust priorities as needed.",
        taskType: "Meeting",
        priority: "Medium",
        status: "Completed",
        department: "Development",
        startDate: new Date('2025-12-02'),
        dueDate: new Date('2025-12-02'),
        estimatedHours: 1,
        actualHours: 1.5,
        progressPercent: 100,
        completedAt: new Date('2025-12-02'),
        taskResult: "Success",
        isStandaloneTask: true
    },
    {
        taskTitle: "Update Employee Onboarding Documentation",
        description: "Review and update the employee onboarding documentation to reflect recent process changes. Include new tools, access procedures, and training materials.",
        taskType: "Documentation",
        priority: "Low",
        status: "To Do",
        department: "HR",
        startDate: new Date('2025-12-03'),
        dueDate: new Date('2025-12-17'),
        estimatedHours: 12,
        progressPercent: 0,
        isStandaloneTask: true
    },
    {
        taskTitle: "Implement Dark Mode Feature",
        description: "Add dark mode support to the application. Create theme toggle, update all components to support both light and dark themes, and persist user preference.",
        taskType: "Feature",
        priority: "Medium",
        status: "In Progress",
        department: "Development",
        startDate: new Date('2025-11-28'),
        dueDate: new Date('2025-12-12'),
        estimatedHours: 28,
        progressPercent: 55,
        isStandaloneTask: false
    },
    {
        taskTitle: "Security Audit and Penetration Testing",
        description: "Conduct comprehensive security audit of the application. Perform penetration testing, identify vulnerabilities, and create remediation plan.",
        taskType: "Testing",
        priority: "High",
        status: "To Do",
        department: "Security",
        startDate: new Date('2025-12-06'),
        dueDate: new Date('2025-12-20'),
        estimatedHours: 48,
        progressPercent: 0,
        isStandaloneTask: true
    },
    {
        taskTitle: "Setup CI/CD Pipeline",
        description: "Configure automated CI/CD pipeline using GitHub Actions. Include automated testing, code quality checks, and deployment to staging/production environments.",
        taskType: "Admin",
        priority: "High",
        status: "In Progress",
        department: "DevOps",
        startDate: new Date('2025-11-30'),
        dueDate: new Date('2025-12-14'),
        estimatedHours: 36,
        progressPercent: 70,
        isStandaloneTask: true
    },
    {
        taskTitle: "Mobile App Performance Optimization",
        description: "Optimize mobile application performance. Reduce bundle size, implement lazy loading, optimize images, and improve initial load time.",
        taskType: "Improvement",
        priority: "Medium",
        status: "Review",
        department: "Mobile Development",
        startDate: new Date('2025-11-20'),
        dueDate: new Date('2025-12-05'),
        estimatedHours: 40,
        progressPercent: 95,
        isStandaloneTask: false
    },
    {
        taskTitle: "Customer Feedback Analysis",
        description: "Analyze recent customer feedback and support tickets. Identify common pain points, feature requests, and areas for improvement.",
        taskType: "Research",
        priority: "Medium",
        status: "Completed",
        department: "Product",
        startDate: new Date('2025-11-25'),
        dueDate: new Date('2025-12-01'),
        estimatedHours: 16,
        actualHours: 18,
        progressPercent: 100,
        completedAt: new Date('2025-12-01'),
        taskResult: "Success",
        isStandaloneTask: true
    },
    {
        taskTitle: "Fix Responsive Design Issues on Mobile",
        description: "Address reported responsive design issues on mobile devices. Fix layout breaks, ensure proper touch targets, and test on various screen sizes.",
        taskType: "Bug",
        priority: "High",
        status: "In Progress",
        department: "Development",
        startDate: new Date('2025-12-03'),
        dueDate: new Date('2025-12-09'),
        estimatedHours: 20,
        progressPercent: 40,
        isStandaloneTask: true
    },
    {
        taskTitle: "Quarterly Performance Review Preparation",
        description: "Prepare materials for quarterly performance reviews. Compile metrics, gather feedback, and schedule review meetings with team members.",
        taskType: "Admin",
        priority: "Medium",
        status: "To Do",
        department: "HR",
        startDate: new Date('2025-12-10'),
        dueDate: new Date('2025-12-20'),
        estimatedHours: 24,
        progressPercent: 0,
        isStandaloneTask: true
    },
    {
        taskTitle: "Implement Real-time Notifications",
        description: "Build real-time notification system using WebSockets. Include in-app notifications, email notifications, and notification preferences.",
        taskType: "Feature",
        priority: "High",
        status: "To Do",
        department: "Development",
        startDate: new Date('2025-12-08'),
        dueDate: new Date('2025-12-22'),
        estimatedHours: 44,
        progressPercent: 0,
        isStandaloneTask: false
    },
    {
        taskTitle: "API Documentation Update",
        description: "Update API documentation to reflect recent changes. Add examples, update endpoint descriptions, and ensure all parameters are documented.",
        taskType: "Documentation",
        priority: "Low",
        status: "In Progress",
        department: "Development",
        startDate: new Date('2025-12-01'),
        dueDate: new Date('2025-12-15'),
        estimatedHours: 16,
        progressPercent: 30,
        isStandaloneTask: true
    }
];

// Sample comments for tasks
const sampleComments = [
    "Great progress! Keep up the good work.",
    "Please update the documentation as you go.",
    "I've reviewed the code and left some comments on the PR.",
    "Can we schedule a quick call to discuss the approach?",
    "This is looking good. Just a few minor adjustments needed.",
    "Please ensure all tests are passing before marking as complete.",
    "I've added some additional requirements in the ticket.",
    "Nice work on this! The implementation is clean."
];

// Sample progress updates
const sampleProgressUpdates = [
    { comment: "Started working on the initial setup", progress: 10 },
    { comment: "Completed the basic structure", progress: 30 },
    { comment: "Implemented core functionality", progress: 60 },
    { comment: "Testing and bug fixes in progress", progress: 80 },
    { comment: "Final review and documentation", progress: 95 }
];

// Sample time logs
const sampleTimeLogs = [
    { duration: 120, description: "Initial research and planning" },
    { duration: 180, description: "Implementation of core features" },
    { duration: 90, description: "Code review and refactoring" },
    { duration: 60, description: "Testing and bug fixes" },
    { duration: 45, description: "Documentation updates" }
];

async function seedTasks() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm');
        console.log('Connected to MongoDB');

        // Get some employees and projects for assignment
        const employees = await Employee.find().limit(10);
        const projects = await Project.find().limit(5);

        if (employees.length === 0) {
            console.log('No employees found. Please create employees first.');
            return;
        }

        console.log(`Found ${employees.length} employees and ${projects.length} projects`);

        // Clear existing tasks (optional - comment out if you want to keep existing tasks)
        // await Task.deleteMany({});
        // console.log('Cleared existing tasks');

        // Create tasks
        const createdTasks = [];

        for (let i = 0; i < sampleTasks.length; i++) {
            const taskData = sampleTasks[i];

            // Randomly assign employees
            const assignedBy = employees[Math.floor(Math.random() * employees.length)];
            const assignedTo = employees[Math.floor(Math.random() * employees.length)];

            // Randomly assign project (50% chance)
            const relatedProject = Math.random() > 0.5 && projects.length > 0
                ? projects[Math.floor(Math.random() * projects.length)]._id
                : null;

            // Create task
            const task = new Task({
                ...taskData,
                assignedBy: assignedBy._id,
                assignedTo: assignedTo._id,
                createdBy: assignedBy._id,
                relatedProject,
                isStandaloneTask: !relatedProject,

                // Add some random comments
                comments: Math.random() > 0.5 ? [
                    {
                        comment: sampleComments[Math.floor(Math.random() * sampleComments.length)],
                        commentedBy: employees[Math.floor(Math.random() * employees.length)]._id
                    }
                ] : [],

                // Add progress updates for in-progress tasks
                selfProgressUpdates: taskData.status === 'In Progress' ? [
                    {
                        ...sampleProgressUpdates[Math.floor(Math.random() * sampleProgressUpdates.length)],
                        updatedBy: assignedTo._id
                    }
                ] : [],

                // Add time logs for tasks with progress
                timeLogs: taskData.progressPercent > 0 ? [
                    {
                        ...sampleTimeLogs[Math.floor(Math.random() * sampleTimeLogs.length)],
                        startTime: new Date(Date.now() - 86400000), // Yesterday
                        endTime: new Date(),
                        loggedBy: assignedTo._id
                    }
                ] : [],

                // Add activity log
                activityLog: [
                    {
                        action: 'Task Created',
                        performedBy: assignedBy._id,
                        details: `Task created and assigned to ${assignedTo.firstName} ${assignedTo.lastName}`
                    }
                ]
            });

            const savedTask = await task.save();
            createdTasks.push(savedTask);

            console.log(`✅ Created task: ${savedTask.taskTitle}`);
        }

        console.log(`\n🎉 Successfully created ${createdTasks.length} sample tasks!`);
        console.log('\nTask Statistics:');
        console.log(`- To Do: ${createdTasks.filter(t => t.status === 'To Do').length}`);
        console.log(`- In Progress: ${createdTasks.filter(t => t.status === 'In Progress').length}`);
        console.log(`- Review: ${createdTasks.filter(t => t.status === 'Review').length}`);
        console.log(`- Completed: ${createdTasks.filter(t => t.status === 'Completed').length}`);

        console.log('\nPriority Distribution:');
        console.log(`- Low: ${createdTasks.filter(t => t.priority === 'Low').length}`);
        console.log(`- Medium: ${createdTasks.filter(t => t.priority === 'Medium').length}`);
        console.log(`- High: ${createdTasks.filter(t => t.priority === 'High').length}`);
        console.log(`- Urgent: ${createdTasks.filter(t => t.priority === 'Urgent').length}`);

    } catch (error) {
        console.error('Error seeding tasks:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

// Run the seed function
seedTasks();
