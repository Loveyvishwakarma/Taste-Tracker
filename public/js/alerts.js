// Initialize Firebase Cloud Messaging
let messaging = null;
let currentToken = null;

async function initializeFirebase() {
    try {
        // Request permission for notifications
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // Get FCM token
            currentToken = await messaging.getToken();
            await registerToken(currentToken);
        }
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
}

// Register FCM token with the server
async function registerToken(token) {
    try {
        await fetch('/api/alerts/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: '1', // Replace with actual user ID
                fcmToken: token
            })
        });
    } catch (error) {
        console.error('Error registering FCM token:', error);
    }
}

// Load alerts when the alerts page becomes active
document.querySelector('[data-page="alert"]').addEventListener('click', async () => {
    await loadAlerts();
});

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
                <div class="alert-actions">
                    <button onclick="deleteFood('${alert._id}')">Delete</button>
                    <button onclick="extendExpiry('${alert._id}')">Extend Expiry</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// Extend expiry date
async function extendExpiry(foodId) {
    const newDate = prompt('Enter new expiry date (YYYY-MM-DD):');
    if (!newDate) return;

    try {
        const response = await fetch(`/api/food/${foodId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                expiryDate: newDate
            })
        });

        if (response.ok) {
            loadAlerts();
            alert('Expiry date updated successfully!');
        } else {
            throw new Error('Failed to update expiry date');
        }
    } catch (error) {
        console.error('Error extending expiry:', error);
        alert('Error extending expiry date. Please try again.');
    }
}

// Check for expiring items periodically
setInterval(async () => {
    try {
        const response = await fetch('/api/alerts/1'); // Replace with actual user ID
        const alerts = await response.json();
        
        if (alerts.length > 0) {
            // Show browser notification if there are expiring items
            if (Notification.permission === 'granted') {
                new Notification('Food Expiring Soon!', {
                    body: `You have ${alerts.length} items expiring soon.`,
                    icon: '/images/icon.png'
                });
            }
        }
    } catch (error) {
        console.error('Error checking alerts:', error);
    }
}, 24 * 60 * 60 * 1000); // Check every 24 hours 