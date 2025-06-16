document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signup-form");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const termsCheckbox = document.getElementById("terms");
    const submitButton = document.querySelector(".signup-button");
    const formMessage = document.getElementById("form-message");

    // Validation Regex Patterns
    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/; // 3-20 chars, letters, numbers, underscores
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/; // Min 8 chars, 1 letter, 1 number

    // Function to show validation message
    function showValidationMessage(input, message, isValid) {
        let messageElement = input.nextElementSibling;
        messageElement.textContent = message;
        messageElement.style.color = isValid ? "green" : "red";
        input.style.borderColor = isValid ? "#18ffff" : "red";
    }

    // Username Validation
    usernameInput.addEventListener("input", () => {
        const isValid = usernamePattern.test(usernameInput.value);
        showValidationMessage(usernameInput, isValid ? "✔️ Valid username" : "❌ 3-20 chars, only letters, numbers, underscores", isValid);
    });

    // Email Validation
    emailInput.addEventListener("input", () => {
        const isValid = emailPattern.test(emailInput.value);
        showValidationMessage(emailInput, isValid ? "✔️ Valid email" : "❌ Invalid email format", isValid);
    });

    // Password Validation
    passwordInput.addEventListener("input", () => {
        const isValid = passwordPattern.test(passwordInput.value);
        showValidationMessage(passwordInput, isValid ? "✔️ Strong password" : "❌ At least 8 chars, 1 letter, 1 number", isValid);
    });

    // Confirm Password Validation
    confirmPasswordInput.addEventListener("input", () => {
        const isValid = passwordInput.value === confirmPasswordInput.value;
        showValidationMessage(confirmPasswordInput, isValid ? "✔️ Passwords match" : "❌ Passwords do not match", isValid);
    });

    // Terms Checkbox Validation
    termsCheckbox.addEventListener("change", () => {
        if (termsCheckbox.checked) {
            termsCheckbox.nextElementSibling.style.color = "#e0e0e0";
        } else {
            termsCheckbox.nextElementSibling.style.color = "red";
        }
    });

    // ✅ **Form Submission Handling with AJAX**
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const isUsernameValid = usernamePattern.test(usernameInput.value);
        const isEmailValid = emailPattern.test(emailInput.value);
        const isPasswordValid = passwordPattern.test(passwordInput.value);
        const isConfirmPasswordValid = passwordInput.value === confirmPasswordInput.value;
        const isTermsChecked = termsCheckbox.checked;

        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isTermsChecked) {
            formMessage.textContent = "❌ Please correct the errors before submitting.";
            formMessage.style.color = "red";
            return;
        }

        // Prepare Data
        const formData = {
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
        };

        try {
            // Send Registration Request
            const response = await fetch("/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                formMessage.textContent = "✅ Account successfully created! Redirecting...";
                formMessage.style.color = "green";
                setTimeout(() => {
                    window.location.href = "/account/login";
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
