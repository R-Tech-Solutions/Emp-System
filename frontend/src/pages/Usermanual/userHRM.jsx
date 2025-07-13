import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  ClipboardList,
  Clock,
  Calendar,
  FileText,
  DollarSign,
  MessageCircle,
  Box,
  BarChart,
  Share2,
  CheckCircle,
  LifeBuoy,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

const sections = [
  { id: 'employeesmanagement', title: 'Employees Management', icon: User },
  { id: 'taskmanagement', title: 'Task Management', icon: ClipboardList },
  { id: 'timesheets', title: 'Timesheets', icon: Clock },
  { id: 'attendancetracking', title: 'Attendance Tracking', icon: Calendar },
  { id: 'leaverequestsystem', title: 'Leave Request System', icon: FileText },
  { id: 'payrollmanagement', title: 'Payroll Management', icon: DollarSign },
  { id: 'messagingsystem', title: 'Messaging System', icon: MessageCircle },
  { id: 'assetmanagement', title: 'Asset Management', icon: Box },
  { id: 'reports', title: 'Reports', icon: BarChart },
  { id: 'systemintegration', title: 'System Integration', icon: Share2 },
  { id: 'bestpractices', title: 'Best Practices', icon: CheckCircle },
  { id: 'supportmaintenance', title: 'Support and Maintenance', icon: LifeBuoy },
];

