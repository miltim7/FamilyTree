document.addEventListener("DOMContentLoaded", function(){
    fetch('/api/articles')
      .then(response => response.json())
      .then(data => {
        let articles = data.filter(a => a.visible !== false);
        articles.sort((a, b) => b.id - a.id);
        if(articles.length > 6) articles = articles.slice(0, 6);
        const container = document.querySelector("#blog .blog-container");
        container.innerHTML = "";
        articles.forEach(article => {
          const link = document.createElement("a");
          link.href = "articles.html?id=" + article.id;
          link.className = "blog-card";
          link.innerHTML = `
            <div class="image-container">
              <img src="${article.image ? article.image : 'images/default.jpg'}" alt="${article.title}">
            </div>
            <div class="blog-meta"></div>
            <div class="blog-title">${article.title}</div>
            <div class="blog-desc">${article.description ? article.description : ""}</div>
          `;
          container.appendChild(link);
        });
      });
  });
  