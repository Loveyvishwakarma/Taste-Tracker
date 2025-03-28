// Load available ingredients and recipes when the recipe page becomes active
document.querySelector('[data-page="recipe"]').addEventListener('click', async () => {
    await loadAvailableIngredients();
    await loadRecipeRecommendations();
});

// Load available ingredients
async function loadAvailableIngredients() {
    try {
        const response = await fetch('/api/food?userId=1'); // Replace with actual user ID
        const foods = await response.json();
        
        const ingredientsList = document.querySelector('.ingredients-list');
        ingredientsList.innerHTML = `
            <h3>Available Ingredients</h3>
            <ul>
                ${foods.map(food => `
                    <li>
                        <input type="checkbox" value="${food.name}" id="ingredient-${food._id}">
                        <label for="ingredient-${food._id}">${food.name}</label>
                    </li>
                `).join('')}
            </ul>
            <button onclick="loadRecipeRecommendations()">Find Recipes</button>
        `;
    } catch (error) {
        console.error('Error loading ingredients:', error);
    }
}

// Load recipe recommendations
async function loadRecipeRecommendations() {
    const selectedIngredients = Array.from(document.querySelectorAll('.ingredients-list input:checked'))
        .map(input => input.value);

    if (selectedIngredients.length === 0) {
        alert('Please select at least one ingredient');
        return;
    }

    try {
        const response = await fetch(`/api/recipes/recommendations?ingredients=${selectedIngredients.join(',')}`);
        const recipes = await response.json();
        
        const recipeResults = document.querySelector('.recipe-results');
        recipeResults.innerHTML = recipes.map(recipe => `
            <div class="recipe-card">
                <img src="${recipe.image}" alt="${recipe.title}">
                <h3>${recipe.title}</h3>
                <p>Used Ingredients: ${recipe.usedIngredientCount}</p>
                <p>Missing Ingredients: ${recipe.missedIngredientCount}</p>
                <button onclick="viewRecipeDetails(${recipe.id})">View Recipe</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading recipes:', error);
        alert('Error loading recipes. Please try again.');
    }
}

// View recipe details
async function viewRecipeDetails(recipeId) {
    try {
        const response = await fetch(`/api/recipes/${recipeId}`);
        const recipe = await response.json();
        
        // Create modal for recipe details
        const modal = document.createElement('div');
        modal.className = 'recipe-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${recipe.title}</h2>
                <img src="${recipe.image}" alt="${recipe.title}">
                <div class="recipe-info">
                    <h3>Ingredients</h3>
                    <ul>
                        ${recipe.extendedIngredients.map(ingredient => `
                            <li>${ingredient.amount} ${ingredient.unit} ${ingredient.name}</li>
                        `).join('')}
                    </ul>
                    <h3>Instructions</h3>
                    <ol>
                        ${recipe.analyzedInstructions[0].steps.map(step => `
                            <li>${step.step}</li>
                        `).join('')}
                    </ol>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => modal.remove();
        
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.remove();
            }
        };
    } catch (error) {
        console.error('Error loading recipe details:', error);
        alert('Error loading recipe details. Please try again.');
    }
}

// Add styles for recipe modal
const style = document.createElement('style');
style.textContent = `
    .recipe-modal {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 1000;
    }
    
    .modal-content {
        position: relative;
        background-color: var(--card-background);
        margin: 5% auto;
        padding: 20px;
        width: 80%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        border-radius: 8px;
    }
    
    .close {
        position: absolute;
        right: 20px;
        top: 10px;
        font-size: 28px;
        cursor: pointer;
    }
    
    .recipe-info {
        margin-top: 20px;
    }
    
    .recipe-info ul, .recipe-info ol {
        margin-left: 20px;
    }
    
    .recipe-info li {
        margin: 10px 0;
    }
`;
document.head.appendChild(style); 