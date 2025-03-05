const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

// Verify if document exists
router.get('/:id/verify', async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.status(200).json({ message: 'Document exists' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get document by ID
router.get('/:id', async (req, res) => {
    console.log('Requested document ID:', req.params.id);
    try {
        const document = await Document.findById(req.params.id);
        console.log('Database query result:', document);
        
        if (!document) {
            console.log('No document found for ID:', req.params.id);
            return res.status(404).json({ message: 'Document not found' });
        }

        console.log('Document found - ID:', document._id);
        res.json({
            id: document._id,
            title: document.title,
            content: document.content,
            contentType: document.contentType,
            version: document.version
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
});

// Create new document
router.post('/', async (req, res) => {
    try {
        console.log('Creating new document');
        const { id, title, content, contentType } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Document ID is required' });
        }

        const document = new Document({
            _id: id,
            title: title || 'Untitled Document',
            content: content || '',
            contentType: contentType || 'text'
        });

        await document.save();
        console.log('Document created:', document.title);

        res.status(201).json({
            message: 'Document created successfully',
            document: {
                id: document._id,
                title: document.title,
                content: document.content,
                contentType: document.contentType
            }
        });
    } catch (error) {
        console.error('Error creating document:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Document with this ID already exists'
            });
        }

        res.status(500).json({
            message: 'Error creating document',
            error: error.message
        });
    }
});

// Update document
router.post('/:id', async (req, res) => {
    try {
        console.log('Updating document:', req.params.id);
        const { content, version } = req.body;
        const document = await Document.findById(req.params.id);
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        document.content = content;
        document.version = version;
        await document.save();
        
        console.log('Document updated:', document.title);
        res.json({
            id: document._id,
            title: document.title,
            content: document.content,
            version: document.version
        });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({
            message: 'Error updating document',
            error: error.message
        });
    }
});

module.exports = router; 