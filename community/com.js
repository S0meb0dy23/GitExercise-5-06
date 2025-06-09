document.addEventListener('DOMContentLoaded', () => {
  const postList = document.getElementById('postList');
  const newPostBtn = document.getElementById('newPostBtn');
  const newPostModal = document.getElementById('newPostModal');
  const closeModalBtn = newPostModal.querySelector('.close');
  const newPostForm = document.getElementById('newPostForm');
  const postCaptionInput = document.getElementById('postCaption');
  const postImagesInput = document.getElementById('postImages');
  const imagePreviewContainer = document.getElementById('image-preview-container');


  let posts = [];


  const generateId = () => Date.now() + Math.random().toString(16).slice(2);


  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (m) {
      return (
        {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }[m] || m
      );
    });
  }


  function createImageSlider(images) {
    return `<div class="image-slider">
      ${images
        .map(
          (src) =>
            `<img src="${src}" alt="Post image" loading="lazy" draggable="false" />`
        )
        .join('')}
    </div>`;
  }

 
  function createPostElement(post) {
    const postEl = document.createElement('div');
    postEl.classList.add('post');
    postEl.dataset.id = post.id;

    postEl.innerHTML = `
      <div class="post-header">
        <div>
          <span class="post-author">${escapeHtml(post.author || 'User')}</span>
          <span class="post-date">${new Date(post.date).toLocaleString()}</span>
        </div>
        <div class="menu-container" tabindex="0" aria-label="Post options menu">
          <i class="fas fa-ellipsis-v menu-icon" role="button" aria-haspopup="true" aria-expanded="false"></i>
          <div class="menu-dropdown" role="menu" aria-hidden="true">
            <button class="edit-btn" role="menuitem">Edit</button>
            <button class="delete-btn" role="menuitem">Delete</button>
          </div>
        </div>
      </div>
      <div class="post-content">${escapeHtml(post.caption)}</div>
      ${
        post.images.length > 0
          ? createImageSlider(post.images)
          : ''
      }
      <div class="post-actions">
        <button class="action-btn like-btn ${post.liked ? 'liked' : ''}" aria-label="Like post" aria-pressed="${post.liked ? 'true' : 'false'}">
          <i class="fas fa-heart"></i> <span class="like-count">${post.likes}</span>
        </button>
        <button class="action-btn comment-toggle-btn" aria-label="Toggle comments">
          <i class="fas fa-comment"></i> <span class="comment-count">${post.comments.length}</span>
        </button>
      </div>
      <div class="comments-section hidden" aria-live="polite">
        <div class="comments-list">
          ${post.comments
            .map(
              (c) =>
                `<div class="comment"><b>${escapeHtml(
                  c.author || 'User'
                )}:</b> ${escapeHtml(c.text)}</div>`
            )
            .join('')}
        </div>
        <form class="comment-input" aria-label="Add comment form">
          <input type="text" placeholder="Add a comment..." aria-label="Comment input" required />
          <button type="submit">Send</button>
        </form>
      </div>
    `;

    return postEl;
  }


  function renderPosts() {
    postList.innerHTML = '';
    posts.forEach((post) => {
      const postEl = createPostElement(post);
      postList.appendChild(postEl);
    });
  }

  function openModal() {
    newPostModal.classList.remove('hidden');
    postCaptionInput.focus();
  }


  function closeModal() {
    newPostModal.classList.add('hidden');
    newPostForm.reset();
    imagePreviewContainer.innerHTML = '';  // Clear image previews when modal closes
  }


  function previewSelectedImages(files, container) {
    container.innerHTML = ''; // Clear previous previews
    Array.from(files).slice(0, 5).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = 'Preview image';
        img.classList.add('preview-image');
        container.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }


  function createEditModal(post) {
    const modal = document.createElement('div');
    modal.className = 'modal edit-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Edit Post</h3>
        <button class="close" aria-label="Close modal">&times;</button>
        <form class="edit-post-form">
          <textarea placeholder="Edit your caption..." rows="4" required>${escapeHtml(post.caption)}</textarea>
          <div class="edit-image-preview"></div>
          <input type="file" class="edit-post-images" accept="image/*" multiple aria-label="Add more images" />
          <button type="submit">Update Post</button>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    

    const previewContainer = modal.querySelector('.edit-image-preview');
    post.images.forEach((imgSrc, index) => {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'image-preview-item';
      imgContainer.innerHTML = `
        <img src="${imgSrc}" alt="Existing image ${index + 1}" />
        <button class="remove-image" data-index="${index}">&times;</button>
      `;
      previewContainer.appendChild(imgContainer);
    });
    

    previewContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-image')) {
        const index = parseInt(e.target.dataset.index);
        post.images.splice(index, 1);
        createEditModal(post); // Recreate modal with updated images
        modal.remove();
      }
    });
    

    const editImagesInput = modal.querySelector('.edit-post-images');
    editImagesInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length + post.images.length > 5) {
        alert('You can only have up to 5 images per post.');
        e.target.value = '';
        return;
      }
      
      files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          post.images.push(e.target.result);
          createEditModal(post); // Recreate modal with updated images
          modal.remove();
        };
        reader.readAsDataURL(file);
      });
    });
    

    const editForm = modal.querySelector('.edit-post-form');
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const textarea = editForm.querySelector('textarea');
      post.caption = textarea.value.trim();
      renderPosts();
      modal.remove();
    });
    
   
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => modal.remove());
    
   
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.querySelector('.edit-modal')) {
        document.querySelector('.edit-modal').remove();
      }
    });
    
    return modal;
  }

 
  postImagesInput.addEventListener('change', (e) => {
    previewSelectedImages(e.target.files, imagePreviewContainer);
  });


  newPostForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const caption = postCaptionInput.value.trim();
    if (!caption) return alert('Please enter a caption.');

    const files = Array.from(postImagesInput.files);
    if (files.length > 5) {
      alert('Maximum 5 images allowed.');
      return;
    }

    
    const readFilesPromises = files.slice(0, 5).map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readFilesPromises).then((images) => {
      const newPost = {
        id: generateId(),
        author: 'User',
        date: new Date().toISOString(),
        caption,
        images,
        likes: 0,
        liked: false,
        comments: [],
      };

      posts.unshift(newPost);
      renderPosts();
      closeModal();
    });
  });

  
  postList.addEventListener('click', (e) => {
    const postEl = e.target.closest('.post');
    if (!postEl) return;

    const postId = postEl.dataset.id;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    
    if (e.target.closest('.like-btn')) {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      
 
      const likeBtn = postEl.querySelector('.like-btn');
      const likeIcon = likeBtn.querySelector('i');
      const likeCount = likeBtn.querySelector('.like-count');
      
      likeBtn.classList.toggle('liked', post.liked);
      likeBtn.setAttribute('aria-pressed', post.liked);
      likeCount.textContent = post.likes;
      
  
      if (post.liked) {
        likeIcon.style.color = '#4f46e5';
      } else {
        likeIcon.style.color = '';
      }
      return;
    }


    if (e.target.closest('.comment-toggle-btn')) {
      const commentsSection = postEl.querySelector('.comments-section');
      if (!commentsSection) return;
      commentsSection.classList.toggle('hidden');
      return;
    }

    
    if (e.target.closest('.menu-icon')) {
      const menuContainer = e.target.closest('.menu-container');
      const dropdown = menuContainer.querySelector('.menu-dropdown');
      const expanded = e.target.getAttribute('aria-expanded') === 'true';
      closeAllMenus(); // Close others before toggling this
      dropdown.classList.toggle('show');
      e.target.setAttribute('aria-expanded', !expanded);
      dropdown.setAttribute('aria-hidden', expanded);
      return;
    }

   
    if (e.target.classList.contains('edit-btn')) {
      closeAllMenus();
      createEditModal(post);
      return;
    }


    if (e.target.classList.contains('delete-btn')) {
      if (confirm('Are you sure you want to delete this post?')) {
        posts = posts.filter((p) => p.id !== postId);
        renderPosts();
      }
      closeAllMenus();
      return;
    }
  });

 
  document.addEventListener('click', (e) => {
    if (
      !e.target.closest('.menu-container') &&
      !e.target.closest('.menu-dropdown') &&
      !e.target.closest('.menu-icon')
    ) {
      closeAllMenus();
    }
  });

  function closeAllMenus() {
    document.querySelectorAll('.menu-dropdown.show').forEach((menu) => {
      menu.classList.remove('show');
      const icon = menu.parentElement.querySelector('.menu-icon');
      if (icon) {
        icon.setAttribute('aria-expanded', 'false');
      }
      menu.setAttribute('aria-hidden', 'true');
    });
  }


  postList.addEventListener('submit', (e) => {
    if (!e.target.classList.contains('comment-input')) return;
    e.preventDefault();

    const postEl = e.target.closest('.post');
    if (!postEl) return;

    const postId = postEl.dataset.id;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const input = e.target.querySelector('input[type="text"]');
    const text = input.value.trim();
    if (!text) return;

    post.comments.push({
      id: generateId(),
      author: 'User',
      text,
    });

    renderPosts();
    input.value = ''; 
  });


  newPostBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);

 
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !newPostModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  
  renderPosts();
});