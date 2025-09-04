// Mock data for Admin Dashboard

export const mockComplaints = [
  {
    id: "CMP001",
    title: "Street Light Not Working",
    description: "Street light on Main Street has been broken for 2 weeks",
    category: "Infrastructure",
    department: "Public Works",
    priority: "High",
    status: "In Progress",
    userId: "USER001",
    userEmail: "john.doe@email.com",
    userPhone: "+1234567890",
    assignedTo: "worker1",
    assignedWorker: "Mike Wilson",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-16T14:20:00Z",
    proofImages: [],
    remarks: "Work started, parts ordered"
  },
  {
    id: "CMP002",
    title: "Water Leakage in Park",
    description: "Major water pipe leak causing flooding in Central Park",
    category: "Water",
    department: "Water Department",
    priority: "Critical",
    status: "Pending",
    userId: "USER002",
    userEmail: "sarah.smith@email.com",
    userPhone: "+1234567891",
    assignedTo: null,
    assignedWorker: null,
    createdAt: "2025-01-17T08:15:00Z",
    updatedAt: "2025-01-17T08:15:00Z",
    proofImages: [],
    remarks: ""
  },
  {
    id: "CMP003",
    title: "Garbage Collection Missed",
    description: "Garbage not collected for 3 days in residential area",
    category: "Sanitation",
    department: "Waste Management",
    priority: "Medium",
    status: "Completed",
    userId: "USER003",
    userEmail: "robert.johnson@email.com",
    userPhone: "+1234567892",
    assignedTo: "worker2",
    assignedWorker: "Lisa Chen",
    createdAt: "2025-01-14T16:45:00Z",
    updatedAt: "2025-01-17T11:30:00Z",
    proofImages: ["proof1.jpg", "proof2.jpg"],
    remarks: "Area cleaned, schedule updated"
  },
  {
    id: "CMP004",
    title: "Road Pothole Repair",
    description: "Large pothole on Oak Avenue causing traffic issues",
    category: "Infrastructure", 
    department: "Public Works",
    priority: "High",
    status: "In Progress",
    userId: "USER004",
    userEmail: "emma.davis@email.com",
    userPhone: "+1234567893",
    assignedTo: "worker1",
    assignedWorker: "Mike Wilson",
    createdAt: "2025-01-16T12:00:00Z",
    updatedAt: "2025-01-17T09:15:00Z",
    proofImages: [],
    remarks: "Materials arranged, work scheduled for tomorrow"
  },
  {
    id: "CMP005",
    title: "Broken Traffic Signal",
    description: "Traffic light at 5th and Main intersection not functioning",
    category: "Traffic",
    department: "Traffic Management",
    priority: "Critical",
    status: "Pending",
    userId: "USER005",
    userEmail: "james.wilson@email.com",
    userPhone: "+1234567894",
    assignedTo: null,
    assignedWorker: null,
    createdAt: "2025-01-17T14:30:00Z",
    updatedAt: "2025-01-17T14:30:00Z",
    proofImages: [],
    remarks: ""
  }
];

export const mockUsers = [
  {
    id: "USER001",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1234567890",
    totalComplaints: 3,
    resolvedComplaints: 2,
    joinedDate: "2024-06-15"
  },
  {
    id: "USER002", 
    name: "Sarah Smith",
    email: "sarah.smith@email.com",
    phone: "+1234567891",
    totalComplaints: 1,
    resolvedComplaints: 0,
    joinedDate: "2024-08-22"
  },
  {
    id: "USER003",
    name: "Robert Johnson", 
    email: "robert.johnson@email.com",
    phone: "+1234567892",
    totalComplaints: 5,
    resolvedComplaints: 4,
    joinedDate: "2024-03-10"
  },
  {
    id: "USER004",
    name: "Emma Davis",
    email: "emma.davis@email.com", 
    phone: "+1234567893",
    totalComplaints: 2,
    resolvedComplaints: 1,
    joinedDate: "2024-09-05"
  },
  {
    id: "USER005",
    name: "James Wilson",
    email: "james.wilson@email.com",
    phone: "+1234567894", 
    totalComplaints: 1,
    resolvedComplaints: 0,
    joinedDate: "2024-11-18"
  }
];

export const mockWorkers = [
  {
    id: "worker1",
    name: "Mike Wilson",
    email: "mike.wilson@admin.com",
    department: "Public Works",
    assignedComplaints: 2,
    completedComplaints: 15,
    role: "Lower Admin"
  },
  {
    id: "worker2", 
    name: "Lisa Chen",
    email: "lisa.chen@admin.com",
    department: "Waste Management",
    assignedComplaints: 0,
    completedComplaints: 12,
    role: "Lower Admin"
  },
  {
    id: "worker3",
    name: "David Kumar",
    email: "david.kumar@admin.com", 
    department: "Water Department",
    assignedComplaints: 0,
    completedComplaints: 8,
    role: "Lower Admin"
  },
  {
    id: "worker4",
    name: "Ana Rodriguez",
    email: "ana.rodriguez@admin.com",
    department: "Traffic Management", 
    assignedComplaints: 0,
    completedComplaints: 10,
    role: "Lower Admin"
  }
];

export const mockDepartments = [
  "Public Works",
  "Water Department", 
  "Waste Management",
  "Traffic Management",
  "Parks & Recreation",
  "Building & Safety"
];

export const mockCategories = [
  "Infrastructure",
  "Water",
  "Sanitation", 
  "Traffic",
  "Parks",
  "Building"
];

export const mockAnalytics = {
  totalComplaints: 5,
  pendingComplaints: 2,
  inProgressComplaints: 2,
  completedComplaints: 1,
  criticalComplaints: 2,
  averageResolutionTime: "2.5 days",
  departmentStats: [
    { department: "Public Works", total: 2, completed: 0, pending: 1, inProgress: 1 },
    { department: "Water Department", total: 1, completed: 0, pending: 1, inProgress: 0 },
    { department: "Waste Management", total: 1, completed: 1, pending: 0, inProgress: 0 },
    { department: "Traffic Management", total: 1, completed: 0, pending: 1, inProgress: 0 }
  ]
};

// Authentication mock
export const mockAuth = {
  mainAdmin: {
    username: "admin",
    password: "admin123",
    role: "Main Admin",
    name: "System Administrator"
  },
  workers: [
    {
      username: "mike.wilson",
      password: "worker123", 
      role: "Lower Admin",
      name: "Mike Wilson",
      id: "worker1",
      department: "Public Works"
    },
    {
      username: "lisa.chen",
      password: "worker123",
      role: "Lower Admin", 
      name: "Lisa Chen",
      id: "worker2",
      department: "Waste Management"
    }
  ]
};