document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const vaccinationList = document.getElementById('vaccinationList');
    const medicationList = document.getElementById('medicationList');
    const conditionList = document.getElementById('conditionList');
    const petDropdown = document.getElementById('petDropdown');
    const addRecordBtn = document.getElementById('addRecordBtn');
    const recordModal = document.getElementById('recordModal');
    const closeModal = document.getElementById('closeModal');
    const recordForm = document.getElementById('recordForm');
    const showWeightFormBtn = document.getElementById('showWeightFormBtn');
    const weightForm = document.getElementById('weightForm');
    const addWeightBtn = document.getElementById('addWeightBtn');
    const weightDate = document.getElementById('weightDate');
    const weightValue = document.getElementById('weightValue');
    const authAlert = document.getElementById('auth-alert');
    
    // State
    let currentPetId = null;
    let weightChart = null;
    let pets = [];

    // Initialize date field with current date
    weightDate.valueAsDate = new Date();

    // Initialize Chart
    function initWeightChart() {
        const ctx = document.getElementById('weightChart').getContext('2d');
        weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Weight (kg)',
                    borderColor: '#4f46e5',
                    backgroundColor: '#c7d2fe',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#4f46e5'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            tooltipFormat: 'MMM d, yyyy'
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Weight (kg)'
                        },
                        min: 0
                    }
                }
            }
        });
    }

    // Show notification
    function showNotification(message, isError = true) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${
            isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Fetch with authentication handling
    async function fetchWithAuth(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                credentials: 'include'
            });
            
            if (response.status === 401) {
                authAlert.classList.remove('hidden');
                throw new Error('Unauthorized');
            }
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Request failed');
            }
            
            return response;
        } catch (error) {
            console.error('API Error:', error);
            showNotification(error.message, true);
            throw error;
        }
    }

    // Load pets for dropdown
    async function loadPets() {
        try {
            const response = await fetchWithAuth('/api/get_pets.php');
            pets = await response.json();
            
            petDropdown.innerHTML = '';
            pets.forEach(pet => {
                const option = document.createElement('option');
                option.value = pet.id;
                option.textContent = pet.name;
                petDropdown.appendChild(option);
            });
            
            if (pets.length > 0) {
                currentPetId = pets[0].id;
                petDropdown.value = currentPetId;
                await fetchRecords();
                await fetchWeights();
            } else {
                showNotification('No pets found. Please add a pet first.', true);
            }
        } catch (error) {
            console.error('Error loading pets:', error);
        }
    }

    // Fetch medical records
    async function fetchRecords() {
        if (!currentPetId) return;
        
        try {
            const response = await fetchWithAuth(`/api/get_records.php?pet_id=${currentPetId}`);
            const records = await response.json();
            renderRecords(records);
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    }

    // Render records to the DOM
    function renderRecords(records) {
        const renderList = (list, items) => {
            list.innerHTML = '';
            items.forEach(item => {
                const li = document.createElement('li');
                li.className = 'flex justify-between items-center p-2 hover:bg-gray-50 rounded';
                
                const infoDiv = document.createElement('div');
                infoDiv.className = 'flex-1';
                infoDiv.innerHTML = `
                    <p class="font-medium">${item.description}</p>
                    ${item.info ? `<p class="text-sm text-gray-600">${item.info}</p>` : ''}
                    <p class="text-xs text-gray-500">${new Date(item.record_date).toLocaleDateString()}</p>
                `;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'text-red-500 hover:text-red-700 p-1';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.addEventListener('click', () => deleteRecord(item.id));
                
                li.appendChild(infoDiv);
                li.appendChild(deleteBtn);
                list.appendChild(li);
            });
            
            if (items.length === 0) {
                const li = document.createElement('li');
                li.className = 'text-gray-500 italic';
                li.textContent = 'No records found';
                list.appendChild(li);
            }
        };
        
        renderList(vaccinationList, records.vaccination);
        renderList(medicationList, records.medication);
        renderList(conditionList, records.condition);
    }

    // Fetch weight data
    async function fetchWeights() {
        if (!currentPetId) return;
        
        try {
            const response = await fetchWithAuth(`/api/get_weights.php?pet_id=${currentPetId}`);
            const weights = await response.json();
            updateWeightChart(weights);
        } catch (error) {
            console.error('Error fetching weights:', error);
        }
    }

    // Update weight chart
    function updateWeightChart(weights) {
        weightChart.data.labels = weights.map(w => w.date);
        weightChart.data.datasets[0].data = weights.map(w => ({
            x: w.date,
            y: w.weight
        }));
        weightChart.update();
    }

    // Add new medical record
    async function addRecord(formData) {
        try {
            const response = await fetchWithAuth('/api/add_record.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.text();
            if (result === 'success') {
                showNotification('Record added successfully!', false);
                await fetchRecords();
                recordForm.reset();
                recordModal.classList.add('hidden');
            } else {
                throw new Error('Failed to add record');
            }
        } catch (error) {
            console.error('Error adding record:', error);
            showNotification('Failed to add record', true);
        }
    }

    // Add new weight record
    async function addWeight() {
        if (!weightDate.value || !weightValue.value) {
            showNotification('Please fill all fields', true);
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('pet_id', currentPetId);
            formData.append('date', weightDate.value);
            formData.append('weight', weightValue.value);
            
            const response = await fetchWithAuth('/api/add_weight.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.text();
            if (result === 'success') {
                showNotification('Weight added successfully!', false);
                weightValue.value = '';
                weightForm.classList.add('hidden');
                await fetchWeights();
            } else {
                throw new Error(result || 'Failed to add weight');
            }
        } catch (error) {
            console.error('Error adding weight:', error);
            showNotification(error.message, true);
        }
    }

    // Delete record
    async function deleteRecord(recordId) {
        if (!confirm('Are you sure you want to delete this record?')) return;
        
        try {
            const response = await fetchWithAuth(`/api/delete_record.php?id=${recordId}`, {
                method: 'DELETE'
            });
            
            const result = await response.text();
            if (result === 'success') {
                showNotification('Record deleted', false);
                await fetchRecords();
            } else {
                throw new Error('Failed to delete record');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            showNotification('Failed to delete record', true);
        }
    }

    // Event Listeners
    petDropdown.addEventListener('change', () => {
        currentPetId = petDropdown.value;
        fetchRecords();
        fetchWeights();
    });

    addRecordBtn.addEventListener('click', () => {
        recordModal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
        recordModal.classList.add('hidden');
    });

    recordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(recordForm);
        formData.append('pet_id', currentPetId);
        addRecord(formData);
    });

    showWeightFormBtn.addEventListener('click', () => {
        weightForm.classList.toggle('hidden');
    });

    addWeightBtn.addEventListener('click', addWeight);

    // Initialize
    initWeightChart();
    loadPets();
});