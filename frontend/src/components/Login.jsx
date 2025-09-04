import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, User, Lock } from 'lucide-react';
import { mockAuth } from '../data/mockData';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      let user = null;

      if (formData.role === 'Main Admin') {
        if (formData.username === mockAuth.mainAdmin.username && 
            formData.password === mockAuth.mainAdmin.password) {
          user = {
            ...mockAuth.mainAdmin,
            token: 'mock-jwt-token-main-admin'
          };
        }
      } else if (formData.role === 'Lower Admin') {
        const worker = mockAuth.workers.find(w => 
          w.username === formData.username && w.password === formData.password
        );
        if (worker) {
          user = {
            ...worker,
            token: `mock-jwt-token-${worker.id}`
          };
        }
      }

      if (user) {
        localStorage.setItem('adminUser', JSON.stringify(user));
        onLogin(user);
      } else {
        setError('Invalid credentials. Please check your username and password.');
      }
      setLoading(false);
    }, 1000);
  };

  const handleDemoLogin = (role) => {
    if (role === 'main') {
      setFormData({
        username: 'admin',
        password: 'admin123',
        role: 'Main Admin'
      });
    } else {
      setFormData({
        username: 'mike.wilson',
        password: 'worker123',
        role: 'Lower Admin'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800">Admin Dashboard</CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to access your admin panel
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-700 font-medium">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Admin">Main Admin</SelectItem>
                  <SelectItem value="Lower Admin">Department Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-medium">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Demo Accounts</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleDemoLogin('main')}
                className="text-xs"
              >
                Main Admin
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleDemoLogin('worker')}
                className="text-xs"
              >
                Worker Demo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;