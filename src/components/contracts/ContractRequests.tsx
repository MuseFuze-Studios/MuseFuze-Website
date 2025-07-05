import React, { useEffect, useState } from 'react';
import { contractAPI } from '../../services/api';

interface Request {
  id: number;
  type: string;
  message: string;
  created_at: string;
  contract_id: number;
  user_id: number;
  firstName: string;
  lastName: string;
  title: string;
  outcome?: string;
  notes?: string;
  content?: string;
  signed_name?: string;
  signed_at?: string;
  signed_ip?: string;
  assigned_by?: number;
}

const typeLabels: Record<string, string> = {
  amend: 'Amendment Request',
  appeal: 'Appeal',
  leave: 'Leave Contract',
};

const ContractRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState<Request | null>(null);
  const [reason, setReason] = useState('');
  const [newContent, setNewContent] = useState('');

  const load = async () => {
    try {
      const res = await contractAPI.getRequests(filter !== 'all' ? filter : undefined);
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load requests', err);
    }
  };

  const open = async (id: number) => {
    try {
      const res = await contractAPI.getRequest(id);
      setActive(res.data);
      setNewContent(res.data.content || '');
      setReason('');
    } catch (err) {
      console.error('Failed to load request', err);
    }
  };

  const resolve = async (outcome: string) => {
    if (!active) return;
    try {
      await contractAPI.resolveRequest(active.id, { outcome, notes: reason, newContent: outcome === 'approved' && active.type === 'amend' ? newContent : undefined });
      setActive(null);
      await load();
    } catch (err) {
      console.error('Failed to resolve request', err);
    }
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <div className="p-6 space-y-4">
      <h2 className="font-orbitron text-2xl font-bold mb-4">Contract Requests</h2>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg"
      >
        <option value="all">All</option>
        <option value="leave">Leave Requests</option>
        <option value="amend">Amendments</option>
        <option value="appeal">Appeals</option>
      </select>
      <ul className="space-y-4">
        {requests.map(r => (
          <li key={r.id} className="border border-gray-700 rounded-lg p-4">
            <div className="font-rajdhani font-bold text-white">{r.title}</div>
            <div className="text-sm text-gray-400">
              {r.firstName} {r.lastName} - {typeLabels[r.type] || r.type}
            </div>
            {r.message && <p className="mt-2 text-gray-300">{r.message}</p>}
            <div className="flex justify-between items-end mt-2">
              <span className="text-xs text-gray-500">
                {new Date(r.created_at).toLocaleString()}
              </span>
              <button
                onClick={() => open(r.id)}
                className="text-sm text-blue-400 hover:underline"
              >
                Review
              </button>
            </div>
          </li>
        ))}
      </ul>
      {active && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full space-y-4 overflow-y-auto max-h-full">
            <h3 className="font-rajdhani text-xl font-bold">
              Review {typeLabels[active.type] || active.type} - {active.title}
            </h3>
            <div className="text-sm text-gray-400 space-y-1">
              <div>Request: {typeLabels[active.type] || active.type}</div>
              {active.signed_name && <div>Signed by: {active.signed_name}</div>}
              {active.signed_at && <div>Signed at: {new Date(active.signed_at).toLocaleString()}</div>}
              {active.signed_ip && <div>IP: {active.signed_ip}</div>}
            </div>
            {active.message && (
              <div className="border border-gray-700 p-2 rounded-md bg-gray-800 text-sm text-gray-200 space-y-1">
                <div className="font-semibold text-gray-300">User Reasoning</div>
                <div className="whitespace-pre-wrap">{active.message}</div>
              </div>
            )}
            <div className="space-y-1">
              <div className="font-semibold text-gray-300 text-sm">Current Contract</div>
              <div className="prose prose-invert max-w-none overflow-y-auto max-h-60 border border-gray-700 p-2" dangerouslySetInnerHTML={{ __html: active.content || '' }} />
            </div>
            {active.type === 'amend' && (
              <div className="space-y-1">
                <div className="font-semibold text-gray-300 text-sm">Proposed Amendment</div>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full h-32 p-2 bg-gray-800 border border-gray-700 rounded-lg"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="font-semibold text-gray-300 text-sm" htmlFor="resolution">Resolution Notes</label>
              <textarea
                id="resolution"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-24 p-2 bg-gray-800 border border-gray-700 rounded-lg"
                placeholder="Reason for approval or denial"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => resolve('approved')} className="px-4 py-2 bg-green-600 rounded-lg">Approve</button>
              <button onClick={() => resolve('denied')} className="px-4 py-2 bg-red-600 rounded-lg">Deny</button>
              <button onClick={() => setActive(null)} className="px-4 py-2 bg-gray-700 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractRequests;
