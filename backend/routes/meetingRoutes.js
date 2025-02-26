const express = require('express');
const Meeting = require('../models/Meeting');
const { verifyToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Create meeting
router.post('/create', verifyToken, async (req, res) => {
    try {
        // Log the entire request body
        console.log('Received request body:', JSON.stringify(req.body, null, 2));

        const { meetingId, meetingName, host, type } = req.body;

        // Detailed validation with specific error messages
        const missingFields = [];
        const validationResults = {};

        // Check each field and track validation results
        validationResults.meetingId = !!meetingId;
        validationResults.meetingName = !!meetingName;
        validationResults.hostName = host && !!host.name;
        validationResults.hostEmail = host && !!host.email;
        validationResults.type = !!type;

        if (!meetingId) missingFields.push('meetingId');
        if (!meetingName) missingFields.push('meetingName');
        if (!host || !host.name) missingFields.push('host.name');
        if (!host || !host.email) missingFields.push('host.email');
        if (!type) missingFields.push('type');

        // Log validation results
        console.log('Validation results:', validationResults);

        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`,
                validationResults,
                missingFields
            });
        }

        // Create new meeting document
        const newMeeting = new Meeting({
            meetingId,
            meetingName,
            host: {
                userId: req.user.id,
                name: host.name,
                email: host.email
            },
            type,
            scheduledTime: req.body.scheduledTime || null
        });

        // Save to database
        const savedMeeting = await newMeeting.save();
        console.log('Meeting saved successfully:', savedMeeting);

        // Return success response
        res.status(201).json({
            success: true,
            meeting: savedMeeting
        });
    } catch (err) {
        console.error('Server error details:', err);

        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Meeting ID already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: err.message || 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? err.toString() : undefined
        });
    }
});

// Add participant to meeting
router.patch('/:meetingId/participants', verifyToken, async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });

        if (!meeting) {
            return res.status(404).json({ msg: 'Meeting not found' });
        }

        const participant = {
            userId: req.user.id,
            name: req.body.name,
            email: req.body.email,
            joinTime: new Date()
        };

        meeting.participants.push(participant);
        await meeting.save();

        res.json(meeting);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get meeting by ID
router.get('/get/:meetingId', async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        res.json({
            success: true,
            data: {
                meetingName: meeting.name,
                host: meeting.host,
                scheduledTime: meeting.scheduledTime,
                participants: meeting.participants,
                type: meeting.type
            }
        });
    } catch (err) {
        console.error('Error fetching meeting:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch meeting details'
        });
    }
});

router.get('/my-meetings', verifyToken, async (req, res) => {
    try {
        // Corrected query to match schema structure
        const meetings = await Meeting.find({ 'host.userId': req.user.id });
        
        // Return proper data
        res.status(200).json({
            success: true,
            meetings
        });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server Error' 
        });
    }
});


module.exports = router; 