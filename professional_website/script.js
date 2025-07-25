// professional_website/script.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle (Hamburger Menu) - No change
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // 2. Smooth Scrolling for Navigation Links - No change
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const navbar = document.getElementById('navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const elementPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - navbarHeight - 10;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Dynamic Navbar - No change
    const navbar = document.getElementById('navbar');
    const scrollThreshold = 50;

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > scrollThreshold) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 4. Back to Top Button - No change (assuming HTML/CSS are added)
    const backToTopButton = document.getElementById('back-to-top-btn');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 5. Custom Message Box Functionality - No change
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const messageCloseBtn = document.getElementById('message-close');

    function showMessage(message, type = 'info') {
        if (messageBox && messageText) {
            messageText.textContent = message;
            messageBox.className = 'message-box'; // Reset classes
            messageBox.classList.add(type);
            messageBox.classList.add('show');
            setTimeout(() => {
                hideMessage();
            }, 5000);
        }
    }

    function hideMessage() {
        if (messageBox) {
            messageBox.classList.remove('show');
        }
    }

    if (messageCloseBtn) {
        messageCloseBtn.addEventListener('click', hideMessage);
    }

    // 6. Form Handling (Contact Form) - No change
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = contactForm.querySelector('[name="name"]').value.trim();
            const email = contactForm.querySelector('[name="email"]').value.trim();
            const message = contactForm.querySelector('[name="message"]').value.trim();

            if (!name || !email || !message) {
                showMessage('Please fill in all fields.', 'error');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }

            showMessage('Sending your message...', 'info');

            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: new FormData(contactForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    showMessage('Message sent successfully! Thank you.', 'success');
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        showMessage(data.errors.map(error => error.message).join(', '), 'error');
                    } else {
                        showMessage('Failed to send message. Please try again later.', 'error');
                    }
                }
            } catch (error) {
                console.error('Error submitting contact form:', error);
                showMessage('There was a network error. Please try again.', 'error');
            }
        });
    }

    // --- REVISED: Testimonial Form & Display (Now interacts with a hypothetical Backend API) ---
    const testimonialForm = document.getElementById('testimonial-form');
    const testimonialsContainer = document.getElementById('testimonials-container');

    // Function to fetch testimonials from the backend
    async function fetchTestimonials() {
        if (!testimonialsContainer) return; // Exit if container not found
        testimonialsContainer.innerHTML = '<p class="loading-message">Loading testimonials...</p>'; // Loading state

        try {
            // Replace '/api/testimonials' with your actual backend endpoint
            const response = await fetch('/api/testimonials');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const testimonials = await response.json();
            renderTestimonials(testimonials); // Render fetched testimonials
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            testimonialsContainer.innerHTML = '<p class="error-message">Failed to load testimonials. Please try again later.</p>';
            showMessage('Could not load testimonials. Check your connection.', 'error');
        }
    }

    // Function to render testimonials
    function renderTestimonials(testimonials) {
        if (testimonialsContainer) {
            testimonialsContainer.innerHTML = ''; // Clear existing testimonials
            if (!testimonials || testimonials.length === 0) {
                testimonialsContainer.innerHTML = '<p class="no-testimonials">No testimonials yet. Be the first to add one!</p>';
                return;
            }
            testimonials.forEach(t => {
                const testimonialCard = document.createElement('div');
                testimonialCard.classList.add('testimonial-card');
                testimonialCard.innerHTML = `
                    <p class="testimonial-text">"${t.message}"</p>
                    <p class="testimonial-author">- ${t.author}</p>
                    <p class="testimonial-rating">Rating: ${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</p>
                    ${t.date ? `<span class="testimonial-date">${new Date(t.date).toLocaleDateString()}</span>` : ''}
                    `;
                testimonialsContainer.appendChild(testimonialCard);
            });
        }
    }

    // Handle Testimonial Form Submission
    if (testimonialForm) {
        testimonialForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const author = testimonialForm.querySelector('[name="testimonial-author"]').value.trim();
            const message = testimonialForm.querySelector('[name="testimonial-message"]').value.trim();
            const rating = parseInt(testimonialForm.querySelector('[name="testimonial-rating"]').value);

            if (!author || !message || isNaN(rating) || rating < 1 || rating > 5) {
                showMessage('Please provide your name, a message, and a rating (1-5 stars).', 'error');
                return;
            }

            showMessage('Submitting your testimonial...', 'info');

            try {
                // Replace '/api/testimonials' with your actual backend endpoint for POST
                const response = await fetch('/api/testimonials', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ author, message, rating })
                });

                if (response.ok) {
                    showMessage('Thank you for your feedback! Testimonial submitted.', 'success');
                    testimonialForm.reset();
                    fetchTestimonials(); // Re-fetch all testimonials to show the new one
                } else {
                    const errorData = await response.json(); // Assuming backend sends JSON errors
                    showMessage(`Failed to submit testimonial: ${errorData.message || 'Server error'}`, 'error');
                }
            } catch (error) {
                console.error('Error submitting testimonial:', error);
                showMessage('There was a network error. Please try again.', 'error');
            }
        });
    }

    // Initial fetch of testimonials when the page loads
    fetchTestimonials();


    // 7. Dynamic Content

    // Set Current Year in Footer - No change
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Animate Skill Progress Bars on Scroll - No change
    const skillBars = document.querySelectorAll('.skill-bar');
    const skillsSection = document.getElementById('skills');

    const animateSkills = () => {
        if (skillsSection) {
            const sectionTop = skillsSection.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (sectionTop < windowHeight * 0.8) {
                skillBars.forEach(bar => {
                    const percent = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = percent;
                    }, 100);
                });
                window.removeEventListener('scroll', animateSkills);
            }
        }
    };

    window.addEventListener('scroll', animateSkills);
    animateSkills();

    // 8. Dark Mode Toggle - No change (assuming HTML/CSS are added)
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.classList.add(currentTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-mode');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark-mode');
            } else {
                localStorage.removeItem('theme');
            }
        });
    }

});