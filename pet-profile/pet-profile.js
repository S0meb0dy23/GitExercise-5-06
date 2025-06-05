
document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost/pet-profile/api.php';
    const GALLERY_API_URL = 'http://localhost/pet-profile/gallery_api.php';
    let galleryImages = [];
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
    const petSwitcherBtn = document.getElementById('pet-switcher-btn');
    const petSwitcherMenu = document.getElementById('pet-switcher-menu');
    const addNewPetBtn = document.getElementById('add-new-pet-btn');

    let pets = [];
    let currentPetId = null;

    async function fetchPets() {
        try {
            const response = await fetch(API_URL);
            return await response.json();
        } catch (error) {
            console.error('Error fetching pets:', error);
            return [];
        }
    }

    async function fetchGalleryImages(petId) {
    try {
        const response = await fetch(`${GALLERY_API_URL}?pet_id=${petId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        return [];
    }
}
async function saveGalleryImage(petId, imageData) {
    try {
        const response = await fetch(GALLERY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pet_id: petId,
                image: imageData
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving gallery image:', error);
        return null;
    }
}

async function deleteGalleryImage(imageId) {
    try {
        const response = await fetch(`${GALLERY_API_URL}?id=${imageId}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        return null;
    }
}


    async function savePet(petData) {
        const method = petData.id ? 'PUT' : 'POST';
        const url = petData.id ? `${API_URL}?id=${petData.id}` : API_URL;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(petData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving pet:', error);
            return null;
        }
    }

    async function loadPet(petId) {
    const pet = pets.find(p => p.id == petId);
    if (!pet) return;

    currentPetId = petId;
    document.getElementById('pet-name').textContent = pet.name;
    document.getElementById('pet-breed').textContent = pet.breed;
    document.getElementById('pet-age').textContent = `${pet.age} years`;
    document.getElementById('pet-weight').textContent = `${pet.weight} kg`;
    document.getElementById('pet-avatar').src = pet.avatar || 'https://placekitten.com/200/200';

    document.getElementById('name').value = pet.name;
    document.getElementById('breed').value = pet.breed;
    document.getElementById('age').value = pet.age;
    document.getElementById('weight').value = pet.weight;

    // Load gallery images
    galleryImages = await fetchGalleryImages(petId);
    renderGallery();

    updatePetSwitcherMenu();
}


    function updatePetSwitcherMenu() {
        const menuContainer = petSwitcherMenu.querySelector('.py-1');
        menuContainer.innerHTML = '';

        pets.forEach(pet => {
            const petItem = document.createElement('button');
            petItem.className = `pet-switcher-item ${pet.id == currentPetId ? 'active' : ''}`;
            petItem.textContent = pet.name;
            petItem.addEventListener('click', () => {
                loadPet(pet.id);
                petSwitcherMenu.classList.remove('show');
            });
            menuContainer.appendChild(petItem);
        });
    }
    function renderGallery() {
    galleryGrid.innerHTML = '';
    galleryImages.forEach(image => {
        const photoDiv = document.createElement('div');
        photoDiv.className = 'relative group';
        photoDiv.innerHTML = `
            <img src="${image.image_path}" class="w-full h-full object-cover rounded-lg"/>
            <button class="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Delete</button>
        `;
        const deleteBtn = photoDiv.querySelector('button');
        deleteBtn.addEventListener('click', async () => {
            await deleteGalleryImage(image.id);
            galleryImages = galleryImages.filter(img => img.id !== image.id);
            renderGallery();
        });
        galleryGrid.appendChild(photoDiv);
    });
}

// Update the gallery input event listener
galleryInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const savedImage = await saveGalleryImage(currentPetId, reader.result);
            if (savedImage) {
                galleryImages.push(savedImage);
                renderGallery();
            }
        };
        reader.readAsDataURL(file);
    }
});

    async function init() {
        pets = await fetchPets();
        if (pets.length > 0) {
            loadPet(pets[0].id);
        }
        petForm.classList.add('hidden');
        petGallery.classList.remove('hidden');
    }

    editProfileBtn.addEventListener('click', () => {
        petForm.classList.remove('hidden');
        petForm.classList.add('show');
        petGallery.classList.add('hidden');
    });

    cancelEditBtn.addEventListener('click', () => {
        petForm.classList.add('hidden');
        petForm.classList.remove('show');
        petGallery.classList.remove('hidden');
    });

    petProfileForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const petData = {
            id: currentPetId,
            name: document.getElementById('name').value,
            breed: document.getElementById('breed').value,
            age: document.getElementById('age').value,
            weight: document.getElementById('weight').value,
            avatar: document.getElementById('pet-avatar').src
        };

        const savedPet = await savePet(petData);
        if (savedPet) {
            pets = await fetchPets();
            loadPet(savedPet.id);
            petForm.classList.add('hidden');
            petForm.classList.remove('show');
            petGallery.classList.remove('hidden');
        }
    });

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

    petSwitcherBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        petSwitcherMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        petSwitcherMenu.classList.remove('show');
    });

    addNewPetBtn.addEventListener('click', async () => {
        const newPet = {
            name: "New Pet",
            breed: "",
            age: 0,
            weight: 0,
            avatar: "https://placekitten.com/200/200"
        };

        const savedPet = await savePet(newPet);
        if (savedPet) {
            pets = await fetchPets();
            loadPet(savedPet.id);
            petSwitcherMenu.classList.remove('show');
            petForm.classList.remove('hidden');
            petForm.classList.add('show');
            petGallery.classList.add('hidden');
        }
    });

    init();
});

// ... (existing code)

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

// ... (existing code)

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
            
            // Here you would typically send the image to the server
            // For a complete solution, you'd need to create an API endpoint for gallery images
        };
        reader.readAsDataURL(file);
    }
});

// ... (rest of the existing code)