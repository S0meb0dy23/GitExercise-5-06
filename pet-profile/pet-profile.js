document.addEventListener('DOMContentLoaded', function() {
    const API_URL = '/api.php';
    const GALLERY_API_URL = '/gallery_api.php';
    let galleryImages = [];
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const petForm = document.getElementById('pet-form');
    const petGallery = document.getElementById('pet-gallery');
    const petProfileForm = document.getElementById('pet-profile-form');
    const petAvatar = document.getElementById('pet-avatar');
    const addPhotoBtn = document.getElementById('add-photo-btn');
    const galleryInput = document.getElementById('gallery-photo-input');
    const galleryGrid = document.getElementById('gallery-grid');
    const petSwitcherBtn = document.getElementById('pet-switcher-btn');
    const petSwitcherMenu = document.getElementById('pet-switcher-menu');
    const addNewPetBtn = document.getElementById('add-new-pet-btn');
    const authAlert = document.getElementById('auth-alert');
    const MAX_GALLERY_SIZE = 10 * 1024 * 1024;
    
    let pets = [];
    let currentPetId = null;

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
            showNotification(error.message);
            throw error;
        }
    }

    async function fetchPets() {
        try {
            const response = await fetchWithAuth(API_URL);
            return await response.json();
        } catch (error) {
            return [];
        }
    }

    async function fetchGalleryImages(petId) {
        try {
            const response = await fetchWithAuth(`${GALLERY_API_URL}?pet_id=${petId}`);
            return await response.json();
        } catch (error) {
            return [];
        }
    }

    async function saveGalleryImage(petId, imageData) {
        try {
            const response = await fetchWithAuth(GALLERY_API_URL, {
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
            return null;
        }
    }

    async function deleteGalleryImage(imageId) {
        try {
            const response = await fetchWithAuth(`${GALLERY_API_URL}?id=${imageId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            return null;
        }
    }

    async function deletePet(petId) {
        try {
            const response = await fetchWithAuth(`${API_URL}?id=${petId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            return null;
        }
    }

    async function savePet(petData) {
        const method = petData.id ? 'PUT' : 'POST';
        const url = petData.id ? `${API_URL}?id=${petData.id}` : API_URL;

        try {
            const response = await fetchWithAuth(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(petData)
            });
            
            const result = await response.json();
            showNotification(petData.id ? 'Pet updated successfully!' : 'Pet added successfully!', false);
            return result;
        } catch (error) {
            console.error('Error saving pet:', error);
            throw error;
        }
    }

    async function loadPet(petId) {
        const pet = pets.find(p => p.id == petId);
        if (!pet) return;

        currentPetId = petId;
        document.getElementById('pet-name').textContent = pet.name;
        document.getElementById('pet-breed').textContent = pet.breed || 'Unknown breed';
        document.getElementById('pet-age').textContent = pet.age ? `${pet.age} years` : 'Age not specified';
        document.getElementById('pet-weight').textContent = pet.weight ? `${pet.weight} kg` : 'Weight not specified';

        try {
            galleryImages = await fetchGalleryImages(petId);
            if (galleryImages.length > 0) {
                petAvatar.src = galleryImages[0].image;
            } else {
                petAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2QxZDFkMSI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjMzLTggNHYyaDE2di0yYzAtMi42Ny01LjMzLTQtOC00eiIvPjwvc3ZnPg==';
            }

            document.getElementById('name').value = pet.name;
            document.getElementById('breed').value = pet.breed || '';
            document.getElementById('age').value = pet.age || '';
            document.getElementById('weight').value = pet.weight || '';

            renderGallery();
            updatePetSwitcherMenu();
        } catch (error) {
            console.error('Error loading pet:', error);
        }
    }

    function updatePetSwitcherMenu() {
        const menuContainer = petSwitcherMenu.querySelector('.py-1');
        menuContainer.innerHTML = '';

        pets.forEach(pet => {
            const petItem = document.createElement('div');
            petItem.className = 'flex justify-between items-center px-4 py-2 hover:bg-gray-100';
            
            const petName = document.createElement('button');
            petName.className = `pet-switcher-item ${pet.id == currentPetId ? 'font-bold text-indigo-600' : ''}`;
            petName.textContent = pet.name;
            petName.addEventListener('click', () => {
                loadPet(pet.id);
                petSwitcherMenu.classList.add('hidden');
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'text-red-500 hover:text-red-700 text-sm';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete ${pet.name}? This cannot be undone.`)) {
                    try {
                        await deletePet(pet.id);
                        pets = pets.filter(p => p.id !== pet.id);
                        if (pets.length > 0) {
                            await loadPet(pets[0].id);
                        } else {
                            await addDefaultPet();
                        }
                    } catch (error) {
                        console.error('Error deleting pet:', error);
                    }
                }
            });
            
            petItem.appendChild(petName);
            petItem.appendChild(deleteBtn);
            menuContainer.appendChild(petItem);
        });
    }

    function renderGallery() {
        galleryGrid.innerHTML = '';
        
        if (galleryImages.length === 0) {
            galleryGrid.innerHTML = `
                <div class="col-span-3 text-center py-8 text-gray-500">
                    <i class="fas fa-camera fa-3x mb-2"></i>
                    <p>No photos yet</p>
                </div>
            `;
            return;
        }

        galleryImages.forEach(image => {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'relative group';
            photoDiv.innerHTML = `
                <img src="${image.image}" alt="Pet photo" class="w-full h-48 object-cover rounded-lg"/>
                <button class="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            `;
            
            photoDiv.querySelector('button').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Delete this photo?')) {
                    try {
                        await deleteGalleryImage(image.id);
                        galleryImages = galleryImages.filter(img => img.id !== image.id);
                        renderGallery();
                        
                        if (galleryImages.length > 0) {
                            petAvatar.src = galleryImages[0].image;
                        } else {
                            petAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2QxZDFkMSI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjMzLTggNHYyaDE2di0yYzAtMi42Ny01LjMzLTQtOC00eiIvPjwvc3ZnPg==';
                        }
                    } catch (error) {
                        console.error('Error deleting image:', error);
                    }
                }
            });
            
            galleryGrid.appendChild(photoDiv);
        });
    }

    async function addDefaultPet() {
        const newPet = {
            name: "My Pet",
            breed: "",
            age: 0,
            weight: 0
        };
        
        try {
            const savedPet = await savePet(newPet);
            if (savedPet) {
                pets = await fetchPets();
                await loadPet(savedPet.id);
            }
        } catch (error) {
            console.error('Error adding default pet:', error);
        }
    }

    async function init() {
        try {
            pets = await fetchPets();
            if (pets.length > 0) {
                await loadPet(pets[0].id);
            } else {
                await addDefaultPet();
            }
            
            petForm.classList.add('hidden');
            petGallery.classList.remove('hidden');
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    // Event Listeners
    editProfileBtn.addEventListener('click', () => {
        petForm.classList.remove('hidden');
        petGallery.classList.add('hidden');
    });

    cancelEditBtn.addEventListener('click', () => {
        petForm.classList.add('hidden');
        petGallery.classList.remove('hidden');
    });

    petProfileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const petData = {
            id: currentPetId,
            name: document.getElementById('name').value.trim(),
            breed: document.getElementById('breed').value.trim(),
            age: parseInt(document.getElementById('age').value) || 0,
            weight: parseFloat(document.getElementById('weight').value) || 0
        };

        if (!petData.name) {
            showNotification('Pet name is required');
            return;
        }

        try {
            const savedPet = await savePet(petData);
            if (savedPet) {
                const petIndex = pets.findIndex(p => p.id == savedPet.id);
                if (petIndex !== -1) {
                    pets[petIndex] = savedPet;
                } else {
                    pets.push(savedPet);
                }
                
                await loadPet(savedPet.id);
                petForm.classList.add('hidden');
                petGallery.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error saving pet:', error);
        }
    });

    addPhotoBtn.addEventListener('click', () => {
        galleryInput.click();
    });

    galleryInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;

        if (file.size > MAX_GALLERY_SIZE) {
            showNotification('Image is too large (max 10MB)');
            return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const result = await saveGalleryImage(currentPetId, reader.result);
                if (result) {
                    galleryImages.push({
                        id: result.id,
                        pet_id: result.pet_id,
                        image: reader.result
                    });
                    renderGallery();
                    
                    if (galleryImages.length === 1) {
                        petAvatar.src = reader.result;
                    }
                }
            } catch (error) {
                console.error('Error saving image:', error);
            }
        };
        reader.onerror = () => {
            showNotification('Error reading image file');
        };
        reader.readAsDataURL(file);
    });

    petSwitcherBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        petSwitcherMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        petSwitcherMenu.classList.add('hidden');
    });

    addNewPetBtn.addEventListener('click', async () => {
        const newPet = {
            name: "New Pet",
            breed: "",
            age: 0,
            weight: 0
        };

        try {
            const savedPet = await savePet(newPet);
            if (savedPet) {
                pets = await fetchPets();
                await loadPet(savedPet.id);
                petSwitcherMenu.classList.add('hidden');
                petForm.classList.remove('hidden');
                petGallery.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error adding new pet:', error);
        }
    });

    // Initialize the app
    init();
});