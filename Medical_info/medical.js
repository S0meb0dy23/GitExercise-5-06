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

    

    // Show modal
    addBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    // Hide modal
    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Add record
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
                labels: [], // Start empty
                datasets: [{
                    label: 'Weight (kg)',
                    data: [], // Start empty
                    borderColor: '#4f46e5',
                    backgroundColor: '#c7d2fe',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    showWeightFormBtn.addEventListener('click', () => {
        weightForm.classList.toggle('hidden');
    });
    
    addWeightBtn.addEventListener('click', () => {
        const date = document.getElementById('weightDate').value;
        const weight = parseFloat(document.getElementById('weightValue').value);
    
        if (date && !isNaN(weight)) {
            weightChart.data.labels.push(date);
            weightChart.data.datasets[0].data.push(weight);
            weightChart.update();
    
            document.getElementById('weightDate').value = '';
            document.getElementById('weightValue').value = '';
            weightForm.classList.add('hidden'); // hide after submission
        } else {
            alert("Please enter a valid date and weight.");
        }
    });

    renderRecords();
    renderWeightChart();
});
