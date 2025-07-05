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
}

const ContractRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const res = await contractAPI.getRequests(filter !== 'all' ? filter : undefined);
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load requests', err);
    }
  };

  const resolve = async (id: number) => {
    const outcome = window.prompt('Outcome (approved/denied)', 'approved') || 'approved';
    const notes = window.prompt('Notes', '') || '';
    try {
      await contractAPI.resolveRequest(id, { outcome, notes });
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
        onChange={e => setFilter(e.target.value)}
        className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg"
      >
        <option value="all">All</option>
        <option value="leave">Leave</option>
        <option value="amend">Amend</option>
        <option value="appeal">Appeal</option>
      </select>
      <ul className="space-y-4">
        {requests.map(r => (
          <li key={r.id} className="border border-gray-700 rounded-lg p-4">
            <div className="font-rajdhani font-bold text-white">{r.title}</div>
            <div className="text-sm text-gray-400">
              {r.firstName} {r.lastName} - {r.type}
            </div>
            {r.message && <p className="mt-2 text-gray-300">{r.message}</p>}
            <div className="flex justify-between items-end mt-2">
              <span className="text-xs text-gray-500">
                {new Date(r.created_at).toLocaleString()}
              </span>
              <button
                onClick={() => resolve(r.id)}
                className="text-sm text-blue-400 hover:underline"
              >
                Resolve
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContractRequests;
