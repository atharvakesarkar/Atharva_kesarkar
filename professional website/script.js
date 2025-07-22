// --- Firebase Configuration ---
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

function signInWithGoogle() {
    auth.signInWithPopup(provider)
        .then(result => {
            console.log("Signed in:", result.user);
            showMessage(`Welcome, ${result.user.displayName || result.user.email}`, 'success');
        })
        .catch(error => {
            console.error("Google Sign-In Error:", error);
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

    if (user) {
        currentUserId = user.uid;
        document.getElementById('user-id').textContent = user.displayName || user.email || user.uid;
        if (signInButton) signInButton.style.display = 'none';
        if (signOutButton) signOutButton.style.display = 'inline-block';
        document.getElementById('testimonial-form').style.display = 'block';
    } else {
        currentUserId = null;
        document.getElementById('user-id').textContent = 'Not signed in';
        if (signInButton) signInButton.style.display = 'inline-block';
        if (signOutButton) signOutButton.style.display = 'none';
        document.getElementById('testimonial-form').style.display = 'none';
    }
    loadTestimonials();
});

// --- Footer Year ---
document.getElementById('current-year').textContent = new Date().getFullYear();

// --- Messaging System ---
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const messageCloseBtn = document.getElementById('message-close');

function showMessage(message, type = 'success') {
    messageText.textContent = message;
    messageBox.classList.add('show');
}

messageCloseBtn.addEventListener('click', () => {
    messageBox.classList.remove('show');
});

messageBox.addEventListener('click', (event) => {
    if (event.target === messageBox) {
        messageBox.classList.remove('show');
    }
});

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
                approved: true
            });
            showMessage('Thank you for your feedback!', 'success');
            testimonialForm.reset();
        } catch (error) {
            console.error("Error submitting testimonial: ", error);
            showMessage('Failed to submit feedback. Please try again later.', 'error');
        }
    });
}

// --- Load Testimonials ---
async function loadTestimonials() {
    const testimonialGridDiv = document.getElementById('testimonials-grid');
    if (!testimonialGridDiv) return;
    testimonialGridDiv.innerHTML = '';

    try {
        db.collection(`artifacts/${appId}/public/data/testimonials`)
            .where('approved', '==', true)
            .orderBy('timestamp', 'desc')
            .onSnapshot((snapshot) => {
                testimonialGridDiv.innerHTML = '';
                if (snapshot.empty) {
                    testimonialGridDiv.innerHTML = '<p style="text-align: center; color: var(--text-color-secondary); grid-column: 1 / -1;">No testimonials yet. Be the first to share your experience!</p>';
                    return;
                }

                snapshot.forEach(doc => {
                    const data = doc.data();
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
                testimonialGridDiv.innerHTML = '<p style="text-align: center; color: red; grid-column: 1 / -1;">Failed to load testimonials. Please try again later.</p>';
            });

    } catch (error) {
        console.error("Error setting up testimonial listener: ", error);
        testimonialGridDiv.innerHTML = '<p style="text-align: center; color: red; grid-column: 1 / -1;">Failed to initialize testimonials. Please try again later.</p>';
    }
} 

// Add Google Sign-In and Sign-Out button logic

document.addEventListener('DOMContentLoaded', () => {
    const signInBtn = document.getElementById('sign-in-button');
    const signOutBtn = document.getElementById('sign-out-button');
    if (signInBtn) signInBtn.addEventListener('click', signInWithGoogle);
    if (signOutBtn) signOutBtn.addEventListener('click', signOutUser);
});
