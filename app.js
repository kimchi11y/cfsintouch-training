const STORAGE_KEY = 'spinWheelNames';

function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
        showMessage('Please select a file', 'error');
        return;
    }

    if (!file.name.endsWith('.csv')) {
        showMessage('Please upload a CSV file', 'error');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const names = parseCSV(content);
            
            if (names.length === 0) {
                showMessage('CSV file is empty or contains no valid names', 'error');
                return;
            }

            saveNamesToStorage(names);
            displayNames(names);
            showMessage(`Successfully loaded ${names.length} name(s)`, 'success');
        } catch (error) {
            showMessage('Error processing file: ' + error.message, 'error');
        }
    };

    reader.onerror = function() {
        showMessage('Error reading file', 'error');
    };

    reader.readAsText(file);
}

function parseCSV(content) {
    const lines = content.split('\n');
    const names = [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            names.push(trimmedLine);
        }
    }

    return names;
}

function saveNamesToStorage(names) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    } catch (error) {
        throw new Error('Failed to save to localStorage: ' + error.message);
    }
}

function getNamesFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
}

function clearStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        hideDataSection();
        showMessage('Data cleared successfully', 'success');
        document.getElementById('csvFileInput').value = '';
    } catch (error) {
        showMessage('Error clearing data: ' + error.message, 'error');
    }
}

function displayNames(names) {
    const dataSection = document.getElementById('dataSection');
    const nameCount = document.getElementById('nameCount');
    const namesList = document.getElementById('namesList');

    nameCount.textContent = names.length;
    namesList.innerHTML = names.map(name => `<li>${escapeHtml(name)}</li>`).join('');
    
    dataSection.style.display = 'block';
}

function hideDataSection() {
    document.getElementById('dataSection').style.display = 'none';
}

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    
    setTimeout(() => {
        messageEl.className = 'message';
        messageEl.textContent = '';
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('csvFileInput');
    const clearBtn = document.getElementById('clearBtn');

    fileInput.addEventListener('change', handleFileUpload);
    clearBtn.addEventListener('click', clearStorage);

    const existingNames = getNamesFromStorage();
    if (existingNames.length > 0) {
        displayNames(existingNames);
        showMessage(`Loaded ${existingNames.length} name(s) from storage`, 'success');
    }
});
