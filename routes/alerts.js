const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const Food = require('../models/Food');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID
});

// Get all alerts for a user
router.get('/:userId', async (req, res) => {
    try {
        const foods = await Food.find({ userId: req.params.userId });
        const alerts = foods.filter(food => {
            const daysUntilExpiry = Math.ceil((food.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
        });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Send push notification for expiring items
router.post('/notify', async (req, res) => {
    try {
        const { userId, fcmToken } = req.body;
        const foods = await Food.find({ userId });
        const expiringFoods = foods.filter(food => {
            const daysUntilExpiry = Math.ceil((food.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
        });

        if (expiringFoods.length > 0) {
            const message = {
                notification: {
                    title: 'Food Expiring Soon!',
                    body: `You have ${expiringFoods.length} items expiring soon.`
                },
                token: fcmToken
            };

            await admin.messaging().send(message);
        }

        res.json({ message: 'Notifications sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;