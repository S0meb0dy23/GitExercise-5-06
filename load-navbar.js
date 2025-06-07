document.addEventListener('DOMContentLoaded', function () {
  // Load the navbar from navbar.html
  fetch('/navbar.html')
    .then(response => {
      if (!response.ok) throw new Error(`Failed to load navbar: ${response.status}`);
      return response.text();
    })
    .then(html => {
      const container = document.getElementById('navbar-container');
      if (container) {
        container.innerHTML = html;
        highlightCurrentPage();
        enablePageTransition(); // 🔄 Add smooth transition after navbar loads
      }
    })
    .catch(error => {
      console.error('Navbar loading error:', error);
    });

  // Trigger fade-in once content loads
  document.body.classList.add('fade-in');
});

// Highlight the active link in the navbar
function highlightCurrentPage() {
  const navLinks = document.querySelectorAll('.tab-btn');
  const currentPath = window.location.pathname;
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath.endsWith(linkPath)) {
      link.classList.add('active');
    }
  });
}


