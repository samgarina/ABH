document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch and inject the global navbar HTML
    fetch('./navbar.html')
        .then(res => {
            if (!res.ok) throw new Error('Status code: ' + res.status);
            return res.text();
        })
        .then(htmlMarkup => {
            document.getElementById('global-navbar').innerHTML = htmlMarkup;
        })
        .catch(err => console.error('Error fetching global navbar:', err));

    // 2. Activate page visual fade-ins
    const components = document.querySelectorAll('.fade-in-element');
    components.forEach(el => {
        el.classList.add('active');
    });
});