// professional_website/script.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle (Hamburger Menu)
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when a nav link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // 2. Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Handle external links vs. internal smooth scroll
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                // If href is just '#', scroll to top of document
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                // Get the navbar height dynamically
                const navbar = document.getElementById('navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0; // Default to 0 if navbar not found

                // Calculate scroll position, accounting for fixed navbar
                const elementPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - navbarHeight - 10; // Add a small extra offset for spacing

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // 3. Dynamic Navbar (Sticky and potentially add a class on scroll)
    const navbar = document.getElementById('navbar');
    const scrollThreshold = 50; // Pixels to scroll before adding 'scrolled' class

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > scrollThreshold) {
                navbar.classList.add('scrolled'); // Add a class for styling changes if desired
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 4. Back to Top Button (Add HTML for #back-to-top-btn in your index.html)
    // Example HTML for the button (add this before the closing </body> tag):
    // <button id="back-to-top-btn" title="Go to top">
    //     <i class="fas fa-arrow-up"></i>
    // </button>
    // And add CSS for it (e.g., professional_website/style.css):
    // #back-to-top-btn {
    //     display: none; /* Hidden by default */
    //     position: fixed; /* Fixed position */
    //     bottom: 20px; /* Place at the bottom */
    //     right: 20px; /* Place at the right */
    //     z-index: 99; /* High z-index to be on top */
    //     font-size: 18px; /* Increase font size */
    //     border: none; /* Remove borders */
    //     outline: none; /* Remove outline */
    //     background-color: var(--primary-blue); /* Set a background color */
    //     color: white; /* Text color */
    //     cursor: pointer; /* Add a mouse pointer on hover */
    //     padding: 15px; /* Some padding */
    //     border-radius: 50%; /* Rounded corners */
    //     opacity: 0.8;
    //     transition: opacity 0.3s ease, transform 0.3s ease;
    //     box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    // }
    // #back-to-top-btn:hover {
    //     opacity: 1;
    //     transform: translateY(-2px);
    // }

    const backToTopButton = document.getElementById('back-to-top-btn');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) { // Show button after scrolling 300px
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    // 5. Custom Message Box Functionality
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const messageCloseBtn = document.getElementById('message-close');

    function showMessage(message, type = 'info') { // 'info', 'success', 'error'
        if (messageBox && messageText) {
            messageText.textContent = message;
            messageBox.className = 'message-box'; // Reset classes
            messageBox.classList.add(type); // Add type class for styling (e.g., .message-box.error)
            messageBox.classList.add('show');
            // Hide after 5 seconds if not explicitly closed
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


    // 6. Form Handling (Contact Form & Testimonial Form)

    // Contact Form Submission (Assuming 'lets-connect' is the form ID)
    const contactForm = document.getElementById('contact-form'); // Assuming you'll add id="contact-form" to your form
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

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

            // --- Integrate with a backend service like Formspree or your custom API ---
            // For Formspree, change the form 'action' attribute in HTML to your Formspree endpoint
            // <form id="contact-form" action="https://formspree.io/f/your_form_id" method="POST">
            try {
                // Example using fetch for Formspree or your own API endpoint
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: new FormData(contactForm), // Use FormData to easily send form data
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    showMessage('Message sent successfully! Thank you.', 'success');
                    contactForm.reset(); // Clear form fields
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

    // Testimonial Form & Display (Client-side only for demonstration)
    const testimonialForm = document.getElementById('testimonial-form'); // Assuming you'll add id="testimonial-form" to your form
    const testimonialsContainer = document.getElementById('testimonials-container'); // Assuming a div to display testimonials

    let testimonials = JSON.parse(localStorage.getItem('userTestimonials')) || []; // Load from local storage

    function renderTestimonials() {
        if (testimonialsContainer) {
            testimonialsContainer.innerHTML = ''; // Clear existing testimonials
            if (testimonials.length === 0) {
                testimonialsContainer.innerHTML = '<p class="no-testimonials">No testimonials yet. Be the first to add one!</p>';
                return;
            }
            testimonials.forEach((t, index) => {
                const testimonialCard = document.createElement('div');
                testimonialCard.classList.add('testimonial-card');
                testimonialCard.innerHTML = `
                    <p class="testimonial-text">"${t.message}"</p>
                    <p class="testimonial-author">- ${t.author}</p>
                    <p class="testimonial-rating">Rating: ${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</p>
                    <button class="delete-testimonial" data-index="${index}"><i class="fas fa-trash"></i> Delete</button>
                `;
                testimonialsContainer.appendChild(testimonialCard);
            });
            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-testimonial').forEach(button => {
                button.addEventListener('click', function() {
                    const indexToDelete = parseInt(this.dataset.index);
                    deleteTestimonial(indexToDelete);
                });
            });
        }
    }

    function deleteTestimonial(index) {
        testimonials.splice(index, 1);
        localStorage.setItem('userTestimonials', JSON.stringify(testimonials));
        showMessage('Testimonial deleted successfully.', 'info');
        renderTestimonials();
    }

    if (testimonialForm) {
        testimonialForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const author = testimonialForm.querySelector('[name="testimonial-author"]').value.trim();
            const message = testimonialForm.querySelector('[name="testimonial-message"]').value.trim();
            const rating = parseInt(testimonialForm.querySelector('[name="testimonial-rating"]').value);

            if (!author || !message || isNaN(rating) || rating < 1 || rating > 5) {
                showMessage('Please provide your name, a message, and a rating (1-5 stars).', 'error');
                return;
            }

            const newTestimonial = { author, message, rating, date: new Date().toISOString() };
            testimonials.push(newTestimonial);
            localStorage.setItem('userTestimonials', JSON.stringify(testimonials)); // Save to local storage
            showMessage('Thank you for your feedback!', 'success');
            testimonialForm.reset();
            renderTestimonials(); // Re-render testimonials
        });
        renderTestimonials(); // Initial render on page load
    }


    // 7. Dynamic Content

    // Set Current Year in Footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Animate Skill Progress Bars on Scroll
    const skillBars = document.querySelectorAll('.skill-bar');
    const skillsSection = document.getElementById('skills'); // The section containing skills

    const animateSkills = () => {
        if (skillsSection) {
            const sectionTop = skillsSection.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            // Trigger animation when section is in view (e.g., 80% of section is visible)
            if (sectionTop < windowHeight * 0.8) {
                skillBars.forEach(bar => {
                    const percent = bar.style.width; // Get the width from CSS (e.g., "95%")
                    bar.style.width = '0%'; // Reset to 0 for animation
                    // Use setTimeout to allow CSS to register the 0% before animating
                    setTimeout(() => {
                        bar.style.width = percent; // Animate to the actual percentage
                    }, 100);
                });
                // Remove the event listener after animating to prevent re-triggering
                window.removeEventListener('scroll', animateSkills);
            }
        }
    };

    window.addEventListener('scroll', animateSkills);
    animateSkills(); // Run once on load in case skills section is in view immediately

    // 8. Dark Mode Toggle
    // Add a button in your HTML (e.g., in navbar or footer):
    // <button id="dark-mode-toggle" class="dark-mode-toggle-btn" title="Toggle dark mode">
    //     <i class="fas fa-moon"></i>
    // </button>
    // And some basic CSS for the button in style.css if you want:
    // .dark-mode-toggle-btn {
    //     background: none;
    //     border: none;
    //     color: var(--white-bg); /* Or appropriate color */
    //     font-size: 1.5rem;
    //     cursor: pointer;
    //     transition: color 0.3s ease;
    // }
    // .dark-mode-toggle-btn:hover {
    //     color: var(--accent-blue-light);
    // }
    // .dark-mode-toggle-btn .fas.fa-sun { display: none; } /* Hide sun by default */
    // .dark-mode .dark-mode-toggle-btn .fas.fa-moon { display: none; } /* Hide moon in dark mode */
    // .dark-mode .dark-mode-toggle-btn .fas.fa-sun { display: inline-block; } /* Show sun in dark mode */

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Check for user's preferred theme or saved preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.classList.add(currentTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark-mode');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            // Save preference to local storage
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark-mode');
            } else {
                localStorage.removeItem('theme'); // Or set to 'light-mode'
            }
        });
    }

    // Optional: Project Card Hover Effect (already handled by CSS, but good to note JS could do this)
    // You have nice CSS transitions for .project-card:hover .project-image img already!

});

// Function to handle showing/hiding testimonials from local storage
// (This is a helper and might be integrated directly into renderTestimonials later)
function getStoredTestimonials() {
    try {
        const stored = localStorage.getItem('userTestimonials');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Error parsing testimonials from localStorage:", e);
        return [];
    }
}

function saveTestimonials(testimonialsArray) {
    try {
        localStorage.setItem('userTestimonials', JSON.stringify(testimonialsArray));
    } catch (e) {
        console.error("Error saving testimonials to localStorage:", e);
    }
}