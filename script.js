// Smooth scrolling for nav links
document.querySelectorAll('a.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Contact form alert
document.querySelector("form").addEventListener("submit", function(e){
    e.preventDefault();
    alert("Message sent successfully!");
});
