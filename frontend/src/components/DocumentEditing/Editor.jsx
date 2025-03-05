import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import mammoth from 'mammoth';
import logo from '../../assets/CollabRoom logo.png';
import './Document.css';

import { 
    AppBar, Toolbar, IconButton, Typography, Box, 
    Tooltip, Badge, Drawer, List, 
    ListItem, ListItemText, ListItemIcon, Divider,
    CircularProgress, Alert, Button, ButtonGroup
} from '@mui/material';
import {
    Save, People, GetApp, ContentCopy, Person,
    Add, ViewAgenda, Dashboard
} from '@mui/icons-material';

const socket = io('http://localhost:3000');

const Editor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [docData, setDocData] = useState(null);
    const [users, setUsers] = useState([]);
    const [version, setVersion] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUsers, setShowUsers] = useState(false);
    const quillRef = useRef(null);

    // Quill editor modules configuration
    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ],
        },
        history: {
            delay: 2000,
            maxStack: 500,
            userOnly: true
        }
    };

    const handleWordConversion = async (base64Content) => {
        try {
            // Convert Base64 to ArrayBuffer
            const binaryString = atob(base64Content);
            const buffer = new ArrayBuffer(binaryString.length);
            const view = new Uint8Array(buffer);
            for (let i = 0; i < binaryString.length; i++) {
                view[i] = binaryString.charCodeAt(i);
            }

            // Verify the document structure
            const { headers } = await mammoth.extractRawText({ arrayBuffer: buffer });
            if (!headers || !headers.includes('Content-Type: application/vnd.openxmlformats')) {
                throw new Error('Invalid .docx file structure');
            }

            // Convert to HTML
            const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
            return result.value;
        } catch (error) {
            console.error('Word conversion error:', error);
            throw new Error('Failed to convert Word document. Please ensure: \n1. It is a .docx file \n2. The file is not corrupted \n3. It was created in Microsoft Word');
        }
    };

    // Load document content
    useEffect(() => {
        console.log('Received document ID from URL:', id);
        if (!id) {
            console.error('Missing document ID in URL');
            setError('Invalid document URL');
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        const loadDocument = async () => {
            console.log('Attempting to load document with ID:', id);
            try {
                const response = await fetch(`http://localhost:3000/api/documents/${id}`);
                console.log('Fetch response status:', response.status);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    throw new Error(errorData.message || 'Document not found');
                }

                const doc = await response.json();
                console.log('Received document data:', doc);
                console.log('Document content type:', doc.contentType);
                
                let contentToDisplay = doc.content || '';
                
                // Handle Word documents
                if (doc.contentType === 'document') {
                    try {
                        const htmlContent = await handleWordConversion(doc.content);
                        contentToDisplay = htmlContent;
                    } catch (conversionError) {
                        console.error('Document conversion failed:', conversionError);
                        throw new Error('Failed to convert Word document. Please ensure it is a valid .docx file');
                    }
                }

                if (isMounted) {
                    setDocData(doc);
                    setContent(contentToDisplay);
                    setVersion(doc.version || 1);
                    setError(null);
                }
            } catch (error) {
                console.error('Full error details:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadDocument();
        return () => { isMounted = false; };
    }, [id]);

    // Socket.io setup
    useEffect(() => {
        socket.emit('join-document', id);

        socket.on('document-change', (newContent) => {
            setContent(newContent);
        });

        socket.on('users-update', (connectedUsers) => {
            setUsers(connectedUsers);
        });

        return () => {
            socket.off('document-change');
            socket.off('users-update');
            socket.emit('leave-document', id);
        };
    }, [id]);

    // Handle content changes
    const handleChange = (newContent) => {
        setContent(newContent);
        socket.emit('document-change', { id, content: newContent });
        
        // Auto-save logic
        clearTimeout(window.saveTimeout);
        window.saveTimeout = setTimeout(saveDocument, 2000);
    };

    // Save document
    const saveDocument = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`http://localhost:3000/api/documents/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, version }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to save document');
            }
            
            setVersion(prev => prev + 1);
        } catch (error) {
            console.error('Error saving document:', error);
            alert('Error saving document');
        } finally {
            setIsSaving(false);
        }
    };

    // Export document
    const exportDocument = () => {
        if (!docData) return;

        try {
            const content = quillRef.current.getEditor().root.innerHTML;
            const blob = new Blob([content], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            
            // Create temporary link
            const tempLink = document.createElement('a');
            tempLink.style.display = 'none';
            tempLink.href = url;
            tempLink.download = `${docData.title || 'collab-document'}.doc`;
            
            // Append to DOM and trigger download
            document.body.appendChild(tempLink);
            tempLink.click();
            
            // Cleanup
            document.body.removeChild(tempLink);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export Error: ${error.message}`);
        }
    };

    const copyDocumentId = () => {
        navigator.clipboard.writeText(id)
            .then(() => alert('Document ID copied to clipboard!'))
            .catch(() => alert('Failed to copy ID'));
    };

    // Show error state
    if (error) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                gap: 2
            }}>
                <Alert severity="error">{error}</Alert>
                <IconButton onClick={() => navigate('/')}>
                    Go Back
                </IconButton>
            </Box>
        );
    }

    // Show loading state
    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                gap: 2
            }}>
                <CircularProgress />
                <Typography>Loading document...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AppBar position="static">
                <Toolbar>
                    <img src={logo} alt="CollabRoom Logo" style={{ height: 30, marginRight: 10 }} />

                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6">
                            {docData?.title || 'Document Editor'}
                        </Typography>
                        <Tooltip title="Click to copy document ID">
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.8 }
                                }}
                                onClick={copyDocumentId}
                            >
                                <Typography variant="caption" sx={{ 
                                    fontFamily: 'monospace',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    px: 1,
                                    borderRadius: 1
                                }}>
                                    {id}
                                </Typography>
                                <ContentCopy fontSize="small" />
                            </Box>
                        </Tooltip>
                    </Box>
                    <Tooltip title={isSaving ? 'Saving...' : 'Save'}>
                        <span>
                            <IconButton 
                                color="inherit" 
                                onClick={saveDocument}
                                disabled={isSaving}
                            >
                                {isSaving ? <CircularProgress size={24} color="inherit" /> : <Save />}
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Export">
                        <IconButton color="inherit" onClick={exportDocument}>
                            <GetApp />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Users">
                        <IconButton color="inherit" onClick={() => setShowUsers(!showUsers)}>
                            <Badge badgeContent={users.length} color="secondary">
                                <People />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Button
                        color="inherit"
                        startIcon={<Dashboard />}
                        onClick={() => navigate('/dashboard')}
                        sx={{ mr: 2 }}
                    >
                        Dashboard
                    </Button>
                </Toolbar>
            </AppBar>

            {docData && (
                <Box sx={{ flexGrow: 1, padding: 2 }}>
                    <ReactQuill
                        ref={quillRef}
                        value={content}
                        onChange={handleChange}
                        modules={modules}
                        theme="snow"
                        style={{ height: 'calc(100vh - 130px)' }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default Editor;