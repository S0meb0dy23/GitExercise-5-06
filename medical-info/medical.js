document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
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
  const petDropdown = document.getElementById('petDropdown');
  const weightDateInput = document.getElementById('weightDate');
  const weightValueInput = document.getElementById('weightValue');

  // State variables
  let selectedPetId = localStorage.getItem('selectedPetId');
  let weightChart;
  let weightData = [];

  // Set default date to today
  weightDateInput.valueAsDate = new Date();

  // Render medical records
  function renderRecords(records) {
    const renderList = (list, items) => {
      list.innerHTML = items.map(rec => 
        `<li>${rec.desc} <span class="extra">${rec.info || ''}</span></li>`
      ).join('');
    };

    renderList(vaccinationList, records.vaccination);
    renderList(medicationList, records.medication);
    renderList(conditionList, records.condition);
  }

  // Initialize weight chart
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
          backgroundColor: '#c7d2fe80',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          spanGaps: false // Don't connect points across missing dates
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { 
            title: { display: true, text: 'Date' },
            type: 'time',
            time: {
              unit: 'day',
              tooltipFormat: 'MMM d, yyyy',
              displayFormats: {
                day: 'MMM d'
              }
            },
            bounds: 'data' // Only show dates with data
          },
          y: { 
            beginAtZero: false,
            title: { display: true, text: 'Weight (kg)' },
            grace: '5%' // Add some padding
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (context) => {
                return new Date(context[0].parsed.x).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
              }
            }
          }
        }
      }
    });
  }

  // Update chart with only dates that have weight data
  function updateWeightChart() {
    if (weightData.length === 0) {
      // Clear chart if no data
      weightChart.data.labels = [];
      weightChart.data.datasets[0].data = [];
    } else {
      // Only use dates with weight data
      const labels = weightData.map(entry => entry.date);
      const weights = weightData.map(entry => entry.weight);
      
      weightChart.data.labels = labels;
      weightChart.data.datasets[0].data = weights;
    }
    weightChart.update();
  }

  // Fetch medical records
  async function fetchRecords() {
    try {
      const response = await fetch(`api/get_records.php?pet_id=${selectedPetId}`);
      const data = await response.json();
      renderRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  }

  // Fetch weight data
  async function fetchWeights() {
    try {
      const response = await fetch(`api/get_weights.php?pet_id=${selectedPetId}`);
      const data = await response.json();
      weightData = Array.isArray(data) ? data : [];
      
      // Sort by date (ascending)
      weightData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      updateWeightChart();
    } catch (error) {
      console.error('Error fetching weights:', error);
    }
  }

  // Load pets dropdown
  async function loadPets() {
    try {
      const response = await fetch(`api/get_pets.php`);
      const pets = await response.json();
      
      petDropdown.innerHTML = pets.map(pet => 
        `<option value="${pet.id}">${pet.name}</option>`
      ).join('');

      // Set selected pet
      if (!selectedPetId || !pets.some(p => p.id == selectedPetId)) {
        selectedPetId = pets[0]?.id;
        localStorage.setItem('selectedPetId', selectedPetId);
      }
      petDropdown.value = selectedPetId;

      // Load initial data
      await Promise.all([fetchRecords(), fetchWeights()]);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  }

  // Add weight entry
  async function addWeightEntry(date, weight) {
    try {
      const formData = new FormData();
      formData.append("pet_id", selectedPetId);
      formData.append("date", date);
      formData.append("weight", weight);

      const response = await fetch('api/add_weight.php', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add weight');
      }

      await fetchWeights();
      weightForm.classList.add('hidden');
      
      return true;
    } catch (error) {
      console.error('Error adding weight:', error);
      alert(`Error: ${error.message}`);
      return false;
    }
  }

  // Event Listeners
  petDropdown.addEventListener('change', () => {
    selectedPetId = petDropdown.value;
    localStorage.setItem('selectedPetId', selectedPetId);
    fetchRecords();
    fetchWeights();
  });

  addBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeModal.addEventListener('click', () => modal.classList.add('hidden'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    formData.append("pet_id", selectedPetId);

    try {
      await fetch('api/add_record.php', {
        method: 'POST',
        body: formData
      });
      await fetchRecords();
      form.reset();
      modal.classList.add('hidden');
    } catch (error) {
      console.error('Error adding record:', error);
    }
  });

  showWeightFormBtn.addEventListener('click', () => {
    weightForm.classList.toggle('hidden');
    if (!weightForm.classList.contains('hidden')) {
      weightDateInput.focus();
    }
  });

  addWeightBtn.addEventListener('click', async () => {
    const date = weightDateInput.value;
    const weight = parseFloat(weightValueInput.value);

    if (!date) {
      alert("Please select a date");
      return;
    }

    if (isNaN(weight)) {
      alert("Please enter a valid weight");
      return;
    }

    await addWeightEntry(date, weight);
  });

  // Initialize
  renderWeightChart();
  loadPets();
});