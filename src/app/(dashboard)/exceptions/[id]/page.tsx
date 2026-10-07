'use client';
export const runtime = 'edge';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ExceptionWorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const [exc, setExc] = useState<any>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/exceptions/${id}`)
      .then(res => res.json())
      .then(json => setExc(json.data));
  }, [id]);

  const handleResolve = async (action: string) => {
    setResolving(true);
    await fetch(`/api/v1/exceptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESOLVE', resolutionCode: action, resolutionSummary: 'Handled via Workspace UI' })
    });
    router.push('/exceptions');
  };

  if (!exc) return <div className="p-8">Loading Workspace...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Left panel: Context and Evidence */}
      <div className="w-2/3 p-8 overflow-y-auto border-r border-gray-200 bg-white">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-mono text-sm text-gray-500">{exc.exceptionNumber}</span>
              <span className={`px-2 py-1 text-xs font-bold rounded ${getPriorityColor(exc.priority)}`}>{exc.priority}</span>
              <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">{exc.status}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{exc.title}</h1>
            <p className="text-gray-500 mt-2">{exc.description}</p>
          </div>
        </div>

        {/* AI Triage Recommendation */}
        {exc.aiAnalysis && (
          <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-900 flex items-center mb-2">✨ AI Triage Analysis</h3>
            <p className="text-sm text-purple-800 mb-2">{exc.aiAnalysis.probableRootCause}</p>
            <div className="font-medium text-sm text-purple-900 mt-3">Recommended Action:</div>
            <div className="text-sm text-purple-700">{exc.aiAnalysis.recommendedAction}</div>
          </div>
        )}

        {/* Evidence Viewers */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Diagnostic Evidence</h3>
          
          <div className="bg-gray-100 p-4 rounded mb-4 font-mono text-sm text-gray-700 overflow-x-auto">
            <div className="font-semibold mb-2">Source: {exc.sourceType} ({exc.sourceId})</div>
            <pre>{JSON.stringify(exc.metadata, null, 2)}</pre>
          </div>
        </div>
      </div>

      {/* Right panel: Operations and Resolutions */}
      <div className="w-1/3 bg-gray-50 p-6 overflow-y-auto flex flex-col">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Operations</h3>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">SLA Status</div>
          <div className="text-2xl font-bold text-red-600">
            {new Date(exc.dueAt).toLocaleTimeString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Deadline approaching</div>
        </div>

        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-4">Remediation Actions</h3>
        
        <div className="flex flex-col space-y-3">
          <button 
            disabled={resolving}
            onClick={() => handleResolve('WORKFLOW_RESUMED')}
            className="w-full py-2 bg-blue-600 text-white rounded font-medium shadow hover:bg-blue-700 transition"
          >
            Resume Workflow
          </button>
          <button 
            disabled={resolving}
            onClick={() => handleResolve('DATA_CORRECTED')}
            className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition"
          >
            Data Corrected Manually
          </button>
          <button 
            disabled={resolving}
            onClick={() => handleResolve('CANCELLED')}
            className="w-full py-2 bg-white border border-red-300 text-red-600 rounded font-medium hover:bg-red-50 transition"
          >
            Cancel / Terminate Process
          </button>
        </div>

        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-8">Audit Trail</h3>
        <div className="flex-1 bg-white border border-gray-200 rounded p-4 text-sm text-gray-600">
          <ul className="space-y-4">
            {exc.history?.map((h: any) => (
              <li key={h.id} className="relative">
                <span className="font-medium text-gray-900">{h.action}</span>
                <p className="text-xs text-gray-500 mt-1">{new Date(h.createdAt).toLocaleString()} by {h.actorType}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
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
