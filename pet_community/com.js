--- JavaScript: com.js ---
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

    let currentUsername = 'User';

    async function fetchWithErrorHandling(url, options = {}) {
        try {
            if (!options.headers) options.headers = {};
            options.headers['Accept'] = 'application/json';

            const response = await fetch(url, options);
            if (response.status === 204) return null;

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Invalid content-type. Received: ${contentType || 'none'}`);
            }

            const data = await response.json();
            if (response.status >= 400) {
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error(`Fetch error for ${url}:`, error);
            throw error;
        }
    }

    function showError(msg) {
        alert(msg);
    }

    async function loadUsername() {
        const res = await fetchWithErrorHandling('get_username.php');
        currentUsername = res.username;
        currentUserEl.textContent = currentUsername;
    }

    changeUsernameBtn.addEventListener('click', async () => {
        const newName = prompt('Enter new username:', currentUsername);
        if (newName && newName !== currentUsername) {
            const res = await fetchWithErrorHandling('update_username.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `username=${encodeURIComponent(newName)}`
            });
            currentUsername = res.username;
            currentUserEl.textContent = currentUsername;
        }
    });

    newPostBtn.addEventListener('click', () => {
        newPostModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        newPostModal.style.display = 'none';
        newPostForm.reset();
        imagePreviewContainer.innerHTML = '';
    });

    postImagesInput.addEventListener('change', () => {
        imagePreviewContainer.innerHTML = '';
        Array.from(postImagesInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = document.createElement('img');
                img.src = reader.result;
                img.className = 'preview-img';
                imagePreviewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    newPostForm.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(newPostForm);
        const res = await fetchWithErrorHandling('upload_post.php', {
            method: 'POST',
            body: formData
        });
        newPostModal.style.display = 'none';
        newPostForm.reset();
        imagePreviewContainer.innerHTML = '';
        await loadPosts();
    });

    async function loadPosts() {
        const res = await fetchWithErrorHandling('get_posts.php');
        postList.innerHTML = '';

        res.posts.forEach(post => {
            const div = document.createElement('div');
            div.className = 'post';
            div.dataset.id = post.id;

            let imagesHTML = '';
            post.images.forEach(src => {
                imagesHTML += `<img src="${src}" class="post-image">`;
            });

            let commentsHTML = '';
            post.comments.forEach(comment => {
                commentsHTML += `<div class="comment"><strong>${comment.author}</strong>: ${comment.text}</div>`;
            });

            div.innerHTML = `
                <div class="post-header">
                    <strong>${post.author}</strong> · ${new Date(post.date).toLocaleString()}
                    <div class="post-actions">
                        <button class="edit-post">✏️</button>
                        <button class="delete-post">🗑️</button>
                    </div>
                </div>
                <p class="post-caption">${post.caption}</p>
                <div class="post-images">${imagesHTML}</div>
                <div class="post-footer">
                    <button class="like-post ${post.liked ? 'liked' : ''}">❤️ ${post.likes}</button>
                </div>
                <div class="post-comments">
                    ${commentsHTML}
                    <input class="comment-input" type="text" placeholder="Write a comment...">
                </div>
            `;

            postList.appendChild(div);
        });
    }

    postList.addEventListener('click', async e => {
        const postEl = e.target.closest('.post');
        if (!postEl) return;
        const postId = postEl.dataset.id;

        if (e.target.classList.contains('like-post')) {
            const liked = e.target.classList.contains('liked');
            const res = await fetchWithErrorHandling('like_post.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `post_id=${postId}&liked=${liked}`
            });
            e.target.classList.toggle('liked');
            e.target.textContent = `❤️ ${res.likes}`;
        } else if (e.target.classList.contains('edit-post')) {
            const captionEl = postEl.querySelector('.post-caption');
            const newCaption = prompt('Edit caption:', captionEl.textContent);
            if (newCaption) {
                await fetchWithErrorHandling('edit_post.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `post_id=${postId}&caption=${encodeURIComponent(newCaption)}`
                });
                await loadPosts();
            }
        } else if (e.target.classList.contains('delete-post')) {
            if (confirm('Delete this post?')) {
                await fetchWithErrorHandling('delete_post.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `post_id=${postId}`
                });
                await loadPosts();
            }
        }
    });

    postList.addEventListener('keypress', async e => {
        if (e.target.classList.contains('comment-input') && e.key === 'Enter') {
            const text = e.target.value.trim();
            if (text) {
                const postEl = e.target.closest('.post');
                const postId = postEl.dataset.id;
                await fetchWithErrorHandling('add_comment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `post_id=${postId}&text=${encodeURIComponent(text)}`
                });
                await loadPosts();
            }
        }
    });

    loadUsername();
    loadPosts();
});

--- SQL Structure ---

CREATE TABLE user_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL
);

INSERT INTO user_profile (username) VALUES ('User');

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    caption TEXT NOT NULL,
    images TEXT,
    date DATETIME NOT NULL,
    likes INT DEFAULT 0
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
