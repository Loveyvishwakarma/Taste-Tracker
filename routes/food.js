const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Get all food items
router.get('/', async (req, res) => {
    try {
        const foods = await Food.find({ userId: req.query.userId });
        res.json(foods);
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ message: error.message });
    }
});

// Add new food item
router.post('/', upload.single('image'), async (req, res) => {
    try {
        console.log('Received food item data:', req.body);
        console.log('Received file:', req.file);

        if (!req.body.name || !req.body.expiryDate || !req.body.userId) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: {
                    name: req.body.name,
                    expiryDate: req.body.expiryDate,
                    userId: req.body.userId
                }
            });
        }

        const food = new Food({
            name: req.body.name,
            expiryDate: new Date(req.body.expiryDate),
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
            userId: req.body.userId
        });

        const newFood = await food.save();
        console.log('Successfully saved food item:', newFood);
        res.status(201).json(newFood);
    } catch (error) {
        console.error('Error saving food item:', error);
        res.status(400).json({ 
            message: error.message,
            stack: error.stack
        });
    }
});

// Delete food item
router.delete('/:id', async (req, res) => {
    try {
        const deletedFood = await Food.findByIdAndDelete(req.params.id);
        if (!deletedFood) {
            return res.status(404).json({ message: 'Food item not found' });
        }
        res.json({ message: 'Food item deleted', deletedFood });
    } catch (error) {
        console.error('Error deleting food item:', error);
        res.status(500).json({ message: error.message });
    }
});

// OCR endpoint
router.post('/scan', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const worker = await createWorker();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(req.file.path);
        await worker.terminate();
        res.json({ text });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;