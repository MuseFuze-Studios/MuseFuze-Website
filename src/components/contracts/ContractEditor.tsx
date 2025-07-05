import React, { useState } from 'react';
import { contractAPI } from '../../services/api';

const ContractEditor: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const save = async () => {
    try {
      await contractAPI.createTemplate({ title, content });
      setMessage('Template saved');
      setTitle('');
      setContent('');
    } catch (err) {
      setMessage('Failed to save template');
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="font-orbitron text-2xl font-bold">Create Template</h2>
      {message && <p className="text-gray-400">{message}</p>}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
      />
      <textarea
        placeholder="HTML content with {{firstName}} etc"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
      />
      <button onClick={save} className="px-6 py-2 bg-gradient-to-r from-electric to-neon text-black rounded-lg font-rajdhani font-bold">
        Save Template
      </button>
    </div>
  );
};

export default ContractEditor;
