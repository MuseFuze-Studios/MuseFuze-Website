import React, { useEffect, useState } from 'react';
import { contractAPI } from '../../services/api';
import ContractDiff from './ContractDiff';

interface Props {
  contract: { id: number; title: string; content: string };
  onDone: () => void;
}

const SignContract: React.FC<Props> = ({ contract, onDone }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [diff, setDiff] = useState<{ old: string; new: string } | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await contractAPI.getDiff(contract.id);
        if (res.data.old) setDiff(res.data);
      } catch {}
    })();
  }, [contract.id]);

  const handleSign = async () => {
    setLoading(true);
    setError('');
    try {
      await contractAPI.signContract(contract.id, name);
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sign contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="font-orbitron text-2xl font-bold mb-4">{contract.title}</h2>
      {diff && (
        <button
          onClick={() => setShowDiff(!showDiff)}
          className="text-sm text-blue-400 underline"
        >
          {showDiff ? 'View Contract' : 'View Changes'}
        </button>
      )}
      {showDiff && diff ? (
        <ContractDiff oldText={diff.old} newText={diff.new} />
      ) : (
        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contract.content }} />
      )}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Type your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleSign}
          disabled={loading || !name}
          className="px-6 py-2 bg-gradient-to-r from-electric to-neon text-black rounded-lg font-rajdhani font-bold disabled:opacity-50"
        >
          {loading ? 'Signing...' : 'Sign Contract'}
        </button>
        <button onClick={onDone} className="ml-4 text-gray-400" disabled={loading}>Cancel</button>
      </div>
    </div>
  );
};

export default SignContract;
