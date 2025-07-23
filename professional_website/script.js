document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Configuration ---
    // Ensure firebase is globally available before initializing
    if (typeof firebase === 'undefined' || typeof firebase.apps === 'undefined') {
        console.error("Firebase SDK not loaded. Please ensure firebase-app-compat.js is loaded before your script.js.");
        return; // Exit if Firebase is not available
    }

    const firebaseConfig = {
        apiKey: "AIzaSyBcP7jnbqlWe-AlR0dELcfLMjVcB7_K2kM",
        authDomain: "portfolio-3acf8.firebaseapp.com",
        projectId: "portfolio-3acf8",
        storageBucket: "portfolio-3acf8.appspot.com",
        messagingSenderId: "179236758781",
        appId: "1:179236758781:web:1dbc782177ad446e358a94",
        measurementId: "G-80QWY0TWBQ"
    };

    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();
    const auth = firebase.auth();

    const appId = 'portfolio-3acf8';
    let currentUserId = null;

    // --- Google Sign-In Flow ---
    const provider = new firebase.auth.GoogleAuthProvider();

    // --- Messaging System ---
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const messageCloseBtn = document.getElementById('message-close');

    function showMessage(message, type = 'success') {
        if (messageBox && messageText) {
            messageText.textContent = message;
            // Add 'show' class and the 'type' (e.g., 'success', 'error') for styling
            messageBox.className = `message-box show ${type}`;
        }
    }

    if (messageCloseBtn) {
        messageCloseBtn.addEventListener('click', () => {
            if (messageBox) messageBox.classList.remove('show');
        });
    }

    if (messageBox) {
        // Close message box if clicking outside the content area
        messageBox.addEventListener('click', (event) => {
            if (event.target === messageBox) {
                messageBox.classList.remove('show');
            }
        });
    }

    // --- Authentication Functions ---
    // Using signInWithRedirect instead of signInWithPopup to avoid popup blockers
    function signInWithGoogle() {
        auth.signInWithRedirect(provider)
            .catch(error => {
                // Errors during redirect are usually handled after the redirect
                console.error("Google Sign-In Redirect Error:", error);
                showMessage(`Authentication failed: ${error.message}`, 'error');
            });
    }

    function signOutUser() {
        auth.signOut()
            .then(() => {
                showMessage('Signed out successfully.', 'success');
            })
            .catch(error => {
                console.error("Sign Out Error:", error);
                showMessage('Failed to sign out.', 'error');
            });
    }

    // --- Auth State Observer ---
    auth.onAuthStateChanged(user => {
        const signInButton = document.getElementById('sign-in-button');
        const signOutButton = document.getElementById('sign-out-button');
        const testimonialForm = document.getElementById('testimonial-form');
        const userIdDisplay = document.getElementById('user-id');

        if (user) {
            currentUserId = user.uid;
            if (userIdDisplay) userIdDisplay.textContent = user.displayName || user.email || user.uid;
            if (signInButton) signInButton.style.display = 'none';
            if (signOutButton) signOutButton.style.display = 'inline-block';
            if (testimonialForm) testimonialForm.style.display = 'block'; // Show form if signed in
        } else {
            currentUserId = null;
            if (userIdDisplay) userIdDisplay.textContent = 'Not signed in';
            if (signInButton) signInButton.style.display = 'inline-block';
            if (signOutButton) signOutButton.style.display = 'none';
            if (testimonialForm) testimonialForm.style.display = 'none'; // Hide form if not signed in
        }
        // Load testimonials whenever auth state changes (including initial load)
        loadTestimonials();
    });

    // --- Handle Redirect Result (for signInWithRedirect) ---
    // This runs when the page reloads after a redirect from Google login
    auth.getRedirectResult().then(function(result) {
        if (result.credential) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            // var token = result.credential.accessToken; // You can use this if you need Google API access
        }
        // The signed-in user info.
        var user = result.user;
        if (user) {
            console.log("Signed in after redirect:", user);
            showMessage(`Welcome back, ${user.displayName || user.email}`, 'success');
        }
    }).catch(function(error) {
        console.error("Google Sign-In Redirect Result Error:", error);
        showMessage(`Authentication failed after redirect: ${error.message}`, 'error');
    });


    // --- Footer Year ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Contact Form ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = contactForm.querySelector('#contact-name').value;
            const email = contactForm.querySelector('#contact-email').value;
            const subject = contactForm.querySelector('#contact-subject').value;
            const message = contactForm.querySelector('#contact-message').value;

            try {
                await db.collection(`artifacts/${appId}/public/data/contactMessages`).add({
                    name, email, subject, message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                showMessage('Your message has been sent successfully!', 'success');
                contactForm.reset();
            } catch (error) {
                console.error("Error sending message: ", error);
                showMessage('Failed to send message. Please try again later.', 'error');
            }
        });
    }

    // --- Testimonial Form ---
    const testimonialForm = document.getElementById('testimonial-form');
    if (testimonialForm) {
        testimonialForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = testimonialForm.querySelector('#testimonial-name').value;
            const email = testimonialForm.querySelector('#testimonial-email').value;
            const relationship = testimonialForm.querySelector('#testimonial-relationship').value;
            const feedback = testimonialForm.querySelector('#testimonial-feedback').value;

            const user = auth.currentUser;
            if (!user || user.isAnonymous) {
                showMessage('Please sign in with Google to submit a testimonial.', 'error');
                return;
            }

            try {
                await db.collection(`artifacts/${appId}/public/data/testimonials`).add({
                    userId: currentUserId,
                    name, email, relationship, feedback,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    approved: true // Ensure this is true for display
                });
                showMessage('Thank you for your feedback!', 'success');
                testimonialForm.reset();
                testimonialForm.style.display = 'none'; // Hide the form after successful submission
                console.log("Testimonial submitted and form hidden."); // Debug log
            } catch (error) {
                console.error("Error submitting testimonial: ", error);
                showMessage('Failed to submit feedback. Please try again later.', 'error');
            }
        });
    }

    // --- Load Testimonials ---
    async function loadTestimonials() {
        const testimonialGridDiv = document.getElementById('testimonials-grid');
        if (!testimonialGridDiv) {
            console.warn("Testimonial grid element not found.");
            return;
        }
        testimonialGridDiv.innerHTML = ''; // Clear existing testimonials before loading

        try {
            // Use onSnapshot for real-time updates and initial load
            db.collection(`artifacts/${appId}/public/data/testimonials`)
                .where('approved', '==', true)
                // IMPORTANT: Removed .orderBy('timestamp', 'desc') to avoid requiring a Firestore index.
                // If you want to use orderBy, you MUST create a composite index in your Firebase Console.
                // Otherwise, the query will fail and no data will load.
                .onSnapshot((snapshot) => {
                    testimonialGridDiv.innerHTML = ''; // Clear again on new snapshot updates
                    if (snapshot.empty) {
                        testimonialGridDiv.innerHTML = '<p style="text-align: center; color: var(--text-color-secondary); grid-column: 1 / -1;">No testimonials yet. Be the first to share your experience!</p>';
                        return;
                    }

                    // Convert snapshot to array and sort client-side by timestamp
                    const testimonials = [];
                    snapshot.forEach(doc => {
                        testimonials.push({ id: doc.id, ...doc.data() });
                    });

                    // Sort by timestamp in descending order (most recent first)
                    testimonials.sort((a, b) => {
                        // Handle Firebase Timestamps (they have toMillis() method)
                        const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
                        const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
                        return timeB - timeA; // Descending order
                    });

                    testimonials.forEach(data => {
                        const initials = data.name ? data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'UN';
                        const avatarUrl = `https://placehold.co/60x60/0f4c81/ffffff?text=${initials}`;

                        const testimonialCard = `
                            <div class="testimonial-card">
                                <div class="testimonial-header">
                                    <img src="${avatarUrl}" alt="${data.name || 'Anonymous'} Avatar" class="client-avatar">
                                    <div class="client-info">
                                        <h4 class="client-name">${data.name || 'Anonymous'}</h4>
                                        <p class="client-title">${data.relationship || 'Client'}</p>
                                    </div>
                                </div>
                                <p class="testimonial-text">"${data.feedback}"</p>
                            </div>
                        `;
                        testimonialGridDiv.innerHTML += testimonialCard;
                    });
                }, (error) => {
                    console.error("Error listening to testimonials: ", error);
                    // IMPORTANT: Double-check your Firebase Console -> Firestore Database -> Rules tab.
                    // For public testimonials, you need 'allow read: if true;' for the testimonials collection.
                    // Also, if you re-add orderBy, check Console -> Firestore Database -> Indexes tab for missing indexes.
                    testimonialGridDiv.innerHTML = '<p style="text-align: center; color: red; grid-column: 1 / -1;">Failed to load testimonials. Please check console for errors and Firebase rules.</p>';
                });

        } catch (error) {
            console.error("Error setting up testimonial listener: ", error);
            testimonialGridDiv.innerHTML = '<p style="text-align: center; color: red; grid-column: 1 / -1;">Failed to initialize testimonials. Please check console for errors.</p>';
        }
    }

    // Add Google Sign-In and Sign-Out button logic
    const signInBtn = document.getElementById('sign-in-button');
    const signOutBtn = document.getElementById('sign-out-button');
    if (signInBtn) signInBtn.addEventListener('click', signInWithGoogle);
    if (signOutBtn) signOutBtn.addEventListener('click', signOutUser);


    // --- Mobile Navigation Toggle ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenu && navMenu) {
        const toggleNavMenu = () => {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll'); // Prevents background scroll
        };

        mobileMenu.addEventListener('click', toggleNavMenu);

        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleNavMenu();
                }
            });
        });
    } else {
        console.warn("Mobile menu or nav menu elements not found. Mobile navigation may not function.");
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992 && navMenu && mobileMenu && navMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });

}); // End of DOMContentLoaded
