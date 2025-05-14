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
