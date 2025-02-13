// Дополнительный скрипт для блоков Header, Hero и Blog Section (пока пустой)
console.log("Additional blocks script loaded");

// Функционал расширения контейнера: переключает класс "expanded" на #tree-container-wrapper
document.addEventListener("DOMContentLoaded", function() {
  const expandBtn = document.getElementById("expand-container-btn");
  const treeWrapper = document.getElementById("tree-container-wrapper");
  expandBtn.addEventListener("click", function(){
    treeWrapper.classList.toggle("expanded");
    expandBtn.textContent = treeWrapper.classList.contains("expanded") 
      ? "Свернуть контейнер" 
      : "Открыть контейнер полностью";
  });
});

document.addEventListener("DOMContentLoaded", function() {
  // Существующий код для бургер-меню...
  const burger = document.querySelector("header .burger");
  const mobileMenuModal = document.querySelector(".header-mobile");
  const close = document.querySelector("header .close");

  burger.addEventListener("click", function() {
    mobileMenuModal.classList.add("active");
    burger.classList.add('hide');
    close.classList.add('active');
  });

  close.addEventListener('click', function() {
    mobileMenuModal.classList.remove("active");
    burger.classList.remove('hide');
    close.classList.remove('active');
  });
  
  // Новый обработчик для ссылок внутри мобильного меню
  const mobileLinks = document.querySelectorAll(".header-mobile a");
  mobileLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      // Добавляем плавное закрытие через CSS (см. ниже)
      mobileMenuModal.classList.remove("active");
      burger.classList.remove("hide");
      close.classList.remove("active");
    });
  });
});

