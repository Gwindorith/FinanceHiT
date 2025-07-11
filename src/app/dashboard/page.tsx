'use client';

import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft } from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Training Management</span>
          </a>
        </div>
        
        <Dashboard />
      </div>
    </ProtectedRoute>
  );
} 