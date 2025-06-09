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
    const addPhotoBtn = document.getElementById('add-photo-btn');
    const galleryInput = document.getElementById('gallery-photo-input');
    const galleryGrid = document.getElementById('gallery-grid');
    const petSwitcherBtn = document.getElementById('pet-switcher-btn');
    const petSwitcherMenu = document.getElementById('pet-switcher-menu');
    const addNewPetBtn = document.getElementById('add-new-pet-btn');
    const MAX_GALLERY_SIZE = 10 * 1024 * 1024; 
    const notification = document.createElement('div');
    
    let pets = [];
    let currentPetId = null;

    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg hidden';
    document.body.appendChild(notification);

    function showNotification(message) {
        notification.textContent = message;
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }

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

    async function deletePet(petId) {
        try {
            const response = await fetch(`${API_URL}?id=${petId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting pet:', error);
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
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to save pet');
            }
            
            return result;
        } catch (error) {
            console.error('Error saving pet:', error);
            showNotification(error.message);
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
    }

    function updatePetSwitcherMenu() {
        const menuContainer = petSwitcherMenu.querySelector('.py-1');
        menuContainer.innerHTML = '';

        pets.forEach(pet => {
            const petItem = document.createElement('div');
            petItem.className = 'flex justify-between items-center px-4 py-2 hover:bg-gray-100';
            
            const petName = document.createElement('button');
            petName.className = `pet-switcher-item ${pet.id == currentPetId ? 'active' : ''}`;
            petName.textContent = pet.name;
            petName.addEventListener('click', () => {
                loadPet(pet.id);
                petSwitcherMenu.classList.remove('show');
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'text-red-500 hover:text-red-700';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete ${pet.name}'s profile? This cannot be undone.`)) {
                    const success = await deletePet(pet.id);
                    if (success) {
                        pets = pets.filter(p => p.id !== pet.id);
                        if (pets.length > 0) {
                            loadPet(pets[0].id);
                        } else {
                            // Create a new pet if last one was deleted
                            const newPet = {
                                name: "My Pet",
                                breed: "",
                                age: 0,
                                weight: 0
                            };
                            const savedPet = await savePet(newPet);
                            if (savedPet) {
                                pets = await fetchPets();
                                loadPet(savedPet.id);
                            }
                        }
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
        galleryImages.forEach(image => {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'relative group';
            photoDiv.innerHTML = `
                <img src="${image.image}" class="w-full h-48 object-cover rounded-lg"/>
                <button class="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Delete</button>
            `;
            const deleteBtn = photoDiv.querySelector('button');
            deleteBtn.addEventListener('click', async () => {
                await deleteGalleryImage(image.id);
                galleryImages = galleryImages.filter(img => img.id !== image.id);
                renderGallery();
                
                // Update avatar if we deleted the first image
                if (galleryImages.length > 0) {
                    petAvatar.src = galleryImages[0].image;
                } else {
                    petAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2QxZDFkMSI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjMzLTggNHYyaDE2di0yYzAtMi42Ny01LjMzLTQtOC00eiIvPjwvc3ZnPg==';
                }
            });
            galleryGrid.appendChild(photoDiv);
        });
    }

    async function init() {
        pets = await fetchPets();
        if (pets.length > 0) {
            loadPet(pets[0].id);
        } else {
            const newPet = {
                name: "My Pet",
                breed: "",
                age: 0,
                weight: 0
            };
            const savedPet = await savePet(newPet);
            if (savedPet) {
                pets = await fetchPets();
                loadPet(savedPet.id);
            }
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

    petProfileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const petData = {
            id: currentPetId,
            name: document.getElementById('name').value,
            breed: document.getElementById('breed').value,
            age: document.getElementById('age').value,
            weight: document.getElementById('weight').value
        };

        try {
            const savedPet = await savePet(petData);
            if (savedPet) {
                const petIndex = pets.findIndex(p => p.id == savedPet.id);
                if (petIndex !== -1) {
                    pets[petIndex] = savedPet;
                }
                
                loadPet(savedPet.id);
                petForm.classList.add('hidden');
                petForm.classList.remove('show');
                petGallery.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error saving pet:', error);
            showNotification('Failed to save pet profile. Please try again.');
        }
    });

    addPhotoBtn.addEventListener('click', () => {
        galleryInput.click();
    });

    galleryInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            if (file.size > MAX_GALLERY_SIZE) {
                showNotification('Image is too large. Please select an image smaller than 10MB.');
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const savedImage = await saveGalleryImage(currentPetId, reader.result);
                    if (savedImage && savedImage.error) {
                        showNotification(savedImage.error);
                    } else if (savedImage) {
                        galleryImages.push({
                            id: savedImage.id,
                            pet_id: savedImage.pet_id,
                            image: reader.result
                        });
                        renderGallery();
                        
                        // Update avatar if this is the first image
                        if (galleryImages.length === 1) {
                            petAvatar.src = reader.result;
                        }
                    }
                } catch (error) {
                    console.error('Error saving gallery image:', error);
                    showNotification('Failed to save image. Please try again.');
                }
            };
            reader.onerror = () => {
                showNotification('Error reading the image file. Please try another image.');
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
            weight: 0
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