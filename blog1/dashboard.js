// Handle file upload preview
document.getElementById('media-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = '';
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.appendChild(img);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = e.target.result;
                video.controls = true;
                preview.appendChild(video);
            }
        }
        reader.readAsDataURL(file);
    }
});

// Sample user posts data
const userPosts = [
    {
        title: "My First Blog Post",
        content: "This is my first post on Modern Blog!",
        image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8",
        date: "March 20, 2024"
    }
];

// Sample recommended posts
const recommendedPosts = [
    {
        title: "10 Tips for Better Writing",
        excerpt: "Improve your writing skills with these tips.",
        image: "https://images.unsplash.com/photo-1455390582262-044cdead277a"
    },
    {
        title: "Photography Basics",
        excerpt: "Learn the fundamentals of photography.",
        image: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848"
    }
];

// Display user posts
function displayUserPosts() {
    const postsContainer = document.querySelector('.posts-container');
    postsContainer.innerHTML = userPosts.map(post => `
        <div class="post-card">
            <img src="${post.image}" alt="${post.title}">
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <small>${post.date}</small>
        </div>
    `).join('');
}

// Display recommended posts
function displayRecommendedPosts() {
    const recommendedContainer = document.querySelector('.recommended-posts');
    recommendedContainer.innerHTML = recommendedPosts.map(post => `
        <div class="post-card">
            <img src="${post.image}" alt="${post.title}">
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
        </div>
    `).join('');
}

// Handle post form submission
document.getElementById('postForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = this.querySelector('input[type="text"]').value;
    const content = this.querySelector('textarea').value;
    const file = document.getElementById('media-file').files[0];

    // Add new post to userPosts array
    userPosts.unshift({
        title,
        content,
        image: file ? URL.createObjectURL(file) : null,
        date: new Date().toLocaleDateString()
    });

    // Refresh posts display
    displayUserPosts();
    this.reset();
    document.getElementById('preview').innerHTML = '';
});

// Initialize dashboard
window.onload = function() {
    displayUserPosts();
    displayRecommendedPosts();
};
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
    }
});