const manualContent = {
  employeesmanagement: {
    heading: 'Employees Management',
    features: [
      'Complete Employee Profiles: Personal, professional, and employment information',
      'Document Management: Resume uploads and profile images',
      'Employment Details: Position, department, employment type, and status',
      'Salary Configuration: Pay methods, rates, and banking information',
      'Emergency Contacts: Multiple emergency contact management',
      'Education History: Educational background tracking',
      'Search and Filter: Advanced search and filtering capabilities',
    ],
    usage: [
      {
        title: 'Adding New Employee',
        steps: [
          'Click "Add Employee" to open the employee form',
          'Fill Basic Information: Enter personal and contact details',
          'Set Employment Details: Choose position, department, and employment type',
          'Configure Salary: Set pay method and rates',
          'Add Emergency Contacts: Enter emergency contact information',
          'Upload Documents: Add resume and profile image',
          'Save Employee: Complete the registration process',
        ],
      },
      {
        title: 'Editing Employee',
        steps: [
          'Select Employee: Click on employee from the list',
          'Click Edit: Modify employee information',
          'Update Details: Change any required information',
          'Save Changes: Update employee record',
        ],
      },
      {
        title: 'Managing Employee Data',
        steps: [
          'Search Employees: Use search bar to find specific employees',
          'Filter by Department: View employees by department',
          'View Profile: Click eye icon to view complete profile',
          'Delete Employee: Remove employee from system (with confirmation)',
        ],
      },
    ],
  },
  taskmanagement: {
    heading: 'Task Management',
    features: [
      'Task Assignment: Assign tasks to specific employees',
      'Status Tracking: Monitor task progress (not started, started, completed, overtime)',
      'Priority Management: Set task priorities and urgency levels',
      'File Attachments: Attach relevant documents to tasks',
      'Due Date Management: Set and track task deadlines',
      'Department Filtering: Organize tasks by department',
      'Supervisor Assignment: Assign supervisors to tasks',
    ],
    usage: [
      {
        title: 'Creating New Task',
        steps: [
          'Click "Add Task" to open task creation form',
          'Enter Task Details: Name, description, and due date',
          'Select Department: Choose relevant department',
          'Assign Employee: Select employee to handle the task',
          'Set Supervisor: Assign task supervisor',
          'Add Attachments: Upload relevant files',
          'Set Priority Tags: Mark task priority level',
          'Save Task: Create the task assignment',
        ],
      },
      {
        title: 'Managing Tasks',
        steps: [
          'View Task List: See all assigned tasks',
          'Filter by Status: View tasks by completion status',
          'Update Progress: Mark tasks as started or completed',
          'Edit Task: Modify task details if needed',
          'Delete Task: Remove completed or unnecessary tasks',
        ],
      },
      {
        title: 'Task Monitoring',
        steps: [
          'Track Progress: Monitor task completion rates',
          'Identify Overtime: Spot tasks exceeding time limits',
          'Department Overview: View task distribution by department',
          'Employee Workload: Check individual employee task assignments',
        ],
      },
    ],
  },
  timesheets: {
    heading: 'Timesheets',
    features: [
      'Time Tracking: Record start and end times for tasks',
      'Work Hour Calculation: Automatic calculation of total work hours',
      'Task Association: Link time entries to specific tasks',
      'Overtime Detection: Identify work exceeding standard hours',
      'Daily Summaries: Daily work hour summaries',
      'Employee Filtering: View timesheets by employee',
      'Status Monitoring: Track task completion status',
    ],
    usage: [
      {
        title: 'Recording Work Hours',
        steps: [
          'Select Employee: Choose employee from the list',
          'Start Timer: Begin recording work time',
          'Associate Task: Link time to specific task',
          'End Timer: Stop recording when work is complete',
          'Review Entry: Verify recorded time is accurate',
        ],
      },
      {
        title: 'Managing Timesheets',
        steps: [
          'View Daily Summary: Check daily work hour totals',
          'Filter by Employee: View specific employee timesheets',
          'Track Task Progress: Monitor time spent on tasks',
          'Identify Overtime: Spot employees working extra hours',
          'Export Data: Download timesheet reports',
        ],
      },
      {
        title: 'Timesheet Analysis',
        steps: [
          'Workload Distribution: Analyze work hour distribution',
          'Task Efficiency: Measure time efficiency per task',
          'Overtime Patterns: Identify recurring overtime issues',
          'Productivity Metrics: Calculate productivity indicators',
        ],
      },
    ],
  },
  attendancetracking: {
    heading: 'Attendance Tracking',
    features: [
      'Daily Attendance: Track daily checkins and checkouts',
      'Work Hour Calculation: Calculate total daily work hours',
      'Multiple View Modes: Daily, weekly, and monthly views',
      'Calendar Interface: Visual calendar for attendance tracking',
      'Employee Search: Find specific employee attendance records',
      'Attendance Statistics: Generate attendance reports',
      'Monthly Totals: Calculate monthly work hour summaries',
    ],
    usage: [
      {
        title: 'Recording Attendance',
        steps: [
          'Select Date: Choose the date for attendance recording',
          'Select Employee: Choose employee from the list',
          'Record Checkin: Enter arrival time',
          'Record Checkout: Enter departure time',
          'Calculate Hours: System automatically calculates work hours',
          'Save Record: Store attendance information',
        ],
      },
      {
        title: 'Managing Attendance',
        steps: [
          'View Daily Attendance: Check daily attendance records',
          'Switch View Modes: Toggle between daily, weekly, monthly views',
          'Search Employees: Find specific employee records',
          'Navigate Dates: Move between different dates',
          'Export Reports: Download attendance reports',
        ],
      },
      {
        title: 'Attendance Analysis',
        steps: [
          'Attendance Patterns: Analyze employee attendance trends',
          'Late Arrival Reports: Identify employees with frequent late arrivals',
          'Work Hour Analysis: Review work hour distribution',
          'Absence Tracking: Monitor employee absences',
        ],
      },
    ],
  },
  leaverequestsystem: {
    heading: 'Leave Request System',
    features: [
      'Leave Types: Sick, casual, vacation, and custom leave types',
      'Request Management: Submit and track leave requests',
      'Approval Workflow: Manager approval process',
      'Leave Balance Tracking: Monitor available leave days',
      'Email Notifications: Automated email notifications',
      'Status Tracking: Track request approval status',
      'Rejection Handling: Manage rejected leave requests',
    ],
    usage: [
      {
        title: 'Submitting Leave Request',
        steps: [
          'Click "Add Leave Request" to open request form',
          'Select Employee: Choose employee requesting leave',
          'Choose Leave Type: Select appropriate leave category',
          'Set Date Range: Enter start and end dates',
          'Enter Reason: Provide leave reason',
          'Submit Request: Send for approval',
        ],
      },
      {
        title: 'Managing Leave Requests',
        steps: [
          'View All Requests: See all pending and processed requests',
          'Filter by Status: View requests by approval status',
          'Approve/Reject: Process leave requests',
          'Add Comments: Provide feedback on requests',
          'Track Leave Balance: Monitor available leave days',
        ],
      },
      {
        title: 'Leave Administration',
        steps: [
          'Leave Type Management: Create and manage leave types',
          'Leave Balance Monitoring: Track employee leave balances',
          'Approval Workflow: Manage approval process',
          'Email Notifications: Send automated notifications',
          'Report Generation: Create leave reports',
        ],
      },
    ],
  },
  payrollmanagement: {
    heading: 'Payroll Management',
    features: [
      'Salary Calculation: Automatic salary computation',
      'Overtime Pay: Calculate overtime compensation',
      'Deductions: Handle salary deductions and taxes',
      'Income/Expense Tracking: Track additional income and expenses',
      'PDF Generation: Generate professional payslips',
      'Monthly Processing: Monthly payroll processing',
      'Historical Records: Maintain payroll history',
    ],
    usage: [
      {
        title: 'Processing Payroll',
        steps: [
          'Select Employee: Choose employee for payroll processing',
          'Select Month: Choose payroll month',
          'Enter Work Hours: Input total work hours for the month',
          'Calculate Salary: System calculates total compensation',
          'Review Details: Check salary breakdown',
          'Generate Payslip: Create professional payslip',
          'Save Payroll: Store payroll record',
        ],
      },
      {
        title: 'Managing Payroll',
        steps: [
          'View Payroll History: Access previous payroll records',
          'Edit Payroll: Modify payroll details if needed',
          'Generate Reports: Create payroll reports',
          'Export PDF: Download payslips in PDF format',
          'Email Payslips: Send payslips to employees',
        ],
      },
      {
        title: 'Payroll Features',
        steps: [
          'Income/Expense Management: Add additional income or expenses',
          'Tax Calculation: Automatic tax computation',
          'Loan Management: Handle salary loans and deductions',
          'Bonus Processing: Process performance bonuses',
          'Yearend Processing: Annual payroll summaries',
        ],
      },
    ],
  },
  messagingsystem: {
    heading: 'Messaging System',
    features: [
      'Group Management: Create and manage employee groups',
      'Announcements: Send companywide announcements',
      'Email Integration: Email notifications for messages',
      'Targeted Communication: Send messages to specific groups',
      'Message History: Maintain communication records',
      'Department Filtering: Organize groups by department',
      'Positionbased Groups: Create groups by job positions',
    ],
    usage: [
      {
        title: 'Creating Groups',
        steps: [
          'Click "Create Group" to open group creation form',
          'Enter Group Details: Name and description',
          'Select Members: Choose employees for the group',
          'Set Filters: Filter by department or position',
          'Save Group: Create the employee group',
        ],
      },
      {
        title: 'Sending Announcements',
        steps: [
          'Click "Send Announcement" to create announcement',
          'Enter Content: Write announcement message',
          'Select Recipients: Choose target groups',
          'Enable Email: Option to send email notifications',
          'Send Announcement: Distribute the message',
        ],
      },
      {
        title: 'Managing Communication',
        steps: [
          'View Groups: See all created groups',
          'Edit Groups: Modify group membership',
          'Delete Groups: Remove unnecessary groups',
          'View Announcements: Check sent announcements',
          'Message History: Review communication records',
        ],
      },
    ],
  },
  assetmanagement: {
    heading: 'Asset Management',
    features: [
      'Asset Registration: Register company assets',
      'Employee Assignment: Assign assets to employees',
      'Asset Tracking: Monitor asset location and status',
      'Maintenance Records: Track asset maintenance',
      'Asset Categories: Organize assets by type',
      'Value Tracking: Monitor asset values',
      'Status Management: Track asset condition',
    ],
    usage: [
      {
        title: 'Registering Assets',
        steps: [
          'Click "Add Asset" to open asset registration form',
          'Enter Asset Details: Name, type, serial number',
          'Set Value: Enter asset purchase value',
          'Assign Employee: Choose asset recipient',
          'Set Status: Mark asset as active',
          'Save Asset: Complete asset registration',
        ],
      },
      {
        title: 'Managing Assets',
        steps: [
          'View Asset List: See all registered assets',
          'Search Assets: Find specific assets',
          'Edit Asset: Update asset information',
          'Transfer Asset: Reassign to different employee',
          'Retire Asset: Mark asset as no longer in use',
        ],
      },
      {
        title: 'Asset Tracking',
        steps: [
          'Asset Location: Track asset assignments',
          'Maintenance Schedule: Schedule regular maintenance',
          'Value Depreciation: Monitor asset value changes',
          'Inventory Reports: Generate asset inventory reports',
        ],
      },
    ],
  },
  reports: {
    heading: 'Reports',
    features: [
      'Employee Reports: Employee statistics and demographics',
      'Attendance Reports: Work hour and attendance analysis',
      'Payroll Reports: Salary and compensation reports',
      'Leave Reports: Leave pattern analysis',
      'Task Reports: Task completion and performance metrics',
      'Asset Reports: Asset utilization and value reports',
      'Export Options: PDF and Excel export capabilities',
    ],
    usage: [
      {
        title: 'Generating Reports',
        steps: [
          'Select Report Type: Choose the type of report needed',
          'Set Date Range: Define report period',
          'Apply Filters: Use filters for specific data',
          'Generate Report: Create the report',
          'Export Report: Download in PDF or Excel format',
        ],
      },
      {
        title: 'Report Analysis',
        steps: [
          'Review Data: Analyze report information',
          'Identify Trends: Spot patterns and trends',
          'Make Decisions: Use insights for decision making',
          'Share Reports: Distribute reports to stakeholders',
        ],
      },
    ],
  },
  systemintegration: {
    heading: 'System Integration',
    features: [
      'Employees → Tasks: Assign tasks to employees',
      'Tasks → Timesheets: Track time spent on tasks',
      'Timesheets → Attendance: Calculate work hours',
      'Attendance → Payroll: Use attendance for salary calculation',
      'Leave → Payroll: Include leave in payroll processing',
      'Employees → Assets: Assign assets to employees',
      'All Modules → Reports: Generate comprehensive reports',
    ],
    usage: [],
  },
  bestpractices: {
    heading: 'Best Practices',
    features: [
      'Regular Data Entry: Enter employee and attendance data promptly',
      'Consistent Processes: Follow standard procedures for all HR functions',
      'Data Validation: Verify information accuracy before saving',
      'Regular Backups: Ensure HR data is regularly backed up',
      'User Training: Train HR staff on system features',
      'Regular Reviews: Review reports regularly for insights',
      'Compliance: Ensure HR processes comply with labor laws',
    ],
    usage: [],
  },
  supportmaintenance: {
    heading: 'Support and Maintenance',
    features: [
      'User Permissions: Configure appropriate access levels for HR staff',
      'Data Backup: Regular backup procedures for HR data',
      'System Updates: Keep system updated for latest features',
      'Training: Regular user training sessions',
      'Documentation: Maintain updated user documentation',
      'Compliance Monitoring: Ensure regulatory compliance',
    ],
    usage: [],
  },
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Collapsible({ title, children, defaultOpen = false, icon }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-2">
      <button
        className="flex items-center gap-2 w-full text-left font-semibold text-primary py-2 px-2 rounded hover:bg-accent/40 transition"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {icon}
        {title}
        {open ? <ChevronUp className="ml-auto w-4 h-4" /> : <ChevronDown className="ml-auto w-4 h-4" />}
      </button>
      {open && <div className="pl-2 pb-2">{children}</div>}
    </div>
  );
}

