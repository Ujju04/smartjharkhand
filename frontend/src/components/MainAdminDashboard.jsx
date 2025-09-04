import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Search, 
  Filter, 
  BarChart3, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings,
  LogOut,
  Plus,
  FileText,
  ArrowRight,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { mockComplaints, mockUsers, mockWorkers, mockDepartments, mockAnalytics } from '../data/mockData';

const MainAdminDashboard = ({ user, onLogout }) => {
  const [complaints, setComplaints] = useState(mockComplaints);
  const [users, setUsers] = useState(mockUsers);
  const [workers, setWorkers] = useState(mockWorkers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignDialog, setAssignDialog] = useState(false);
  const [transferDialog, setTransferDialog] = useState(false);
  const [userSearchDialog, setUserSearchDialog] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Filter complaints based on search and filters
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || complaint.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesDepartment = filterDepartment === 'all' || complaint.department === filterDepartment;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Filter users for search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.phone.includes(userSearchTerm) ||
    user.id.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleAssignComplaint = (complaintId, workerId) => {
    const worker = workers.find(w => w.id === workerId);
    setComplaints(complaints.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, assignedTo: workerId, assignedWorker: worker.name, status: 'In Progress' }
        : complaint
    ));
    setAssignDialog(false);
    // Simulate browser notification
    if (Notification.permission === 'granted') {
      new Notification('Complaint Assigned', {
        body: `Complaint ${complaintId} has been assigned to ${worker.name}`,
        icon: '/favicon.ico'
      });
    }
  };

  const handleTransferComplaint = (complaintId, newDepartment) => {
    setComplaints(complaints.map(complaint =>
      complaint.id === complaintId
        ? { ...complaint, department: newDepartment, assignedTo: null, assignedWorker: null, status: 'Pending' }
        : complaint
    ));
    setTransferDialog(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-sm text-slate-600">Welcome back, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
            <TabsTrigger value="users">User Database</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Complaints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{mockAnalytics.totalComplaints}</div>
                  <p className="text-xs text-slate-600">All time</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{mockAnalytics.pendingComplaints}</div>
                  <p className="text-xs text-slate-600">Needs assignment</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{mockAnalytics.inProgressComplaints}</div>
                  <p className="text-xs text-slate-600">Being worked on</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{mockAnalytics.completedComplaints}</div>
                  <p className="text-xs text-slate-600">Resolved</p>
                </CardContent>
              </Card>
            </div>

            {/* Department Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Complaint breakdown by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.departmentStats.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="font-medium text-slate-800">{dept.department}</div>
                      <div className="flex items-center space-x-6 text-sm">
                        <span className="text-slate-600">Total: {dept.total}</span>
                        <span className="text-green-600">Completed: {dept.completed}</span>
                        <span className="text-blue-600">In Progress: {dept.inProgress}</span>
                        <span className="text-orange-600">Pending: {dept.pending}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Complaint Management</CardTitle>
                    <CardDescription>View, assign, and transfer complaints</CardDescription>
                  </div>
                  <Dialog open={userSearchDialog} onOpenChange={setUserSearchDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Search className="w-4 h-4 mr-2" />
                        Search Users
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>User Database Search</DialogTitle>
                        <DialogDescription>Search users by ID, email, phone, or name</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Search users..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                        />
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Statistics</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell className="font-mono text-sm">{user.id}</TableCell>
                                  <TableCell>{user.name}</TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="flex items-center text-sm">
                                        <Mail className="w-3 h-3 mr-1" />
                                        {user.email}
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <Phone className="w-3 h-3 mr-1" />
                                        {user.phone}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <div>Total: {user.totalComplaints}</div>
                                      <div className="text-green-600">Resolved: {user.resolvedComplaints}</div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <Input
                      placeholder="Search complaints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {mockDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Complaints Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredComplaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{complaint.title}</div>
                              <div className="text-sm text-slate-600">{complaint.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(complaint.priority)}>
                              {complaint.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(complaint.status)}>
                              {complaint.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{complaint.department}</TableCell>
                          <TableCell>
                            {complaint.assignedWorker || <span className="text-slate-400">Unassigned</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog open={assignDialog && selectedComplaint?.id === complaint.id} 
                                     onOpenChange={(open) => {
                                       setAssignDialog(open);
                                       if (open) setSelectedComplaint(complaint);
                                     }}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">Assign</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Assign Complaint</DialogTitle>
                                    <DialogDescription>
                                      Assign this complaint to a department worker
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Select Worker</Label>
                                      <Select onValueChange={(value) => handleAssignComplaint(complaint.id, value)}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Choose a worker" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {workers.filter(w => w.department === complaint.department).map(worker => (
                                            <SelectItem key={worker.id} value={worker.id}>
                                              {worker.name} - {worker.department}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog open={transferDialog && selectedComplaint?.id === complaint.id}
                                     onOpenChange={(open) => {
                                       setTransferDialog(open);
                                       if (open) setSelectedComplaint(complaint);
                                     }}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">Transfer</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Transfer Complaint</DialogTitle>
                                    <DialogDescription>
                                      Transfer this complaint to a different department
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Select Department</Label>
                                      <Select onValueChange={(value) => handleTransferComplaint(complaint.id, value)}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Choose department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {mockDepartments.filter(dept => dept !== complaint.department).map(dept => (
                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Database</CardTitle>
                <CardDescription>Complete user information and complaint history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Info</TableHead>
                      <TableHead>Contact Details</TableHead>
                      <TableHead>Complaint Statistics</TableHead>
                      <TableHead>Member Since</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-slate-600 font-mono">{user.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-2 text-slate-400" />
                              {user.email}
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-2 text-slate-400" />
                              {user.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">Total: {user.totalComplaints}</div>
                            <div className="text-sm text-green-600">Resolved: {user.resolvedComplaints}</div>
                            <div className="text-sm text-orange-600">
                              Pending: {user.totalComplaints - user.resolvedComplaints}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-slate-600">
                            <Calendar className="w-3 h-3 mr-2" />
                            {new Date(user.joinedDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role Management Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Role Management</CardTitle>
                    <CardDescription>Manage department workers and their permissions</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Worker
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker Info</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{worker.name}</div>
                            <div className="text-sm text-slate-600">{worker.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{worker.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">Assigned: {worker.assignedComplaints}</div>
                            <div className="text-sm text-green-600">Completed: {worker.completedComplaints}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline">Deactivate</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MainAdminDashboard;