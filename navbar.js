
document.addEventListener('DOMContentLoaded', function () {

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
        enablePageTransition(); 
      }
    })
    .catch(error => {
      console.error('Navbar loading error:', error);
    });


  document.body.classList.add('fade-in');
});


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

