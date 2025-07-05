import React, { useState } from 'react';
import { contractAPI } from '../../services/api';

interface Contract {
  id: number;
  title: string;
  content: string;
  status: string;
  signed_at: string | null;
  signed_name?: string;
  signed_ip?: string;
  is_active: boolean;
}

interface Props {
  contract: Contract;
  onClose: () => void;
}

const ViewContract: React.FC<Props> = ({ contract, onClose }) => {
  const [type, setType] = useState('amend');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await contractAPI.requestChange({ contractId: contract.id, type, message });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="font-orbitron text-2xl font-bold mb-4">{contract.title}</h2>
      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contract.content }} />
      {contract.status === 'signed' && (
        <div className="text-sm text-gray-400 space-y-1">
          <div>Signed by: {contract.signed_name}</div>
          {contract.signed_at && <div>Signed at: {new Date(contract.signed_at).toLocaleString()}</div>}
          {contract.signed_ip && <div>IP: {contract.signed_ip}</div>}
        </div>
      )}
      {contract.is_active ? (
        sent ? (
          <p className="text-green-400">Request submitted.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <select value={type} onChange={e => setType(e.target.value)} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg">
                <option value="amend">Request Amendment</option>
                <option value="appeal">Appeal</option>
                <option value="leave">Leave Contract</option>
              </select>
              <button onClick={() => setSent(false)} className="hidden" />
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full h-24 p-2 bg-gray-800 border border-gray-700 rounded-lg"
              placeholder="Additional details (optional)"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={submit} disabled={loading} className="px-6 py-2 bg-gradient-to-r from-electric to-neon text-black rounded-lg font-rajdhani font-bold disabled:opacity-50">
              {loading ? 'Sending...' : 'Submit Request'}
            </button>
          </div>
        )
      ) : (
        <p className="text-gray-400">This contract is inactive.</p>
      )}
      <button onClick={onClose} className="text-gray-400 ml-4">Close</button>
    </div>
  );
};

export default ViewContract;
