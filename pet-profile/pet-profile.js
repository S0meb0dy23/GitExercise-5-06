document.addEventListener('DOMContentLoaded', function () {
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const petForm = document.getElementById('pet-form');
  const petGallery = document.getElementById('pet-gallery');
  const petProfileForm = document.getElementById('pet-profile-form');

  const petAvatar = document.getElementById('pet-avatar');
  const petAvatarInput = document.getElementById('pet-avatar-input');
  const changeAvatarBtn = document.getElementById('change-avatar-btn');

  const addPhotoBtn = document.getElementById('add-photo-btn');
  const galleryInput = document.getElementById('gallery-photo-input');
  const galleryGrid = document.getElementById('gallery-grid');

  // Show Edit Form
  editProfileBtn.addEventListener('click', () => {
    petForm.classList.remove('hidden');
    petGallery.classList.add('hidden');
  });

  // Cancel Edit
  cancelEditBtn.addEventListener('click', () => {
    petForm.classList.add('hidden');
    petGallery.classList.remove('hidden');
  });

  // Submit Profile Form
  petProfileForm.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('pet-name').textContent = document.getElementById('name').value;
    document.getElementById('pet-breed').textContent = document.getElementById('breed').value;
    document.getElementById('pet-age').textContent = document.getElementById('age').value + ' years';
    document.getElementById('pet-weight').textContent = document.getElementById('weight').value + ' kg';
    petForm.classList.add('hidden');
    petGallery.classList.remove('hidden');
  });

  // Change Avatar
  changeAvatarBtn.addEventListener('click', () => {
    petAvatarInput.click();
  });

  petAvatarInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        petAvatar.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Add photo to gallery
  addPhotoBtn.addEventListener('click', () => {
    galleryInput.click();
  });

  galleryInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoDiv = document.createElement('div');
        photoDiv.className = 'relative group';

        photoDiv.innerHTML = `
          <img src="${reader.result}" class="w-full h-full object-cover rounded-lg"/>
          <button class="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Delete</button>
        `;

        const deleteBtn = photoDiv.querySelector('button');
        deleteBtn.addEventListener('click', () => {
          galleryGrid.removeChild(photoDiv);
        });

        galleryGrid.appendChild(photoDiv);
      };
      reader.readAsDataURL(file);
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
    // Tab Navigation Functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // In a complete app, this would show the corresponding tab content
            const tabId = button.getAttribute('data-tab');
            console.log(`Switching to tab: ${tabId}`);
            // You would typically have code here to show the corresponding content
            // document.querySelectorAll('.tab-content').forEach(content => {
            //     content.classList.remove('active');
            // });
            // document.getElementById(tabId).classList.add('active');
        });
    });

    // Notification button functionality
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            console.log('Notification button clicked');
            // This would typically open a notifications dropdown or panel
        });
    }

    // For demonstration, set the first tab as active by default
    if (tabButtons.length > 0) {
        tabButtons[0].classList.add('active');
    }
});