document.addEventListener("DOMContentLoaded", function() {
  const detailModal     = document.getElementById("article-detail-modal");
  const detailContent   = document.getElementById("article-detail-content");
  const closeDetailBtn  = document.getElementById("close-article-detail-modal");

  // Загружаем статьи и рисуем первые шесть карточек
  fetch('/api/articles')
    .then(response => response.json())
    .then(data => {
      let articles = data.filter(a => a.visible !== false)
                         .sort((a, b) => b.id - a.id);
      if (articles.length > 6) articles = articles.slice(0, 6);

      const container = document.querySelector("#blog .blog-container");
      container.innerHTML = "";

      articles.forEach(article => {
        const card = document.createElement("div");
        card.className = "blog-card";
        card.dataset.id = article.id;
        card.innerHTML = `
          <div class="image-container">
            <img src="${article.image || 'images/default.jpg'}" alt="${article.title}">
          </div>
          <div class="blog-meta"></div>
          <div class="blog-title">${article.title}</div>
          <div class="blog-desc">${article.description || ""}</div>
        `;
        card.addEventListener("click", () => {
          fetch(`/api/articles?id=${article.id}`)
            .then(res => res.json())
            .then(openArticleDetailModal)
            .catch(err => console.error("Error fetching article:", err));
        });
        container.appendChild(card);
      });
    })
    .catch(err => console.error("Error loading articles:", err));

  // Открываем модалку с полной статьёй
  function openArticleDetailModal(article) {
    detailContent.innerHTML = `
      <img src="${article.image || 'images/default.jpg'}" alt="${article.title}">
      <h2>${article.title}</h2>
      <div class="blog-meta"></div>
      <p>${article.description || ""}</p>
      <div>${article.content || ""}</div>
    `;
    detailModal.classList.add("active");
  }

  // Закрытие по крестику
  closeDetailBtn.addEventListener("click", () => {
    detailModal.classList.remove("active");
  });

  // Закрытие по клику вне контента (по затемнённому фону)
  detailModal.addEventListener("click", e => {
    if (e.target === detailModal) {
      detailModal.classList.remove("active");
    }
  });
});
