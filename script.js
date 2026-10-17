document.addEventListener("DOMContentLoaded", function () {
  // Automatically update the copyright year
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Mobile navigation menu
  const menuToggle = document.getElementById("menuToggle");
  const navigation = document.getElementById("navigation");

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", function () {
      const isOpen = navigation.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navigation.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navigation.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Send contact messages and prayer requests
  const form = document.getElementById("contactForm");

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const button = document.getElementById("sendButton");
      const status = document.getElementById("formMessage");

      if (!form.reportValidity()) return;

      button.disabled = true;
      button.textContent = "Sending...";
      status.textContent = "";

      try {
        const response = await fetch(
          "https://api.web3forms.com/submit",
          {
            method: "POST",
            body: new FormData(form)
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          status.textContent =
            "Thank you! Your message has been sent successfully to the church.";
          form.reset();
        } else {
          status.textContent =
            "Your message could not be sent. Check your Web3Forms access key and email verification.";
        }
      } catch (error) {
        status.textContent =
          "Connection failed. Please check your internet and try again.";
      } finally {
        button.disabled = false;
        button.textContent = "Send Prayer Request";
      }
    });
  }
});