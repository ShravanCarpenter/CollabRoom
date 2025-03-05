import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';

const JoinDocumentEditing = () => {
    const navigate = useNavigate();
    const [documentId, setDocumentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isValidDocumentId = (id) => {
        // Support both MongoDB 24-char hex and UUIDv4 formats
        const idRegex = /^([0-9a-f]{24}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;
        return idRegex.test(id);
    };

    const extractDocumentId = (input) => {
        const cleanInput = input.trim();
        
        // Attempt to parse as URL and extract ID
        try {
            const url = new URL(cleanInput.startsWith('http') ? cleanInput : `http://${cleanInput}`);
            const pathParts = url.pathname.split('/');
            const possibleId = pathParts.find(part => isValidDocumentId(part));
            return possibleId || cleanInput;
        } catch {
            // If not a URL, attempt to match ID directly
            const idMatch = cleanInput.match(/[0-9a-f]{24}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
            return idMatch ? idMatch[0] : cleanInput;
        }
    };

    const handleJoin = async () => {
        setError('');
        const rawInput = documentId.trim();
        
        if (!rawInput) {
            setError('Please enter a document ID or sharing link');
            return;
        }

        setLoading(true);

        try {
            const extractedId = extractDocumentId(rawInput);
            console.log('Extracted ID:', extractedId); // Debugging

            if (!isValidDocumentId(extractedId)) {
                throw new Error(`Invalid document ID format. Valid formats:
                    • 24-character ID (e.g. 507f191e810c19729de860ea)
                    • UUID (e.g. 550e8400-e29b-41d4-a716-446655440000)`);
            }

            // Verify document exists
            const verifyRes = await fetch(`http://localhost:3000/api/documents/${extractedId}/verify`);
            if (!verifyRes.ok) {
                const error = await verifyRes.json();
                throw new Error(error.message || 'Document not found');
            }

            navigate(`/editor/${extractedId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePaste = (event) => {
        const pastedContent = event.clipboardData.getData('text');
        setDocumentId(pastedContent);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5'
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 500,
                    width: '90%',
                }}
            >
                <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom
                    sx={{ textAlign: 'center', mb: 3 }}
                >
                    Join Document Editing
                </Typography>

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter the document ID or paste the sharing link to join the editing session
                </Typography>

                <TextField
                    fullWidth
                    label="Document ID or Link"
                    variant="outlined"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Enter document ID or paste sharing link"
                    sx={{ mb: 2 }}
                    disabled={loading}
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleJoin}
                    disabled={loading}
                    sx={{ mb: 2 }}
                >
                    {loading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        'Join Document'
                    )}
                </Button>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Need to create a new document instead?{' '}
                    <Button 
                        color="primary"
                        onClick={() => navigate('/create')}
                        sx={{ textTransform: 'none' }}
                    >
                        Create Document
                    </Button>
                </Typography>
            </Paper>
        </Box>
    );
};

export default JoinDocumentEditing;
