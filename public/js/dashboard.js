document.addEventListener("DOMContentLoaded", async () => {
    const profileUsername = document.getElementById("display-username");
    const welcomeUsername = document.getElementById("username");
    const profileEmail = document.getElementById("user-email");
    const profileJoined = document.getElementById("user-joined");
    const profileLastLogin = document.getElementById("last-login");    

    const dataCheckboxes = document.querySelectorAll(".data-controls input[type='checkbox']");
    const downloadDataBtn = document.getElementById("download-data");
    const deleteAccountBtn = document.getElementById("delete-account");

    const openChangePasswordModal = document.getElementById("open-change-password-modal");
    const changePasswordModal = document.getElementById("change-password-modal");
    const closeModal = document.querySelector(".modal .close");
    const submitChangePassword = document.getElementById("submit-change-password");

    const currentPasswordInput = document.getElementById("current-password");
    const newPasswordInput = document.getElementById("new-password");
    const confirmNewPasswordInput = document.getElementById("confirm-new-password");
    
    const logoutBtn = document.getElementById("logout");
    const logoutAllBtn = document.getElementById("logout-all");

    const editProfileBtn = document.getElementById("edit-profile-button");


    try {
        const response = await fetch("/api/user");
        const user = await response.json();
    
        if (!response.ok) {
            console.error("API Error:", user);
            throw new Error(user.error || "Failed to fetch user data.");
        }
    
        console.log("Fetched user data:", user); // ✅ Debugging Line

        // **Populate Privacy Settings**
        dataCheckboxes.forEach(checkbox => {
            const settingKey = checkbox.id.replace("-toggle", "");
            if (user[settingKey] !== undefined) {
                checkbox.checked = user[settingKey];
            }
        });
    
        welcomeUsername.textContent = user.username || "Unknown";
        profileUsername.textContent = user.username || "Unknown";
        profileEmail.textContent = user.email || "Unknown";
        profileJoined.textContent = new Date(user.joined).toLocaleDateString();
        profileLastLogin.textContent = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never";
    } catch (error) {
        console.error("Error loading dashboard:", error);
        alert("❌ Failed to load account data. Please try again.");
    }

    // **Update Privacy Settings**
    dataCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", async () => {
            const settingKey = checkbox.id.replace("-toggle", "");
            const isChecked = checkbox.checked;
    
            try {
                const response = await fetch("/api/update-settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ settingKey, isChecked }),
                });
    
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
    
                showNotification("✅ Privacy setting updated!", "success");
            } catch (error) {
                console.error("Error updating setting:", error);
                showNotification("❌ Failed to update setting.", "error");
                checkbox.checked = !isChecked; // Revert if error
            }
        });
    });

    // **Download Data**
    downloadDataBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/download-data");
            if (!response.ok) throw new Error("Failed to download data.");
    
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "my_data.json";
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
    
            showNotification("✅ Your data has been downloaded.", "success");
        } catch (error) {
            console.error("Error downloading data:", error);
            showNotification("❌ Could not download your data.", "error");
        }
    });

    // **Delete Account**
    deleteAccountBtn.addEventListener("click", async () => {
        if (!confirm("⚠️ Are you sure you want to delete your account? This action cannot be undone.")) return;
    
        try {
            const response = await fetch("/api/delete-account", { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete account.");
    
            showNotification("✅ Your account has been deleted.", "success");
            window.location.href = "/account/login";
        } catch (error) {
            console.error("Error deleting account:", error);
            showNotification("❌ Failed to delete account.", "error");
        }
    });

    // Open the modal
    openChangePasswordModal.addEventListener("click", () => {
        changePasswordModal.style.display = "flex";
    });

    // Close the modal
    closeModal.addEventListener("click", () => {
        changePasswordModal.style.display = "none";
    });

    // Submit password change request
    submitChangePassword.addEventListener("click", async () => {
        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showNotification("❌ All fields are required.", "error");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showNotification("❌ New passwords do not match.", "error");
            return;
        }

        if (newPassword.length < 8) {
            showNotification("❌ Password must be at least 8 characters long.", "error");
            return;
        }

        try {
            const response = await fetch("/api/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            showNotification("✅ Password changed successfully! Logging out...", "success");

            // Close modal and logout user
            setTimeout(() => {
                window.location.href = "/account/login";
            }, 3000);
        } catch (error) {
            console.error("Error changing password:", error);
            showNotification("❌ Failed to change password.", "error");
        }
    });

    // **Logout**
    logoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/auth/logout", { method: "POST" });
            if (!response.ok) throw new Error("Failed to log out.");
    
            showNotification("✅ You have been logged out.", "success");
            window.location.href = "/account/login";
        } catch (error) {
            console.error("Error logging out:", error);
            showNotification("❌ Failed to log out.", "error");
        }
    });

    // **Logout from All Devices**
    logoutAllBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/auth/logout-all", { method: "POST" });
            if (!response.ok) throw new Error("Failed to log out from all devices.");
    
            showNotification("✅ You have been logged out from all devices.", "success");
            window.location.href = "/account/login";
        } catch (error) {
            console.error("Error logging out from all devices:", error);
            showNotification("❌ Failed to log out.", "error");
        }
    });

    function showNotification(message, type = "success") {
        const container = document.getElementById("notification-container");
        const notification = document.createElement("div");
        notification.classList.add("notification", type);
        notification.textContent = message;
    
        container.appendChild(notification);
    
        setTimeout(() => {
            notification.remove();
        }, 4000); // Auto-hide after 4 seconds
    }
});
