document.addEventListener("DOMContentLoaded", async () => {
    // Profile Elements
    const profileUsername = document.getElementById("sidebar-username");
    const welcomeUsername = document.getElementById("username");
    const profileEmail = document.getElementById("user-email");
    const profileJoined = document.getElementById("user-joined");
    const profileLastLogin = document.getElementById("last-login");

    // Sidebar Elements
    const collapseSidebarBtn = document.getElementById("collapse-sidebar");

    // Privacy Settings Tabs
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".privacy-content");

    // Privacy Checkboxes
    const dataCheckboxes = document.querySelectorAll(".data-control input[type='checkbox']");

    // Account Actions
    const downloadDataBtn = document.getElementById("download-data");
    const logoutBtn = document.getElementById("logout");
    const logoutAllBtn = document.getElementById("logout-all");
    const editProfileBtn = document.getElementById("edit-profile");

    const changePasswordModal = document.getElementById("change-password-modal");
    const openChangePasswordBtn = document.getElementById("open-change-password");
    const openChangePasswordBtn2 = document.getElementById("open-change-password2");
    const closeModal = document.querySelector(".modal .close");
    const submitChangePassword = document.getElementById("submit-change-password");

    const currentPasswordInput = document.getElementById("current-password");
    const newPasswordInput = document.getElementById("new-password");
    const confirmNewPasswordInput = document.getElementById("confirm-new-password");

    const settingKeyMapping = {
        "collect_cookies-toggle": "collect_cookies",
        "allow_analytics-toggle": "allow_analytics",
        "personalized_ads-toggle": "personalized_ads",
        "receive_emails-toggle": "receive_emails",
        "store_purchase_history-toggle": "store_purchase_history",
        "watch_history-toggle": "watch_history",
        "video_recommendations-toggle": "video_recommendations",
        "save_comments_likes-toggle": "save_comments_likes",
        "public_activity-toggle": "public_activity"
    };    

    try {
        // Fetch User Data
        const response = await fetch("/api/user");
        const user = await response.json();

        if (!response.ok) throw new Error(user.error || "Failed to fetch user data.");

        // Update Profile Info
        profileUsername.textContent = user.username || "User";
        welcomeUsername.textContent = user.username || "User";
        profileEmail.textContent = user.email || "Unknown";
        profileJoined.textContent = user.joined ? new Date(user.joined).toLocaleDateString() : "Unknown";
        profileLastLogin.textContent = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never";

        // Set Privacy Settings Checkboxes
        dataCheckboxes.forEach(checkbox => {
            const settingKey = settingKeyMapping[checkbox.id];
            if (!settingKey) {
                console.error("Invalid setting key:", checkbox.id);
                showNotification("❌ Error: Invalid setting key.", "error");
                return;
            }

            if (user[settingKey] !== undefined) {
                checkbox.checked = user[settingKey];
            }
        });
    } catch (error) {
        console.error("Error loading dashboard:", error);
        showNotification("❌ Failed to load account data. Please try again.", "error");
    }

    // **Sidebar Toggle**
    collapseSidebarBtn.addEventListener("click", () => {
        document.querySelector(".dashboard-sidebar").classList.toggle("collapsed");
        document.querySelector(".dashboard-content").classList.toggle("expanded");
    });

    // **Privacy Settings Tab Switching**
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const target = tab.getAttribute("data-tab");
            contents.forEach(content => {
                content.classList.remove("active");
                if (content.id === target) {
                    content.classList.add("active");
                }
            });
        });
    });

    // **Privacy Settings Update**
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

    // **Tooltips for Privacy Settings**
    document.querySelectorAll(".tooltip").forEach(tooltip => {
        tooltip.addEventListener("mouseenter", () => {
            tooltip.classList.add("show-tooltip");
        });

        tooltip.addEventListener("mouseleave", () => {
            tooltip.classList.remove("show-tooltip");
        });
    });

    // Submit Password Change Request
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

    // Open Change Password Modal
    openChangePasswordBtn.addEventListener("click", () => {
        changePasswordModal.style.display = "flex";
    });

    openChangePasswordBtn2.addEventListener("click", () => {
        changePasswordModal.style.display = "flex";
    });

    // Close Modal
    closeModal.addEventListener("click", () => {
        changePasswordModal.style.display = "none";
    });

    // **Notification System**
    function showNotification(message, type = "success") {
        const container = document.getElementById("notification-container");
    
        if (!container) {
            console.error("Notification container missing!");
            return;
        }
    
        const notification = document.createElement("div");
        notification.classList.add("notification", type);
        notification.textContent = message;
    
        container.appendChild(notification);
    
        setTimeout(() => {
            notification.remove();
        }, 4000);
    } 
});