function Callout({ type = 'info', children }) {
  const color = type === 'tip' ? 'border-primary bg-primary-light/40' : 'border-accent bg-accent/30';
  return (
    <div className={`flex items-start gap-2 border-l-4 rounded px-3 py-2 mb-4 ${color}`}>
      <Info className="w-5 h-5 mt-1 text-primary" />
      <div className="text-sm text-text-secondary">{children}</div>
    </div>
  );
}

export default function UserHRMManual() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [expanded, setExpanded] = useState(() => {
    // By default, expand the first section
    const obj = {};
    sections.forEach((s, i) => (obj[s.id] = i === 0));
    return obj;
  });
  const sectionRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      let current = sections[0].id;
      for (const section of sections) {
        const ref = sectionRefs.current[section.id];
        if (ref && ref.offsetTop <= scrollPosition) {
          current = section.id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const ref = sectionRefs.current[id];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        window.scrollBy({ top: -80, left: 0, behavior: 'instant' });
      }, 300);
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 w-full md:sticky md:top-0 bg-primary-light border-r border-border z-10">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-primary" /> HRM User Manual
          </h2>
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={classNames(
                    'flex items-center gap-2 w-full text-left px-3 py-2 rounded transition',
                    activeSection === section.id
                      ? 'bg-primary text-white font-semibold shadow'
                      : 'text-text-primary hover:bg-accent hover:text-primary'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {section.title}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-4xl mx-auto">
        {sections.map((section) => {
          const content = manualContent[section.id];
          const Icon = section.icon;
          return (
            <section
              key={section.id}
              id={section.id}
              ref={(el) => (sectionRefs.current[section.id] = el)}
              className="mb-12"
            >
              <div className={
                'bg-white rounded-lg shadow p-6 border-l-4 border border-border ' +
                (activeSection === section.id ? 'border-primary' : 'border-border')
              }>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                  <h3 className="text-2xl font-bold text-primary">{content.heading}</h3>
                </div>
                {/* Example callout for best practices or tips */}
                {section.id === 'employeesmanagement' && (
                  <Callout type="tip">Keep employee profiles updated for accurate payroll and reporting.</Callout>
                )}
                {section.id === 'payrollmanagement' && (
                  <Callout type="tip">Review payroll history regularly to ensure compliance and accuracy.</Callout>
                )}
                {content.features && (
                  <Collapsible
                    title="Key Features"
                    defaultOpen={true}
                    icon={<Info className="w-4 h-4 text-primary" />}
                  >
                    <ul className="list-disc pl-6 mb-2 text-text-secondary">
                      {content.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </Collapsible>
                )}
                {content.usage && content.usage.length > 0 && (
                  <Collapsible
                    title="How to Use"
                    defaultOpen={expanded[section.id]}
                    icon={<ClipboardList className="w-4 h-4 text-primary" />}
                  >
                    <div className="space-y-4">
                      {content.usage.map((usage, idx) => (
                        <div key={idx}>
                          <h5 className="font-semibold text-primary mb-1">{usage.title}</h5>
                          <ol className="list-decimal pl-6 text-text-secondary">
                            {usage.steps.map((step, sidx) => (
                              <li key={sidx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  </Collapsible>
                )}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
