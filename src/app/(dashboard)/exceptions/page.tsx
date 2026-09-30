'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ExceptionInboxPage() {
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/exceptions')
      .then(res => res.json())
      .then(json => {
        setExceptions(json.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Operations Control Center</h1>
        <p className="text-gray-500 mt-2">Manage exceptions, SLA breaches, and workflow failures.</p>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Open Exceptions" count={exceptions.filter(e => e.status === 'OPEN').length} color="text-gray-900" />
        <StatCard title="Critical SLA at Risk" count={exceptions.filter(e => e.priority === 'CRITICAL').length} color="text-red-600" />
        <StatCard title="My Work Queue" count={0} />
        <StatCard title="Automated Recoveries" count={24} color="text-green-600" />
      </div>

      {/* Exception Inbox Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">Exception Inbox</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">Filter</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Bulk Assign</button>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title & Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SLA Due</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading cases...</td></tr>
            ) : exceptions.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Inbox is completely clear. 🎉</td></tr>
            ) : (
              exceptions.map(exc => (
                <tr key={exc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-blue-600">{exc.exceptionNumber}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${getPriorityColor(exc.priority)}`}>
                      {exc.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{exc.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{exc.category}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{exc.status}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(exc.dueAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/exceptions/${exc.id}`} className="text-blue-600 hover:text-blue-900 font-medium text-sm">
                      Triage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, count, color = 'text-gray-900' }: { title: string, count: number, color?: string }) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`mt-2 text-3xl font-semibold ${color}`}>{count}</p>
    </div>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'CRITICAL': return 'bg-red-100 text-red-800';
    case 'HIGH': return 'bg-orange-100 text-orange-800';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
