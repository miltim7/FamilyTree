document.addEventListener("DOMContentLoaded", function(){
  let isAdmin = false;
  let currentArticleImageUrl = "";
  const articlesContainer = document.getElementById("articles-container");
  const paginationContainer = document.getElementById("pagination-container");
  const editorLoginBtn = document.getElementById("editor-login-btn");
  const loginModal = document.getElementById("login-modal");
  const closeLoginModal = document.getElementById("close-login-modal");
  const loginForm = document.getElementById("login-form");
  const loginPasswordInput = document.getElementById("login-password");
  const loginError = document.getElementById("login-error");
  const addArticleBtn = document.getElementById("add-article-btn");
  const articleModal = document.getElementById("article-modal");
  const closeArticleModal = document.getElementById("close-article-modal");
  const articleForm = document.getElementById("article-form");
  const articleIdInput = document.getElementById("article-id");
  const articleTitleInput = document.getElementById("article-title");
  const articleImageInput = document.getElementById("article-image");
  const articleDescriptionInput = document.getElementById("article-description");
  const articleContentInput = document.getElementById("article-content");
  const articleModalTitle = document.getElementById("article-modal-title");
  const imagePreview = document.getElementById("article-image-preview");
  const imagePlaceholder = document.getElementById("article-image-placeholder");
  const articleVisibleInput = document.getElementById("article-visible");
  const detailModal = document.getElementById("article-detail-modal");
  const closeArticleDetailModal = document.getElementById("close-article-detail-modal");
  const articleDetailContent = document.getElementById("article-detail-content");
  let currentPage = 1;
  const articlesPerPage = 9;
  function loadArticles(){
    fetch('/api/articles')
      .then(response => response.json())
      .then(data => {
        let visibleArticles = data.filter(article => article.visible !== false);
        visibleArticles.sort((a, b) => b.id - a.id);
        renderArticles(visibleArticles);
        renderPaginationControls(visibleArticles);
      })
      .catch(err => console.error("Error loading articles", err));
  }
  function renderArticles(articles){
    articlesContainer.innerHTML = "";
    if(articles.length === 0){
      articlesContainer.innerHTML = "<p>Нет статей</p>";
      return;
    }
    const start = (currentPage - 1) * articlesPerPage;
    const end = start + articlesPerPage;
    const pageArticles = articles.slice(start, end);
    pageArticles.forEach(article => {
      const card = document.createElement("div");
      card.classList.add("blog-card");
      const btnsHTML = isAdmin 
        ? `<div class="article-btns">
             <button class="edit-article-btn" data-id="${article.id}"><img src="images/pencil.png" alt="Редактировать"/></button>
             <button class="delete-article-btn" data-id="${article.id}"><img src="images/delete.png" alt="Удалить"/></button>
           </div>`
        : "";
      card.innerHTML = `
        <img src="${article.image ? article.image : 'images/default.jpg'}" alt="${article.title}">
        <div class="blog-meta"></div>
        <div class="blog-title">${article.title}</div>
        <div class="blog-desc">${article.description ? article.description : ""}</div>
        ${btnsHTML}
      `;
      card.addEventListener('click', function(e){
        if(e.target.closest('.edit-article-btn') || e.target.closest('.delete-article-btn')){
          return;
        }
        openArticleDetailModal(article);
      });
      articlesContainer.appendChild(card);
    });
    if(isAdmin){
      document.querySelectorAll(".edit-article-btn").forEach(btn => {
        btn.addEventListener("click", function(e){
          e.stopPropagation();
          const id = this.dataset.id;
          fetch(`/api/articles?id=${id}`)
            .then(response => response.json())
            .then(article => {
              articleIdInput.value = article.id;
              articleTitleInput.value = article.title;
              articleDescriptionInput.value = article.description;
              articleContentInput.value = article.content;
              if(article.image){
                currentArticleImageUrl = article.image;
                imagePreview.src = article.image;
                imagePreview.style.display = "block";
                imagePreview.style.maxWidth = "150px";
                imagePreview.style.maxHeight = "150px";
                if(imagePlaceholder) imagePlaceholder.style.display = "none";
              } else {
                currentArticleImageUrl = "";
                imagePreview.src = "";
                imagePreview.style.display = "none";
                if(imagePlaceholder) imagePlaceholder.style.display = "block";
              }
              articleModalTitle.textContent = "Редактировать статью";
              articleVisibleInput.checked = article.visible !== false;
              articleImageInput.value = "";
              articleModal.classList.add("active");
            })
            .catch(err => console.error("Error fetching article", err));
        });
      });
      document.querySelectorAll(".delete-article-btn").forEach(btn => {
        btn.addEventListener("click", function(e){
          e.stopPropagation();
          const id = this.dataset.id;
          fetch(`/api/articles/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => loadArticles())
            .catch(err => console.error("Error deleting article", err));
        });
      });
    }
  }
  function renderPaginationControls(articles){
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(articles.length / articlesPerPage);
    if(totalPages <= 1){
      paginationContainer.style.display = "none";
      return;
    }
    paginationContainer.style.display = "block";
    for(let i=1; i<=totalPages; i++){
      const pageBtn = document.createElement("button");
      pageBtn.textContent = i;
      if(i === currentPage) pageBtn.disabled = true;
      pageBtn.addEventListener("click", function(){
        currentPage = i;
        renderArticles(articles);
      });
      paginationContainer.appendChild(pageBtn);
    }
  }
  function openArticleDetailModal(article){
    articleDetailContent.innerHTML = `
      <img src="${article.image ? article.image : 'images/default.jpg'}" alt="${article.title}">
      <h2>${article.title}</h2>
      <div class="blog-meta"></div>
      <p>${article.description ? article.description : ""}</p>
      <div>${article.content ? article.content : ""}</div>
    `;
    detailModal.classList.add("active");
  }
  if(closeArticleDetailModal){
    closeArticleDetailModal.addEventListener("click", function(){
      detailModal.classList.remove("active");
    });
  }
  editorLoginBtn.addEventListener("click", function(){
    loginModal.classList.add("active");
  });
  document.getElementById("close-login-modal").addEventListener("click", function(){
    loginModal.classList.remove("active");
    loginError.style.display = "none";
  });
  loginForm.addEventListener("submit", function(e){
    e.preventDefault();
    const password = loginPasswordInput.value;
    fetch('/api/verifyPassword', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ password })
    }).then(response => response.json())
      .then(data => {
        if(data.success){
          isAdmin = true;
          loginModal.classList.remove("active");
          editorLoginBtn.classList.add("hidden");
          addArticleBtn.classList.remove("hidden");
          loadArticles();
        } else {
          loginError.style.display = "block";
        }
      })
      .catch(err => {
        console.error("Error verifying password", err);
        loginError.style.display = "block";
      });
  });
  addArticleBtn.addEventListener("click", function(){
    articleIdInput.value = "";
    articleForm.reset();
    currentArticleImageUrl = "";
    if(imagePreview){
      imagePreview.src = "";
      imagePreview.style.display = "none";
    }
    if(imagePlaceholder){
      imagePlaceholder.style.display = "block";
    }
    articleModalTitle.textContent = "Добавить статью";
    articleVisibleInput.checked = true;
    articleModal.classList.add("active");
  });
  closeArticleModal.addEventListener("click", function(){
    articleModal.classList.remove("active");
  });
  articleForm.addEventListener("submit", function(e){
    e.preventDefault();
    const uploadFile = articleImageInput.files[0];
    function submitArticle(imageUrl){
      const articleData = {
        id: articleIdInput.value,
        title: articleTitleInput.value,
        image: imageUrl !== "" ? imageUrl : currentArticleImageUrl,
        description: articleDescriptionInput.value,
        content: articleContentInput.value,
        visible: articleVisibleInput.checked
      };
      let method = articleData.id ? 'PUT' : 'POST';
      let url = '/api/articles';
      if(articleData.id) url += '/' + articleData.id;
      fetch(url, {
        method: method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(articleData)
      }).then(response => response.json())
        .then(data => {
          articleModal.classList.remove("active");
          loadArticles();
        })
        .catch(err => console.error("Error saving article", err));
    }
    if(uploadFile){
      const formData = new FormData();
      formData.append('articleImage', uploadFile);
      fetch('/api/uploadArticleImage', {
        method: 'POST',
        body: formData
      }).then(response => response.json())
        .then(data => {
          if(data.success){
            submitArticle(data.imageUrl);
          } else {
            submitArticle("");
          }
        })
        .catch(err => {
          console.error("Error uploading image", err);
          submitArticle("");
        });
    } else {
      submitArticle("");
    }
  });
  loadArticles();
  articleImageInput.addEventListener('change', function(){
    const file = this.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = function(e){
        if(imagePreview){
          imagePreview.src = e.target.result;
          imagePreview.style.display = "block";
          imagePreview.style.maxWidth = "150px";
          imagePreview.style.maxHeight = "150px";
        }
        if(imagePlaceholder) imagePlaceholder.style.display = "none";
      }
      reader.readAsDataURL(file);
    } else {
      if(imagePreview) imagePreview.style.display = "none";
      if(imagePlaceholder) imagePlaceholder.style.display = "block";
    }
  });
  const imageUploadContainer = document.querySelector(".image-upload-container");
  if(imageUploadContainer){
    imageUploadContainer.addEventListener('dragover', function(e){
      e.preventDefault();
      imageUploadContainer.classList.add('dragover');
    });
    imageUploadContainer.addEventListener('dragleave', function(e){
      e.preventDefault();
      imageUploadContainer.classList.remove('dragover');
    });
    imageUploadContainer.addEventListener('drop', function(e){
      e.preventDefault();
      imageUploadContainer.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if(files && files.length > 0){
        articleImageInput.files = files;
        const file = files[0];
        const reader = new FileReader();
        reader.onload = function(e){
          if(imagePreview){
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
            imagePreview.style.maxWidth = "150px";
            imagePreview.style.maxHeight = "150px";
          }
          if(imagePlaceholder) imagePlaceholder.style.display = "none";
        }
        reader.readAsDataURL(file);
      }
    });
  }
});
