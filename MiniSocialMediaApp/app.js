document.addEventListener('DOMContentLoaded', () => {
    // Check for logged in user
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        window.location.href = 'index.html';
        return;
    }

    // DOM Elements
    const userNameEl = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const createPostForm = document.getElementById('create-post-form');
    const postTextEl = document.getElementById('post-text');
    const postImageFileEl = document.getElementById('post-image-file');
    const createPostFileNameEl = document.getElementById('create-post-file-name');
    const feed = document.getElementById('feed');
    const searchBar = document.getElementById('search-bar');
    const sortLatestBtn = document.getElementById('sort-latest');
    const sortOldestBtn = document.getElementById('sort-oldest');
    const sortMostLikedBtn = document.getElementById('sort-most-liked');
    const editModal = document.getElementById('edit-post-modal');
    const editPostTextEl = document.getElementById('edit-post-text');
    const editPostImageFileEl = document.getElementById('edit-post-image-file');
    const editPostFileNameEl = document.getElementById('edit-post-file-name');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const messagesToggleBtn = document.getElementById('messages-toggle');
    const messagesPanel = document.getElementById('messages-panel');
    
    // App State
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    let currentSort = 'latest';
    let currentSearchTerm = '';
    let postToEditId = null;

    // --- Functions ---

    const savePosts = () => {
        localStorage.setItem('posts', JSON.stringify(posts));
    };

    const renderPosts = () => {
        feed.innerHTML = '';
        let filteredPosts = posts.filter(post => 
            post.text.toLowerCase().includes(currentSearchTerm.toLowerCase())
        );

        if (currentSort === 'latest') {
            filteredPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else if (currentSort === 'oldest') {
            filteredPosts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        } else if (currentSort === 'most-liked') {
            filteredPosts.sort((a, b) => b.likes - a.likes);
        }

        filteredPosts.forEach(post => {
            const postElement = createPostElement(post);
            feed.appendChild(postElement);
        });
    };

    const createPostElement = (post) => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.dataset.id = post.id;
        const likedClass = post.likedBy.includes(loggedInUser.email) ? 'liked' : '';

        postDiv.innerHTML = `
            <div class="post-header">
                <span class="post-author">${post.author}</span>
                <span class="post-timestamp">${new Date(post.timestamp).toLocaleString()}</span>
            </div>
            <div class="post-content">
                <p>${post.text}</p>
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" class="post-image">` : ''}
            </div>
            <div class="post-actions">
                <div class="left-actions">
                    <button class="like-btn ${likedClass}"><i class="fas fa-heart"></i></button>
                    <span class="likes-count">${post.likes} Likes</span>
                </div>
                <div class="right-actions">
                    ${post.authorEmail === loggedInUser.email ? `
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                    ` : ''}
                </div>
            </div>
        `;
        return postDiv;
    };
    
    const openEditModal = (post) => {
        postToEditId = post.id;
        editPostTextEl.value = post.text;
        editPostFileNameEl.textContent = '';
        editPostImageFileEl.value = '';
        editModal.classList.remove('hidden');
    };

    const closeEditModal = () => {
        postToEditId = null;
        editModal.classList.add('hidden');
    };
    
    const setTheme = (theme) => {
        document.body.dataset.theme = theme;
        localStorage.setItem('theme', theme);
        themeToggleBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    };

    const processPostCreation = (imageUrl = '') => {
        const newPost = {
            id: Date.now().toString(),
            author: loggedInUser.name,
            authorEmail: loggedInUser.email,
            text: postTextEl.value,
            imageUrl: imageUrl,
            timestamp: new Date().toISOString(),
            likes: 0,
            likedBy: [],
        };
        posts.unshift(newPost);
        savePosts();
        renderPosts();
        createPostForm.reset();
        createPostFileNameEl.textContent = '';
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Posted successfully!',
            showConfirmButton: false,
            timer: 2000
        });
    };

    // --- Event Listeners ---

    postImageFileEl.addEventListener('change', () => {
        createPostFileNameEl.textContent = postImageFileEl.files.length > 0 ? postImageFileEl.files[0].name : '';
    });

    editPostImageFileEl.addEventListener('change', () => {
        editPostFileNameEl.textContent = editPostImageFileEl.files.length > 0 ? editPostImageFileEl.files[0].name : '';
    });

    logoutBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Are you sure you want to logout?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, logout!',
            cancelButtonText: 'No, stay'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('loggedInUser');
                window.location.href = 'index.html';
            }
        });
    });
    
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.dataset.theme || 'light';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    messagesToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        messagesPanel.classList.toggle('hidden');
    });

    createPostForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const file = postImageFileEl.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => processPostCreation(e.target.result);
            reader.readAsDataURL(file);
        } else {
            processPostCreation();
        }
    });

    feed.addEventListener('click', (e) => {
        const target = e.target;
        const postElement = target.closest('.post');
        if (!postElement) return;

        const postId = postElement.dataset.id;

        if (target.closest('.like-btn')) {
            const postIndex = posts.findIndex(p => p.id === postId);
            if (postIndex > -1) {
                const post = posts[postIndex];
                const userEmail = loggedInUser.email;
                if (post.likedBy.includes(userEmail)) {
                    post.likes--;
                    post.likedBy = post.likedBy.filter(email => email !== userEmail);
                } else {
                    post.likes++;
                    post.likedBy.push(userEmail);
                }
                savePosts();
                renderPosts();
            }
        }

        if (target.closest('.delete-btn')) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    posts = posts.filter(p => p.id !== postId);
                    savePosts();
                    renderPosts();
                    Swal.fire(
                        'Deleted!',
                        'Your post has been deleted.',
                        'success'
                    );
                }
            });
        }

        if (target.closest('.edit-btn')) {
            const post = posts.find(p => p.id === postId);
            openEditModal(post);
        }
    });
    
    saveEditBtn.addEventListener('click', () => {
        const postIndex = posts.findIndex(p => p.id === postToEditId);
        if (postIndex === -1) return;

        const post = posts[postIndex];
        const file = editPostImageFileEl.files[0];

        const updatePost = (newImageUrl) => {
            post.text = editPostTextEl.value;
            if (newImageUrl !== undefined) {
                post.imageUrl = newImageUrl;
            }
            savePosts();
            renderPosts();
            closeEditModal();
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Post updated!',
                showConfirmButton: false,
                timer: 2000
            });
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => updatePost(e.target.result);
            reader.readAsDataURL(file);
        } else {
            updatePost(post.imageUrl); 
        }
    });

    cancelEditBtn.addEventListener('click', closeEditModal);

    searchBar.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        renderPosts();
    });

    sortLatestBtn.addEventListener('click', () => { currentSort = 'latest'; renderPosts(); });
    sortOldestBtn.addEventListener('click', () => { currentSort = 'oldest'; renderPosts(); });
    sortMostLikedBtn.addEventListener('click', () => { currentSort = 'most-liked'; renderPosts(); });

    window.addEventListener('click', (e) => {
        if (!messagesPanel.classList.contains('hidden') && !messagesPanel.contains(e.target)) {
            messagesPanel.classList.add('hidden');
        }
    });

    // --- Initial Load ---
    const initialTheme = localStorage.getItem('theme') || 'light';
    setTheme(initialTheme);
    renderPosts();
    
    // Welcome Toast
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Welcome back, ${loggedInUser.name}!`,
        showConfirmButton: false,
        timer: 3000
    });
});
