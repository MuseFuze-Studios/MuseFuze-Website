import React, { useEffect, useState } from 'react';
import { contractAPI } from '../../services/api';
import SignContract from './SignContract';
import ViewContract from './ViewContract';

interface Contract {
  id: number;
  title: string;
  status: string;
  content: string;
  signed_at: string | null;
  signed_name?: string;
  is_active: boolean;
}

const MyContracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [active, setActive] = useState<Contract | null>(null);
  const [view, setView] = useState<Contract | null>(null);

  const load = async () => {
    try {
      const res = await contractAPI.getUserContracts();
      setContracts(res.data);
    } catch (err) {
      console.error('Failed to load contracts', err);
    }
  };

  useEffect(() => { load(); }, []);

  if (active) {
    return <SignContract contract={active} onDone={() => { setActive(null); load(); }} />;
  }
  
  if (view) {
    return <ViewContract contract={view} onClose={() => setView(null)} />;
  }
        
  return (
    <div className="space-y-6 p-6">
      <h2 className="font-orbitron text-2xl font-bold mb-4">My Contracts</h2>
      {contracts.length === 0 && <p className="text-gray-400">No contracts assigned.</p>}
      <ul className="space-y-4">
        {contracts.map(c => (
          <li key={c.id} className="border border-gray-700 rounded-xl p-4 flex justify-between items-center">
            <div>
              <h3 className="font-rajdhani font-bold text-white">{c.title}</h3>
              <p className="text-gray-400 text-sm">
                Status: {c.status} {c.is_active ? '' : '(inactive)'}
              </p>
            </div>
            {c.status === 'pending' && c.is_active ? (
              <button
                onClick={() => setActive(c)}
                className="px-4 py-2 bg-gradient-to-r from-electric to-neon text-black rounded-lg font-rajdhani font-bold"
              >
                Sign
              </button>
            ) : (
              <div className="flex flex-col items-end space-y-1">
                <button
                  onClick={() => setView(c)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg font-rajdhani"
                >
                  View
                </button>
                <span className="text-green-400 text-sm">Signed</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyContracts;
