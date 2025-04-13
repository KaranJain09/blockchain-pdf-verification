// Updated ResultDisplay.js to show IPFS information
import React from 'react';
import './ResultDisplay.css';

const ResultDisplay = ({ result, type }) => {
  if (!result) return null;

  return (
    <div className={`result-container ${type === 'verify' ? result.verified ? 'verified' : 'not-verified' : ''}`}>
      <h2>{type === 'upload' ? 'Upload Result' : 'Verification Result'}</h2>
      
      {type === 'upload' && (
        <>
          <div className="result-item">
            <strong>Status:</strong> 
            <span className="success">Successfully stored on blockchain and IPFS!</span>
          </div>
          <div className="result-item">
            <strong>File Name:</strong> {result.fileName}
          </div>
          <div className="result-item">
            <strong>File Hash:</strong> 
            <div className="hash-value">{result.fileHash}</div>
          </div>
          <div className="result-item">
            <strong>IPFS CID:</strong> 
            <div className="hash-value">{result.ipfsCid}</div>
          </div>
          <div className="result-item">
            <strong>IPFS Link:</strong> 
            <a href={`http://localhost:8080/ipfs/${result.ipfsCid}`} target="_blank" rel="noopener noreferrer" className="ipfs-link">
              View on IPFS Gateway
            </a>
          </div>
          <div className="result-item">
            <strong>Download:</strong> 
            <a href={`http://localhost:5000/api/document/${result.ipfsCid}/${encodeURIComponent(result.fileName)}`} 
               download={result.fileName} 
               className="download-link">
              Download Document
            </a>
          </div>
          <div className="result-item">
            <strong>Transaction Hash:</strong> 
            <div className="hash-value">{result.transactionHash}</div>
          </div>
        </>
      )}
      
      {type === 'verify' && (
        <>
          <div className="result-item">
            <strong>Status:</strong> 
            <span className={result.verified ? 'success' : 'error'}>
              {result.verified ? 'Verified ✓' : 'Not Verified ✗'}
            </span>
          </div>
          <div className="result-item">
            <strong>Message:</strong> {result.message}
          </div>
          <div className="result-item">
            <strong>File Name:</strong> {result.fileName}
          </div>
          <div className="result-item">
            <strong>Current Hash:</strong> 
            <div className="hash-value">{result.currentHash}</div>
          </div>
          <div className="result-item">
            <strong>Stored Hash:</strong> 
            <div className="hash-value">{result.storedHash}</div>
          </div>
          {result.ipfsCid && (
            <>
              <div className="result-item">
                <strong>IPFS CID:</strong> 
                <div className="hash-value">{result.ipfsCid}</div>
              </div>
              <div className="result-item">
                <strong>IPFS Link:</strong> 
                <a href={`http://localhost:8080/ipfs/${result.ipfsCid}`} target="_blank" rel="noopener noreferrer" className="ipfs-link">
                  View Original on IPFS Gateway
                </a>
              </div>
              <div className="result-item">
                <strong>Download:</strong> 
                <a href={`http://localhost:5000/api/document/${result.ipfsCid}/${encodeURIComponent(result.fileName)}`} 
                   download={result.fileName} 
                   className="download-link">
                  Download Original Document
                </a>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ResultDisplay;