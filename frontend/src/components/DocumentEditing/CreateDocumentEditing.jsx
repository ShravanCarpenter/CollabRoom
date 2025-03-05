import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './CreateDocumentEditing.css';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const CreateDocumentEditing = () => {
    const navigate = useNavigate();
    const [documentName, setDocumentName] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [createdDocumentId, setCreatedDocumentId] = useState(null);

    const handleFileContent = async (file) => {
        setLoading(true);
        try {
            // Validate file before processing
            if (!file) {
                throw new Error('No file selected');
            }

            if (file.size > MAX_FILE_SIZE) {
                throw new Error('File size exceeds 100MB limit');
            }

            const documentId = uuidv4();
            const reader = new FileReader();

            const base64Content = await new Promise((resolve, reject) => {
                reader.onload = (e) => {
                    try {
                        const arr = new Uint8Array(e.target.result);
                        
                        // Verify .docx file signature
                        if (arr.length < 4 || 
                            arr[0] !== 0x50 || 
                            arr[1] !== 0x4B || 
                            arr[2] !== 0x03 || 
                            arr[3] !== 0x04) {
                            throw new Error('Invalid file format. Please upload a valid .docx file');
                        }

                        // Convert to Base64 more efficiently
                        let binary = '';
                        for (let i = 0; i < arr.length; i++) {
                            binary += String.fromCharCode(arr[i]);
                        }
                        resolve(btoa(binary));
                    } catch (error) {
                        reject(error);
                    }
                };

                reader.onerror = (error) => {
                    reject(new Error(`File read error: ${error.target.error?.message || 'Unknown error'}`));
                };

                try {
                    reader.readAsArrayBuffer(file);
                } catch (error) {
                    reject(new Error(`Failed to read file: ${error.message}`));
                }
            });

            // Save to backend with error handling
            const response = await fetch('http://localhost:3000/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: documentId,
                    title: file.name,
                    content: base64Content,
                    contentType: 'document'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save document');
            }

            handleCreationSuccess(documentId);
        } catch (error) {
            console.error('File processing failed:', error);
            alert(`File upload error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreationSuccess = (documentId) => {
        setCreatedDocumentId(documentId);
        setLoading(false);
    };

    const copyToClipboard = () => {
        const link = `${window.location.origin}/editor/${createdDocumentId}`;
        navigator.clipboard.writeText(link)
            .then(() => alert('Link copied to clipboard!'))
            .catch(() => alert('Failed to copy link'));
    };

    const validateFile = (file) => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            alert('File size should be less than 100MB');
            return false;
        }

        // Check file extension
        const validExtensions = ['txt', 'doc', 'docx'];
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(extension)) {
            alert('Please upload a valid document file (.txt, .doc, or .docx)');
            return false;
        }
        return true;
    };

    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile);
            await handleFileContent(selectedFile);
        }
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile && validateFile(droppedFile)) {
            setFile(droppedFile);
            await handleFileContent(droppedFile);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const documentId = uuidv4();
            
            // Always create document even with empty content
            const response = await fetch('http://localhost:3000/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: documentId,
                    title: documentName || 'Untitled Document',
                    content: ''
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create document');
            }

            console.log('Navigating to editor with ID:', documentId);
            navigate(`/editor/${documentId}`);  // Explicit ID in URL
        } catch (error) {
            console.error('Error creating document:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-doc-container">
            {createdDocumentId ? (
                <div className="create-doc-success-section">
                    <h2>Document Created Successfully!</h2>
                    <div className="create-doc-link">
                        <input
                            type="text"
                            value={`${window.location.origin}/editor/${createdDocumentId}`}
                            readOnly
                        />
                        <button 
                            onClick={copyToClipboard}
                            className="create-doc-copy-button"
                        >
                            Copy Link
                        </button>
                    </div>
                    <div className="document-actions">
                        <button 
                            onClick={() => navigate(`/editor/${createdDocumentId}`)}
                            className="create-doc-button"
                        >
                            Open in Editor
                        </button>
                        <button
                            onClick={() => setCreatedDocumentId(null)}
                            className="create-doc-button"
                        >
                            Create Another
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <h1>Create Document</h1>
                    
                    <div className="create-doc-input-group">
                        <label className="create-doc-input-label">Document Name</label>
                        <input
                            type="text"
                            placeholder="Enter document name"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div 
                        className="create-doc-drop-zone"
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={(e) => e.preventDefault()}
                    >
                        {loading ? (
                            <p>Processing document...</p>
                        ) : (
                            <>
                                <p>Drag and drop a document here</p>
                                <p>OR</p>
                                <label className="create-doc-custom-file-input">
                                    Choose File
                                    <input
                                        type="file"
                                        accept=".txt,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="create-doc-file-input"
                                    />
                                </label>
                                {file && <p>Selected file: {file.name}</p>}
                            </>
                        )}
                    </div>

                    <button 
                        className="create-doc-button"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                Processing...
                                <div className="loading-spinner"></div>
                            </>
                        ) : file ? 'Upload and Edit Document' : 'Create New Document'}
                    </button>
                </>
            )}
        </div>
    );
};

export default CreateDocumentEditing;
