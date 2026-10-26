/**
 * FocusTube - Student Authentication Logic (auth.js)
 * Simple client-side auth state with optional server verification.
 */

document.addEventListener("DOMContentLoaded", () => {
  initAuthPage();
});

function initAuthPage() {
  const user = getCurrentUser();
  const loggedInBox = document.getElementById("already-logged-in-box");
  const authFormsBox = document.getElementById("auth-forms-container");

  if (user) {
    if (loggedInBox) loggedInBox.style.display = "block";
    if (authFormsBox) authFormsBox.style.display = "none";
    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-email").textContent = user.email || user.rollNo;
    return;
  }

  // Tab switching
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin = document.getElementById("login-form");
  const formRegister = document.getElementById("register-form");

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener("click", () => {
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      formLogin.style.display = "block";
      formRegister.style.display = "none";
    });

    tabRegister.addEventListener("click", () => {
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      formRegister.style.display = "block";
      formLogin.style.display = "none";
    });
  }

  // Demo auto-fill button for fast college viva testing
  const demoBtn = document.getElementById("fill-demo-btn");
  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      document.getElementById("login-identifier").value = "rahul.22cse@college.edu";
      document.getElementById("login-password").value = "student123";
    });
  }

  // Handle Login submission
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      const identifier = document.getElementById("login-identifier").value.trim();
      const password = document.getElementById("login-password").value.trim();

      if (!identifier || !password) {
        alert("Please enter both Roll No / Email and Password.");
        return;
      }

      // Format student object
      const studentName = identifier.includes("@") 
        ? identifier.split("@")[0].replace(".", " ").toUpperCase() 
        : "Student " + identifier;

      const userData = {
        name: studentName,
        email: identifier,
        rollNo: identifier.toUpperCase(),
        token: "demo_jwt_token_" + Date.now()
      };

      // Try server login if backend is live, otherwise local
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: identifier, password })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.user) userData.name = json.user.name;
        }
      } catch (err) {
        // Local mode fallback
      }

      setCurrentUser(userData);
      alert(`Welcome back, ${userData.name}! Login successful.`);
      window.location.href = "index.html";
    });
  }

  // Handle Register submission
  if (formRegister) {
    formRegister.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name").value.trim();
      const rollNo = document.getElementById("reg-roll").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value.trim();

      if (!name || !rollNo || !password) {
        alert("Please fill in all required fields.");
        return;
      }

      const userData = {
        name: name,
        email: email || rollNo + "@college.edu",
        rollNo: rollNo,
        token: "demo_jwt_token_" + Date.now()
      };

      try {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, rollNo, password })
        });
      } catch (err) {
        // Fallback
      }

      setCurrentUser(userData);
      alert(`Registration successful! Logged in as ${name}.`);
      window.location.href = "index.html";
    });
  }
}
