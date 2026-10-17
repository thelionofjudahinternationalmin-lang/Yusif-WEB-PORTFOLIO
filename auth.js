import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Replace these with the values from YOUR Supabase project.
const SUPABASE_URL = "PASTE_YOUR_PROJECT_URL_HERE";
const SUPABASE_PUBLISHABLE_KEY = "PASTE_YOUR_PUBLISHABLE_KEY_HERE";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const resendButton = document.getElementById("resendButton");
const logoutButton = document.getElementById("logoutButton");

let lastRegisteredEmail = "";

function showMessage(text) {
  message.textContent = text;
}

function getEmailRedirectUrl() {
  // Returns this page's URL, including the GitHub repository path.
  return window.location.href.split("#")[0].split("?")[0];
}

// REGISTER
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("Creating your account...");
  resendButton.hidden = true;

  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;

  lastRegisteredEmail = email;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getEmailRedirectUrl()
    }
  });

  if (error) {
    showMessage("Registration failed: " + error.message);
    return;
  }

  if (data.session) {
    showMessage(
      "Your account was created and you are signed in. " +
      "Check your email if confirmation is still required."
    );
  } else {
    showMessage(
      "Registration started! Check your inbox and spam folder " +
      "for the verification email, then click its confirmation link."
    );
    resendButton.hidden = false;
  }
});

// LOGIN
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("Signing you in...");

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    lastRegisteredEmail = email;
    resendButton.hidden = false;
    showMessage(
      "Login failed: " + error.message +
      " If you have not verified your email, check your inbox " +
      "or use the resend button."
    );
    return;
  }

  resendButton.hidden = true;
  logoutButton.hidden = false;

  showMessage(
    "Welcome! You are logged in as " + data.user.email +
    ". Your email has been accepted by Supabase."
  );
});

// RESEND VERIFICATION EMAIL
resendButton.addEventListener("click", async () => {
  const email =
    lastRegisteredEmail ||
    document.getElementById("regEmail").value.trim() ||
    document.getElementById("loginEmail").value.trim();

  if (!email) {
    showMessage("Enter your email address first.");
    return;
  }

  showMessage("Sending verification email...");

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: getEmailRedirectUrl()
    }
  });

  if (error) {
    showMessage("Could not resend email: " + error.message);
    return;
  }

  showMessage("Verification email requested. Check your inbox and spam folder.");
});

// LOGOUT
logoutButton.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    showMessage("Logout failed: " + error.message);
    return;
  }

  logoutButton.hidden = true;
  showMessage("You have logged out successfully.");
});

// RESTORE AN EXISTING SESSION
const { data: sessionData } = await supabase.auth.getSession();

if (sessionData.session) {
  logoutButton.hidden = false;
  showMessage(
    "You are signed in as " + sessionData.session.user.email + "."
  );
}