import React, { useState } from 'react';
import axios from 'axios';
import './Form.css';

const UploadForm = ({ onResult }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onResult(response.data);
      setFile(null);
      // Reset file input
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading file');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Upload PDF Document</h2>
      <p>Upload a PDF file to store its hash value on the blockchain</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="file-upload">Select PDF File:</label>
          <input 
            type="file" 
            id="file-upload" 
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading || !file}
        >
          {loading ? 'Uploading...' : 'Upload and Store Hash'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;