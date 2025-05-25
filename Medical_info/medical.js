document.addEventListener('DOMContentLoaded', () => {
    const vaccinationList = document.getElementById('vaccinationList');
    const medicationList = document.getElementById('medicationList');
    const conditionList = document.getElementById('conditionList');

    const addBtn = document.getElementById('addRecordBtn');
    const modal = document.getElementById('recordModal');
    const closeModal = document.getElementById('closeModal');
    const form = document.getElementById('recordForm');

    const weightForm = document.getElementById('weightForm');
    const showWeightFormBtn = document.getElementById('showWeightFormBtn');
    const addWeightBtn = document.getElementById('addWeightBtn');

    const records = {
        vaccination: [],
        medication: [],
        condition: []
    };

    // NEW: store weight data
    let weightData = [];
    let weightChart;

    // Show modal
    addBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    // Hide modal
    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Add medical record
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = form.type.value;
        const desc = form.description.value;
        const info = form.info.value;

        records[type].push({ desc, info });
        renderRecords();
        form.reset();
        modal.classList.add('hidden');
    });

    function renderRecords() {
        vaccinationList.innerHTML = '';
        records.vaccination.forEach(rec => {
            vaccinationList.innerHTML += `<li>${rec.desc} <span class="extra">${rec.info || ''}</span></li>`;
        });

        medicationList.innerHTML = '';
        records.medication.forEach(rec => {
            medicationList.innerHTML += `<li>${rec.desc} <span class="extra">${rec.info || ''}</span></li>`;
        });

        conditionList.innerHTML = '';
        records.condition.forEach(rec => {
            conditionList.innerHTML += `<li>${rec.desc} <span class="extra">${rec.info || ''}</span></li>`;
        });
    }

    function renderWeightChart() {
        const ctx = document.getElementById('weightChart').getContext('2d');
        weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Weight (kg)',
                    data: [],
                    borderColor: '#4f46e5',
                    backgroundColor: '#c7d2fe',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Weight (kg)'
                        }
                    }
                }
            }
        });
    }

    // NEW: updates chart with sorted weightData
    function updateWeightChart() {
        const formattedLabels = weightData.map(entry => {
            const date = new Date(entry.date);
            const options = { month: 'short', day: 'numeric' }; // e.g., "May 13"
            return date.toLocaleDateString('en-US', options);
        });

        weightChart.data.labels = formattedLabels;
        weightChart.data.datasets[0].data = weightData.map(entry => entry.weight);
        weightChart.update();
    }

    showWeightFormBtn.addEventListener('click', () => {
        weightForm.classList.toggle('hidden');
    });

    // UPDATED: Add weight, sort by date, and update chart
    addWeightBtn.addEventListener('click', () => {
    const date = document.getElementById('weightDate').value;
    const weight = parseFloat(document.getElementById('weightValue').value);

    // Check if the date is already in the weightData
    const dateExists = weightData.some(entry => entry.date === date);

    if (dateExists) {
        alert("You cannot enter the same date more than once.");
    } else if (date && !isNaN(weight)) {
        weightData.push({ date, weight });

        // Sort data chronologically
        weightData.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Update chart
        updateWeightChart();

        // Reset form
        document.getElementById('weightDate').value = '';
        document.getElementById('weightValue').value = '';
        weightForm.classList.add('hidden');
    } else {
        alert("Please enter a valid date and weight.");
    }
});

    renderRecords();
    renderWeightChart();
});

