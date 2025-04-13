import React, { useState } from 'react';
import './App.css';
import UploadForm from './components/UploadForm';
import VerifyForm from './components/VerifyForm';
import ResultDisplay from './components/ResultDisplay';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [result, setResult] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setResult(null);
  };

  const handleResult = (data) => {
    setResult(data);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Blockchain PDF Verification System</h1>
        <p>Store and verify PDF document hashes using blockchain and IPFS</p>
      </header>
      <main className="App-main">
        <div className="info-box">
          <h3>How It Works</h3>
          <p>This system provides secure document integrity verification using both blockchain and IPFS:</p>
          <ul>
            <li><strong>Document Storage:</strong> Files are stored on IPFS (InterPlanetary File System), a decentralized storage network.</li>
            <li><strong>Verification:</strong> Document hash values are stored on the blockchain, ensuring tamper-proof integrity checks.</li>
            <li><strong>Access Control:</strong> Documents can be accessed via IPFS using their unique content identifier (CID).</li>
          </ul>
        </div>
        
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => handleTabChange('upload')}
          >
            Upload Document
          </button>
          <button 
            className={`tab-button ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => handleTabChange('verify')}
          >
            Verify Document
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'upload' ? (
            <UploadForm onResult={handleResult} />
          ) : (
            <VerifyForm onResult={handleResult} />
          )}
        </div>
        
        {result && <ResultDisplay result={result} type={activeTab} />}
      </main>
      <footer className="App-footer">
        <p>Blockchain-IPFS PDF Verification System &copy; 2025</p>
      </footer>
    </div>
  );
}

export default App;