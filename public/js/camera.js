let stream = null;
const video = document.getElementById('camera');
const captureBtn = document.getElementById('captureBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const foodForm = document.getElementById('foodForm');

// Initialize camera
async function initCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please check permissions.');
    }
}

// Stop camera
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        stream = null;
    }
}

// Capture image
captureBtn.addEventListener('click', async () => {
    if (!stream) {
        await initCamera();
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        await processImage(blob);
    } catch (error) {
        console.error('Error capturing image:', error);
        alert('Error capturing image. Please try again.');
    }
});

// Handle file upload
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        await processImage(file);
    }
});

// Process image with OCR
async function processImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/food/scan', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        // Pre-fill the form with detected text
        document.getElementById('foodName').value = data.text || '';
        
        // Show the manual input form
        document.querySelector('.manual-input').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
    }
}

// Handle form submission
foodForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(foodForm);
    formData.append('userId', '1'); // Replace with actual user ID

    try {
        const response = await fetch('/api/food', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            foodForm.reset();
            loadFoodItems(); // Refresh the food list
            alert('Food item added successfully!');
        } else {
            throw new Error('Failed to add food item');
        }
    } catch (error) {
        console.error('Error adding food item:', error);
        alert('Error adding food item. Please try again.');
    }
});

// Initialize camera when the scan page becomes active
document.querySelector('[data-page="scan"]').addEventListener('click', async () => {
    await initCamera();
});

// Stop camera when leaving the scan page
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (link.getAttribute('data-page') !== 'scan') {
            stopCamera();
        }
    });
}); 