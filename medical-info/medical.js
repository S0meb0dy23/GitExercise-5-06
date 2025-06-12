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

  const petDropdown = document.getElementById('petDropdown');
  let selectedPetId = localStorage.getItem('selectedPetId');

  let weightChart;
  let weightData = [];

  function renderRecords(records) {
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
          x: { title: { display: true, text: 'Date' }},
          y: { beginAtZero: true, title: { display: true, text: 'Weight (kg)' }}
        }
      }
    });
  }

  function updateWeightChart() {
    const labels = weightData.map(entry => new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const weights = weightData.map(entry => entry.weight);
    weightChart.data.labels = labels;
    weightChart.data.datasets[0].data = weights;
    weightChart.update();
  }

  function fetchRecords() {
    fetch(`api/get_records.php?pet_id=${selectedPetId}`)
      .then(res => res.json())
      .then(data => renderRecords(data));
  }

  function fetchWeights() {
    fetch(`api/get_weights.php?pet_id=${selectedPetId}`)
      .then(res => res.json())
      .then(data => {
        weightData = data;
        updateWeightChart();
      });
  }

  function loadPets() {
    fetch(`api/get_pets.php`)
      .then(res => res.json())
      .then(pets => {
        petDropdown.innerHTML = '';
        pets.forEach(pet => {
          const option = document.createElement('option');
          option.value = pet.id;
          option.textContent = pet.name;
          petDropdown.appendChild(option);
        });

        if (!selectedPetId || !pets.find(p => p.id === parseInt(selectedPetId))) {
          selectedPetId = pets[0]?.id;
          localStorage.setItem('selectedPetId', selectedPetId);
        }

        petDropdown.value = selectedPetId;
        fetchRecords();
        fetchWeights();
      });
  }

  petDropdown.addEventListener('change', () => {
    selectedPetId = petDropdown.value;
    localStorage.setItem('selectedPetId', selectedPetId);
    fetchRecords();
    fetchWeights();
  });

  addBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeModal.addEventListener('click', () => modal.classList.add('hidden'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    formData.append("pet_id", selectedPetId);

    fetch('api/add_record.php', {
      method: 'POST',
      body: formData
    }).then(() => {
      fetchRecords();
      form.reset();
      modal.classList.add('hidden');
    });
  });

  showWeightFormBtn.addEventListener('click', () => {
    weightForm.classList.toggle('hidden');
  });

  addWeightBtn.addEventListener('click', () => {
    const date = document.getElementById('weightDate').value;
    const weight = parseFloat(document.getElementById('weightValue').value);

    if (date && !isNaN(weight)) {
      const formData = new FormData();
      formData.append("pet_id", selectedPetId);
      formData.append("date", date);
      formData.append("weight", weight);

      fetch('api/add_weight.php', {
        method: 'POST',
        body: formData
      }).then(res => res.text()).then(result => {
        if (result === "success") {
          fetchWeights();
          document.getElementById('weightDate').value = '';
          document.getElementById('weightValue').value = '';
          weightForm.classList.add('hidden');
        } else {
          alert("Weight for this date already exists.");
        }
      });
    } else {
      alert("Please enter a valid date and weight.");
    }
  });

  renderWeightChart();
  loadPets();
});
