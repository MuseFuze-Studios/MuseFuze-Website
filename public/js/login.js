document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const submitButton = document.querySelector(".login-button");
    const formMessage = document.createElement("div");
    formMessage.classList.add("form-message");
    form.appendChild(formMessage);

    // Validation Regex Pattern for Email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;    

    // Function to show validation messages
    function showValidationMessage(input, message, isValid) {
        let messageElement = input.nextElementSibling;
        if (!messageElement || !messageElement.classList.contains("error-message")) {
            messageElement = document.createElement("div");
            messageElement.classList.add("error-message");
            input.parentNode.appendChild(messageElement);
        }
        messageElement.textContent = message;
        messageElement.style.color = isValid ? "green" : "red";
        input.style.borderColor = isValid ? "#18ffff" : "red";
    }

    // Email Validation
    emailInput.addEventListener("input", () => {
        const isValid = emailPattern.test(emailInput.value);
        showValidationMessage(emailInput, isValid ? "✔️ Valid email" : "❌ Invalid email format", isValid);
    });

    // Password Validation
    passwordInput.addEventListener("input", () => {
        const isValid = passwordInput.value.length >= 8;
        showValidationMessage(passwordInput, isValid ? "✔️ Password looks good" : "❌ Password must be at least 8 characters", isValid);
    });

    // ✅ **AJAX Form Submission**
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const isEmailValid = emailPattern.test(emailInput.value);
        const isPasswordValid = passwordInput.value.length >= 8;

        if (!isEmailValid || !isPasswordValid) {
            formMessage.textContent = "❌ Please correct the errors before submitting.";
            formMessage.style.color = "red";
            return;
        }

        // Prepare Data
        const formData = {
            identifier: emailInput.value.trim(),
            password: passwordInput.value,
        };

        try {
            // Send Login Request
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                formMessage.textContent = "✅ Login successful! Redirecting...";
                formMessage.style.color = "green";
                setTimeout(() => {
                    window.location.href = "/account/dashboard";
                }, 2000);
            } else {
                formMessage.textContent = `❌ ${data.error}`;
                formMessage.style.color = "red";
            }
        } catch (error) {
            console.error("Error:", error);
            formMessage.textContent = "❌ Something went wrong. Please try again later.";
            formMessage.style.color = "red";
        }
    });
});
