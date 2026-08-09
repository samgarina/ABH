const FORM_ENDPOINT = 'https://formspree.io/f/mljrgypb'; // REPLACE_WITH_YOUR_FORM_ID

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const statusEl = document.getElementById('form-status');
    const submitBtn = form.querySelector('.contact-submit-btn');
    const submitLabel = submitBtn.querySelector('.btn-label');

    const setStatus = (message, type) => {
        statusEl.textContent = message;
        statusEl.className = 'form-status' + (type ? ' ' + type : '');
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        setStatus('', '');

        // Basic client-side validation (server/Formspree also validates)
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();

        if (!name || !email || !message) {
            setStatus('Please fill in your name, email, and message.', 'error');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStatus('Please enter a valid email address.', 'error');
            return;
        }

        if (FORM_ENDPOINT.includes('REPLACE_WITH_YOUR_FORM_ID')) {
            setStatus('Contact form isn\u2019t connected yet \u2014 please email us directly at asturiasbeachhouse@gmail.com in the meantime.', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitLabel.textContent = 'SENDING...';

        try {
            const response = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(form)
            });

            if (response.ok) {
                form.reset();
                setStatus('Thank you! Your message has been sent \u2014 we\u2019ll get back to you soon.', 'success');
            } else {
                const data = await response.json().catch(() => null);
                const errMsg = data && data.errors
                    ? data.errors.map(err => err.message).join(', ')
                    : 'Something went wrong. Please try again or email us directly.';
                setStatus(errMsg, 'error');
            }
        } catch (err) {
            setStatus('Network error \u2014 please check your connection and try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitLabel.textContent = 'SEND MESSAGE';
        }
    });
});
