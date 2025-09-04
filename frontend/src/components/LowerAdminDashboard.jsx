import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  Upload, 
  Image, 
  Video, 
  FileText, 
  Settings,
  LogOut,
  User,
  AlertCircle,
  Camera,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { complaintsAPI, uploadAPI } from '../services/api';

const LowerAdminDashboard = ({ user, onLogout }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [proofFiles, setProofFiles] = useState([]);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Load complaints assigned to this worker
  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintsAPI.getComplaints();
      setComplaints(response.complaints || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
      toast({
        title: "Error",
        description: "Failed to load complaints. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus, newRemarks, uploadedFiles = []) => {
    try {
      await complaintsAPI.updateComplaintStatus(complaintId, newStatus, newRemarks, uploadedFiles);
      
      // Update local state
      setComplaints(complaints.map(complaint =>
        complaint.id === complaintId
          ? { 
              ...complaint, 
              status: newStatus, 
              remarks: newRemarks,
              proofImages: [...complaint.proofImages, ...uploadedFiles],
              updatedAt: new Date().toISOString()
            }
          : complaint
      ));
      
      setUpdateDialog(false);
      setProofFiles([]);
      setRemarks('');
      setStatusUpdate('');

      toast({
        title: "Success",
        description: `Complaint ${complaintId} status updated to ${newStatus}`,
      });

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('Status Updated', {
          body: `Complaint ${complaintId} status updated to ${newStatus}`,
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update complaint status.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setProofFiles([...proofFiles, ...files]);
  };

  const removeFile = (index) => {
    setProofFiles(proofFiles.filter((_, i) => i !== index));
  };

  const handleCompleteUpdate = async () => {
    if (!statusUpdate) {
      toast({
        title: "Error",
        description: "Please select a status.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    let uploadedFiles = [];

    try {
      // Upload files if any
      if (proofFiles.length > 0) {
        const uploadResponse = await uploadAPI.uploadProofFiles(proofFiles);
        uploadedFiles = uploadResponse.files || [];
      }

      // Update complaint status
      await handleStatusUpdate(selectedComplaint.id, statusUpdate, remarks, uploadedFiles);
    } catch (error) {
      console.error('Error in complete update:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete update.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Worker Dashboard</h1>
              <p className="text-sm text-slate-600">Welcome back, {user.name}</p>
              <Badge variant="outline" className="mt-1">{user.department}</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Bell className="w-4 h-4" />
              <span>{complaints.filter(c => c.status === 'In Progress').length} active</span>
            </div>
            <Button variant="outline" size="sm" onClick={loadComplaints}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
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
        <Tabs defaultValue="assigned" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assigned">My Complaints</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Assigned Complaints Tab */}
          <TabsContent value="assigned" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Assigned to Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{complaints.length}</div>
                  <p className="text-xs text-slate-600">Total complaints</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {complaints.filter(c => c.status === 'In Progress').length}
                  </div>
                  <p className="text-xs text-slate-600">Active work</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {complaints.filter(c => c.status === 'Completed').length}
                  </div>
                  <p className="text-xs text-slate-600">Resolved</p>
                </CardContent>
              </Card>
            </div>

            {/* Complaints List */}
            <div className="space-y-4">
              {complaints.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No Complaints Assigned</h3>
                    <p className="text-slate-600">You don't have any complaints assigned to you at the moment.</p>
                  </CardContent>
                </Card>
              ) : (
                complaints.map((complaint) => (
                  <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg">{complaint.title}</CardTitle>
                            <Badge className={getPriorityColor(complaint.priority)}>
                              {complaint.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <span>ID: {complaint.id}</span>
                            <span>•</span>
                            <span>{complaint.category}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-slate-700">{complaint.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-600">Reported by:</span>
                          <div className="mt-1">
                            <div>{complaint.userEmail}</div>
                            <div>{complaint.userPhone}</div>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">Timeline:</span>
                          <div className="mt-1">
                            <div>Created: {formatDate(complaint.createdAt)}</div>
                            <div>Updated: {formatDate(complaint.updatedAt)}</div>
                          </div>
                        </div>
                      </div>

                      {complaint.remarks && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-blue-800 text-sm">Latest Update</div>
                              <div className="text-blue-700 text-sm">{complaint.remarks}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {complaint.proofImages.length > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-800 text-sm">Proof Uploaded</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {complaint.proofImages.map((image, index) => (
                              <Badge key={index} variant="outline" className="text-green-700">
                                {image}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="text-sm text-slate-500">
                          Department: {complaint.department}
                        </div>
                        <Dialog open={updateDialog && selectedComplaint?.id === complaint.id}
                               onOpenChange={(open) => {
                                 setUpdateDialog(open);
                                 if (open) {
                                   setSelectedComplaint(complaint);
                                   setStatusUpdate('');
                                   setRemarks('');
                                   setProofFiles([]);
                                 }
                               }}>
                          <DialogTrigger asChild>
                            <Button>
                              <Clock className="w-4 h-4 mr-2" />
                              Update Status
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Update Complaint Status</DialogTitle>
                              <DialogDescription>
                                Update the status of complaint {complaint.id} and upload proof of work
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div>
                                <Label>Status</Label>
                                <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select new status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Remarks/Notes</Label>
                                <Textarea
                                  placeholder="Add any remarks or notes about the work done..."
                                  value={remarks}
                                  onChange={(e) => setRemarks(e.target.value)}
                                  rows={3}
                                />
                              </div>

                              <div>
                                <Label>Upload Proof (Images/Videos)</Label>
                                <div className="mt-2 space-y-4">
                                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                                    <input
                                      type="file"
                                      multiple
                                      accept="image/*,video/*"
                                      onChange={handleFileUpload}
                                      className="hidden"
                                      id="proof-upload"
                                    />
                                    <label htmlFor="proof-upload" className="cursor-pointer">
                                      <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                      <p className="text-sm text-slate-600">
                                        Click to upload proof images or videos
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        PNG, JPG, MP4 up to 10MB each
                                      </p>
                                    </label>
                                  </div>

                                  {proofFiles.length > 0 && (
                                    <div className="space-y-2">
                                      <Label>Selected Files:</Label>
                                      {proofFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                                          <div className="flex items-center space-x-2">
                                            {file.type.startsWith('image/') ? (
                                              <Image className="w-4 h-4 text-blue-600" />
                                            ) : (
                                              <Video className="w-4 h-4 text-purple-600" />
                                            )}
                                            <span className="text-sm">{file.name}</span>
                                          </div>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setUpdateDialog(false)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleCompleteUpdate}
                                  disabled={!statusUpdate || uploading}
                                >
                                  {uploading ? 'Updating...' : 'Update Status'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Your work statistics and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-800">Current Period</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Assigned Complaints</span>
                        <span className="font-medium">{complaints.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Completed</span>
                        <span className="font-medium text-green-600">
                          {complaints.filter(c => c.status === 'Completed').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">In Progress</span>
                        <span className="font-medium text-blue-600">
                          {complaints.filter(c => c.status === 'In Progress').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Completion Rate</span>
                        <span className="font-medium">
                          {complaints.length > 0 
                            ? Math.round((complaints.filter(c => c.status === 'Completed').length / complaints.length) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-800">All Time Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Completed</span>
                        <span className="font-medium">{user.completedComplaints || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Department</span>
                        <span className="font-medium">{user.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Role</span>
                        <span className="font-medium">{user.role}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Performance Tips</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Upload proof images/videos for completed work</li>
                        <li>• Add detailed remarks for better communication</li>
                        <li>• Update status regularly to keep users informed</li>
                        <li>• Mark complaints as completed once work is finished</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LowerAdminDashboard;