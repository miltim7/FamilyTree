document.addEventListener("DOMContentLoaded", function() {
    const burger = document.getElementById("burger");
    const mobileMenu = document.getElementById("mobileMenu");
  
    burger.addEventListener("click", function() {
      burger.classList.toggle("active");
      mobileMenu.classList.toggle("active");
    });
  });
  