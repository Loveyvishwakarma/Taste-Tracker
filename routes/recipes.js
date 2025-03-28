const express = require('express');
const router = express.Router();
const axios = require('axios');

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

// Get recipe recommendations based on ingredients
router.get('/recommendations', async (req, res) => {
    try {
        const ingredients = req.query.ingredients;
        const response = await axios.get(`${SPOONACULAR_BASE_URL}/findByIngredients`, {
            params: {
                apiKey: SPOONACULAR_API_KEY,
                ingredients: ingredients,
                number: 5,
                ranking: 2,
                ignorePantry: true
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get detailed recipe information
router.get('/:id', async (req, res) => {
    try {
        const response = await axios.get(`${SPOONACULAR_BASE_URL}/${req.params.id}/information`, {
            params: {
                apiKey: SPOONACULAR_API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 