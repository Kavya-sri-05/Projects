// Check authentication status
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    const protectedPages = ['dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !currentUser) {
        window.location.href = 'login.html';
    }
}

// Sample blog posts data
const blogPosts = [
    {
        id: 1,
        title: "Getting Started with Web Development",
        content: "Learn the basics of HTML, CSS, and JavaScript to kickstart your web development journey.",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
        author: "John Doe",
        date: "March 20, 2024",
        category: "Technology",
        likes: 0,
        comments: []
    },
    {
        id: 2,
        title: "Essential Travel Tips for 2024",
        content: "Discover the best travel hacks and destinations for your next adventure.",
        image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
        author: "Jane Smith",
        date: "March 18, 2024",
        category: "Travel",
        likes: 0,
        comments: []
    },
    {
        id: 3,
        title: "Healthy Living Guide",
        content: "Tips and tricks for maintaining a healthy lifestyle in the modern world.",
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
        author: "Mike Johnson",
        date: "March 15, 2024",
        category: "Lifestyle",
        likes: 0,
        comments: []
    }
];

// Display blog posts in grid
function displayPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
        postsContainer.innerHTML = blogPosts.map(post => `
            <div class="blog-post">
                <img src="${post.image}" alt="${post.title}">
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <p class="post-meta">By ${post.author} | ${post.date} | ${post.category}</p>
                    <p>${post.content}</p>
                    <div class="post-actions">
                        <button onclick="likePost(${post.id})">
                            <i class="fas fa-heart"></i> ${post.likes}
                        </button>
                        <button onclick="showComments(${post.id})">
                            <i class="fas fa-comment"></i> ${post.comments.length}
                        </button>
                        <button onclick="readMore(${post.id})">Read More</button>
                    </div>
                    <div class="comments-section" id="comments-${post.id}" style="display: none;">
                        <div class="comments-list">
                            ${post.comments.map(comment => `
                                <div class="comment">
                                    <strong>${comment.user}</strong>
                                    <p>${comment.text}</p>
                                </div>
                            `).join('')}
                        </div>
                        <form onsubmit="addComment(event, ${post.id})">
                            <input type="text" placeholder="Add a comment..." required>
                            <button type="submit">Post</button>
                        </form>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Search functionality
function searchPosts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredPosts = blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) || 
        post.content.toLowerCase().includes(searchTerm) ||
        post.category.toLowerCase().includes(searchTerm)
    );
    
    const postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
        postsContainer.innerHTML = filteredPosts.map(post => `
            <div class="blog-post">
                <img src="${post.image}" alt="${post.title}">
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <p class="post-meta">By ${post.author} | ${post.date} | ${post.category}</p>
                    <p>${post.content}</p>
                    <button onclick="readMore(${post.id})">Read More</button>
                </div>
            </div>
        `).join('');
    }
}

// Like post functionality
function likePost(postId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const post = blogPosts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        displayPosts();
    }
}

// Show/hide comments
function showComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
    }
}

// Add comment functionality
function addComment(event, postId) {
    event.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const post = blogPosts.find(p => p.id === postId);
    const commentInput = event.target.querySelector('input');
    
    if (post && commentInput.value.trim()) {
        post.comments.push({
            user: currentUser.name,
            text: commentInput.value.trim()
        });
        commentInput.value = '';
        displayPosts();
    }
}

// Newsletter subscription
document.getElementById('newsletterForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    alert(`Thank you for subscribing with: ${email}`);
    this.reset();
});

// Contact form submission
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});

// Read more functionality
function readMore(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (post) {
        // You can implement a modal or redirect to a full post page
        alert(`Reading full article: ${post.title}`);
    }
}

// Filter posts by category
function filterByCategory(category) {
    const filteredPosts = category === 'all' 
        ? blogPosts 
        : blogPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
    
    const postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
        postsContainer.innerHTML = filteredPosts.map(/* same post template as displayPosts */);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    displayPosts();
});