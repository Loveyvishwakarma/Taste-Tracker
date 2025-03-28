document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-links a');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPage) {
                    page.classList.add('active');
                }
            });
        });
    });

    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });

    // Load initial data
    loadFoodItems();
    loadAlerts();
});

// Load food items
async function loadFoodItems() {
    try {
        const response = await fetch('/api/food?userId=1'); // Replace with actual user ID
        const foods = await response.json();
        
        const foodList = document.querySelector('.food-list');
        foodList.innerHTML = foods.map(food => `
            <div class="food-card">
                ${food.imageUrl ? `<img src="${food.imageUrl}" alt="${food.name}">` : ''}
                <h3>${food.name}</h3>
                <p>Expires: ${new Date(food.expiryDate).toLocaleDateString()}</p>
                <button onclick="deleteFood('${food._id}')">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading food items:', error);
    }
}

// Delete food item
async function deleteFood(id) {
    try {
        await fetch(`/api/food/${id}`, {
            method: 'DELETE'
        });
        loadFoodItems();
    } catch (error) {
        console.error('Error deleting food item:', error);
    }
}

// Load alerts
async function loadAlerts() {
    try {
        const response = await fetch('/api/alerts/1'); // Replace with actual user ID
        const alerts = await response.json();
        
        const alertsContainer = document.querySelector('.alerts-container');
        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert-card">
                <h3>${alert.name}</h3>
                <p>Expires: ${new Date(alert.expiryDate).toLocaleDateString()}</p>
                <p>Days until expiry: ${Math.ceil((new Date(alert.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
} 