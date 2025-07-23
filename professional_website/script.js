const repoOwner = "atharvakesarkar";
const repoName = "my_portfolio";
const token = "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"; // 🔒 Replace with your GitHub token

// 🔄 Load Testimonials from GitHub Issues
async function loadTestimonials() {
    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
            headers: {
                Authorization: `token ${token}`,
            }
        });

        const data = await response.json();
        const testimonialsGrid = document.getElementById("testimonials-grid");
        testimonialsGrid.innerHTML = "";

        const openTestimonials = data.filter(issue => issue.state === "open");

        openTestimonials.forEach((issue) => {
            const card = document.createElement("div");
            card.className = "testimonial-card";
            card.innerHTML = `
                <p class="testimonial-feedback">"${issue.body}"</p>
                <p class="testimonial-name">— ${issue.title}</p>
                <p class="testimonial-relationship">${issue.labels.map(label => label.name).join(", ")}</p>
                ${issue.user.login === repoOwner ? `<button class="delete-btn" onclick="deleteTestimonial(${issue.number})">Delete</button>` : ""}
            `;
            testimonialsGrid.appendChild(card);
        });

    } catch (error) {
        console.error("Failed to load testimonials:", error);
    }
}

// ✍️ Submit Testimonial as GitHub Issue
document.getElementById("testimonial-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("testimonial-name").value.trim();
    const relationship = document.getElementById("testimonial-relationship").value.trim();
    const feedback = document.getElementById("testimonial-feedback").value.trim();

    if (!name || !relationship || !feedback) {
        alert("Please fill all fields.");
        return;
    }

    const payload = {
        title: name,
        body: feedback,
        labels: [relationship]
    };

    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
            method: "POST",
            headers: {
                Authorization: `token ${token}`,
                Accept: "application/vnd.github+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Thank you for your teaching. It was truly enjoyable to learn with you!");
            document.getElementById("testimonial-form").reset();
            loadTestimonials();
        } else {
            const err = await response.json();
            alert("Failed to submit testimonial: " + err.message);
        }

    } catch (error) {
        console.error("Submission error:", error);
        alert("Error submitting testimonial.");
    }
});

// 🗑️ Delete Testimonial (Only for repo owner)
async function deleteTestimonial(issueNumber) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}`, {
            method: "PATCH",
            headers: {
                Authorization: `token ${token}`,
                Accept: "application/vnd.github+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ state: "closed" })
        });

        if (response.ok) {
            alert("Testimonial deleted successfully.");
            loadTestimonials();
        } else {
            const err = await response.json();
            alert("Failed to delete testimonial: " + err.message);
        }

    } catch (error) {
        console.error("Delete error:", error);
        alert("Error deleting testimonial.");
    }
}

// 📨 Contact Form Submission
document.getElementById("contact-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const message = document.getElementById("contact-message").value.trim();

    if (!name || !email || !message) {
        alert("Please fill all contact fields.");
        return;
    }

    const contactPayload = {
        title: `Message from ${name}`,
        body: `Email: ${email}\n\nMessage:\n${message}`,
        labels: ["contact"]
    };

    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
            method: "POST",
            headers: {
                Authorization: `token ${token}`,
                Accept: "application/vnd.github+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(contactPayload)
        });

        if (response.ok) {
            alert("Your message has been sent successfully! I'll get back to you shortly.");
            document.getElementById("contact-form").reset();
        } else {
            const err = await response.json();
            alert("Failed to send message: " + err.message);
        }

    } catch (error) {
        console.error("Message error:", error);
        alert("Error sending message.");
    }
});

// ⏳ Load testimonials on page load
document.addEventListener("DOMContentLoaded", loadTestimonials);

// ✅ Responsive Navigation Toggle
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle?.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});
