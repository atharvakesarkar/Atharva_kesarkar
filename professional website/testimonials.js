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
            showMessage(`Welcome, ${result.user.displayName || result.user.email}`, 'success');
        })
        .catch(error => {
            showMessage(`Authentication failed: ${error.message}`, 'error');
        });
}

// --- Auth State Observer ---
auth.onAuthStateChanged(user => {
    const signInButton = document.getElementById('sign-in-button');
    const testimonialForm = document.getElementById('testimonial-form');
    const authMsg = document.getElementById('auth-message');

    if (user) {
        currentUserId = user.uid;
        document.getElementById('user-id').textContent = user.displayName || user.email || user.uid;
        if (signInButton) signInButton.style.display = 'none';
        if (testimonialForm) testimonialForm.style.display = 'block';
        if (authMsg) authMsg.style.display = 'none';
    } else {
        currentUserId = null;
        document.getElementById('user-id').textContent = 'Not signed in';
        if (signInButton) signInButton.style.display = 'block';
        if (testimonialForm) testimonialForm.style.display = 'none';
        if (authMsg) authMsg.style.display = 'block';
    }

    loadTestimonials();
});

// --- Show Message Box ---
function showMessage(message, type = 'success') {
    const box = document.getElementById('message-box');
    const text = document.getElementById('message-text');
    if (text && box) {
        text.textContent = message;
        box.classList.add('show');
    }
}

// --- Hide Message Box ---
document.addEventListener('DOMContentLoaded', () => {
    const messageClose = document.getElementById('message-close');
    const box = document.getElementById('message-box');
    const signInBtn = document.getElementById('sign-in-button');

    if (messageClose && box) {
        messageClose.addEventListener('click', () => box.classList.remove('show'));
        box.addEventListener('click', (e) => {
            if (e.target === box) box.classList.remove('show');
        });
    }

    if (signInBtn) {
        signInBtn.addEventListener('click', signInWithGoogle);
    }
});

// --- Testimonial Form Submit ---
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
                approved: false
            });
            showMessage('Thank you for your feedback! It will be reviewed and published soon.', 'success');
            testimonialForm.reset();
        } catch (error) {
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
                    testimonialGridDiv.innerHTML = '<p style="text-align: center; color: gray;">No testimonials yet. Be the first!</p>';
                    return;
                }

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const initials = data.name ? data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'UN';
                    const avatarUrl = `https://placehold.co/60x60/0f4c81/ffffff?text=${initials}`;

                    testimonialGridDiv.innerHTML += `
                        <div class="testimonial-card">
                            <div class="testimonial-header">
                                <img src="${avatarUrl}" alt="${data.name}" class="client-avatar">
                                <div class="client-info">
                                    <h4 class="client-name">${data.name || 'Anonymous'}</h4>
                                    <p class="client-title">${data.relationship || 'Client'}</p>
                                </div>
                            </div>
                            <p class="testimonial-text">"${data.feedback}"</p>
                        </div>
                    `;
                });
            });
    } catch (error) {
        testimonialGridDiv.innerHTML = '<p style="text-align: center; color: red;">Failed to load testimonials.</p>';
    }
}
