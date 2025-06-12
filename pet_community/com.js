document.addEventListener('DOMContentLoaded', () => {
  const postList = document.getElementById('postList');
  const newPostBtn = document.getElementById('newPostBtn');
  const newPostModal = document.getElementById('newPostModal');
  const closeModalBtn = newPostModal.querySelector('.close');
  const newPostForm = document.getElementById('newPostForm');
  const postCaptionInput = document.getElementById('postCaption');
  const postImagesInput = document.getElementById('postImages');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const currentUserEl = document.getElementById('currentUser');
  const changeUsernameBtn = document.getElementById('changeUsernameBtn');

  function escapeHtml(text) {
    if (typeof text !== "string") return "";
    return text.replace(/[&<>"']/g, (m) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] || m)
    );
  }

  function createImageSlider(images) {
    return `<div class="image-slider">${images.map(src => `<img src="${src}" alt="Post image" loading="lazy" />`).join('')}</div>`;
  }

  function createPostElement(post) {
    const postEl = document.createElement('div');
    postEl.classList.add('post');
    postEl.dataset.id = post.id;
    postEl.innerHTML = `
      <div class="post-header">
        <div>
          <span class="post-author">${escapeHtml(post.author)}</span> 
          <span class="post-date">${new Date(post.date).toLocaleString()}</span>
        </div>
        <div class="menu-container">
          <i class="fas fa-ellipsis-v menu-icon"></i>
          <div class="menu-dropdown">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
      <div class="post-content">${escapeHtml(post.caption)}</div>
      ${post.images.length ? createImageSlider(post.images) : ''}
      <div class="post-actions">
        <button class="action-btn like-btn ${post.liked ? 'liked' : ''}" data-id="${post.id}">
          <i class="fas fa-heart"></i> <span class="like-count">${post.likes}</span>
        </button>
        <button class="action-btn comment-toggle-btn">
          <i class="fas fa-comment"></i> <span class="comment-count">${post.comments.length}</span>
        </button>
      </div>
      <div class="comments-section hidden">
        <div class="comments-list">
          ${post.comments.map(c => `<div class="comment"><b>${escapeHtml(c.author)}:</b> ${escapeHtml(c.text)}</div>`).join('')}
        </div>
        <form class="comment-input">
          <input type="text" placeholder="Add a comment..." required />
          <button type="submit">Send</button>
        </form>
      </div>`;
    return postEl;
  }

  function renderPosts(posts) {
    postList.innerHTML = '';
    posts.forEach(post => postList.appendChild(createPostElement(post)));
  }

  function loadPosts() {
    fetch('get_posts.php')
      .then(res => res.json())
      .then(renderPosts)
      .catch(err => console.error('Error loading posts:', err));
  }

  function openModal() {
    newPostModal.classList.remove('hidden');
    postCaptionInput.focus();
  }

  function closeModal() {
    newPostModal.classList.add('hidden');
    newPostForm.reset();
    imagePreviewContainer.innerHTML = '';
  }

  function previewSelectedImages(files) {
    imagePreviewContainer.innerHTML = '';
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-image';
        imagePreviewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }

  newPostForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('caption', postCaptionInput.value.trim());

    Array.from(postImagesInput.files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} exceeds 10MB limit.`);
        return;
      }
      formData.append('images[]', file);
    });

    fetch('upload_post.php', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          loadPosts();
          closeModal();
        } else {
          alert('Post upload failed.');
        }
      })
      .catch(err => console.error('Upload error:', err));
  });

  postList.addEventListener('click', (e) => {
    const postEl = e.target.closest('.post');
    if (!postEl) return;

    if (e.target.closest('.comment-toggle-btn')) {
      postEl.querySelector('.comments-section').classList.toggle('hidden');
    }

    if (e.target.closest('.like-btn')) {
      const btn = e.target.closest('.like-btn');
      const postId = btn.dataset.id;
      const formData = new FormData();
      formData.append('post_id', postId);

      fetch('like_post.php', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          btn.classList.toggle('liked', data.liked);
          btn.querySelector('.like-count').textContent = data.likes;
        });
    }

    if (e.target.classList.contains('menu-icon')) {
      const dropdown = e.target.nextElementSibling;
      dropdown.classList.toggle('show');
      return;
    }

    if (e.target.classList.contains('delete-btn')) {
      const postId = postEl.dataset.id;
      if (!confirm('Are you sure you want to delete this post?')) return;

      const formData = new FormData();
      formData.append('post_id', postId);

      fetch('delete_post.php', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) loadPosts();
          else alert('Delete failed.');
        });
    }

    if (e.target.classList.contains('edit-btn')) {
      const postId = postEl.dataset.id;
      const oldCaption = postEl.querySelector('.post-content').textContent;
      const newCaption = prompt("Edit your post caption:", oldCaption);
      if (newCaption === null) return;

      const formData = new FormData();
      formData.append('post_id', postId);
      formData.append('caption', newCaption);

      fetch('edit_post.php', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) loadPosts();
          else alert('Edit failed.');
        });
    }
  });

  postList.addEventListener('submit', (e) => {
    if (!e.target.classList.contains('comment-input')) return;
    e.preventDefault();

    const input = e.target.querySelector('input');
    const text = input.value.trim();
    const postId = e.target.closest('.post').dataset.id;
    if (!text) return;

    const formData = new FormData();
    formData.append('post_id', postId);
    formData.append('text', text);

    fetch('add_comment.php', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) loadPosts();
      });

    input.value = '';
  });

  postImagesInput.addEventListener('change', () => {
    previewSelectedImages(postImagesInput.files);
  });

  newPostBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  changeUsernameBtn.addEventListener('click', () => {
    const name = prompt("Enter your new username:");
    if (!name) return;
    fetch('update_username.php', {
      method: 'POST',
      body: new URLSearchParams({ username: name })
    })
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          currentUserEl.textContent = data.username;
          loadPosts();
        }
      });
  });

  // ✅ Fetch username without modifying it
  fetch('get_username.php')
    .then(res => res.json())
    .then(data => {
      if (data.username) {
        currentUserEl.textContent = data.username;
      }
    });

  loadPosts();
});
