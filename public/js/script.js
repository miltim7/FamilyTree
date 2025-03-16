document.addEventListener("DOMContentLoaded", function () {

  
  let personIdCounter = 0;
  const personById = {};
  let isSelectingParent = false;
  let selectedParentId = null;
  let isSelectingSpouse = false;
  let selectedSpouseId = null;
  let currentPersonId = null;
  let isEditing = false;
  let treeData = [];
  let scale = 1, translateX = 0, translateY = 0;
  const minScale = 0.3, maxScale = 2;
  let selectedArticleId = null;
  let selectedArticleSpouseId = null;
  function updateTransform() {
    const treeContainer = document.getElementById('tree-container');
    treeContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }
  function saveTreeData() {
    fetch('/api/treeData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(treeData)
    }).then(response => response.json())
      .then(data => console.log('Data saved', data))
      .catch(err => console.error('Error saving data', err));
  }
  function findParentBySpouseId(spouseId, nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].spouse && nodes[i].spouse.id == spouseId) {
        return nodes[i];
      }
      if (nodes[i].children && nodes[i].children.length) {
        let found = findParentBySpouseId(spouseId, nodes[i].children);
        if (found) return found;
      }
    }
    return null;
  }
  function generateTree(nodes) {
    let html = '<ul>';
    nodes.forEach(node => {
      const id = personIdCounter++;
      node.id = id;
      personById[id] = node;
      html += '<li>';
      if (node.spouse) {
        const spouseId = personIdCounter++;
        node.spouse.id = spouseId;
        node.spouse.isSpouse = true;
        personById[spouseId] = node.spouse;
        html += `<div class="spouse-cards">
                   <a href="#" class="person-card" data-id="${id}">
                     <img src="${node.img}" draggable="false">
                     <span>${node.name}</span>
                     <span>${node.years}</span>
                   </a>
                   <a href="#" class="person-card" data-id="${spouseId}">
                     <img src="${node.spouse.img}" draggable="false">
                     <span>${node.spouse.name}</span>
                     <span>${node.spouse.years}</span>
                   </a>
                 </div>`;
      } else {
        html += `<a href="#" class="person-card" data-id="${id}">
                   <img src="${node.img}" draggable="false">
                   <span>${node.name}</span>
                   <span>${node.years}</span>
                 </a>`;
      }
      if (node.children && node.children.length) {
        html += generateTree(node.children);
      }
      html += '</li>';
    });
    html += '</ul>';
    return html;
  }
  function loadTreeData() {
    fetch("api/treeData")
      .then(response => response.json())
      .then(data => {
        treeData = data;
        personIdCounter = 0;
        Object.keys(personById).forEach(key => delete personById[key]);
        const treeRoot = document.getElementById("tree-root");
        treeRoot.innerHTML = generateTree(treeData);
        setTimeout(() => {
          translateX = 0;
          translateY = 0;
          updateTransform();
        }, 100);
      })
      .catch(error => console.error("Ошибка загрузки данных:", error));
  }
  loadTreeData();
  const treeRoot = document.getElementById("tree-root");
  treeRoot.addEventListener('click', function (e) {
    const card = e.target.closest('.person-card');
    if (!card) return;
    e.preventDefault();
    if (isSelectingParent) {
      selectedParentId = card.dataset.id;
      const selectedName = card.querySelector('span').textContent;
      document.getElementById('selected-parent-text').textContent = `Выбран родитель: ${selectedName}`;
      isSelectingParent = false;
      document.getElementById('add-child-modal').classList.add('active');
    } else if (isSelectingSpouse) {
      selectedSpouseId = card.dataset.id;
      const selectedName = card.querySelector('span').textContent;
      document.getElementById('selected-spouse-text').textContent = `Выбран супруг(а): ${selectedName}`;
      isSelectingSpouse = false;
      document.getElementById('add-spouse-modal').classList.add('active');
    } else {
      currentPersonId = card.dataset.id;
      const person = personById[currentPersonId];
      if (person) {
        showModal(person);
      }
    }
  });
  const modal = document.getElementById('person-modal');
  function showModal(person) {
    const modal = document.getElementById('person-modal');
    modal.querySelector('#modal-photo').src = person.img;
    modal.querySelector('#modal-name').textContent = person.name;
    modal.querySelector('#modal-gender').textContent = person.gender;
    modal.querySelector('#modal-years').textContent = person.years;
    modal.querySelector('#modal-profession').textContent = person.profession;
    modal.querySelector('#modal-birthPlace').textContent = person.birthPlace;
    modal.querySelector('#modal-bio').textContent = person.bio;
    if (person.parentRole === "Папа") {
      modal.querySelector('#modal-father-label').textContent = "Папа:";
    } else {
      modal.querySelector('#modal-father-label').textContent = "Отец:";
    }
    if (person.parentRole === "Мама") {
      modal.querySelector('#modal-mother-label').textContent = "Мама:";
    } else {
      modal.querySelector('#modal-mother-label').textContent = "Мать:";
    }
    modal.querySelector('#modal-father').textContent = person.father || "";
    modal.querySelector('#modal-mother').textContent = person.mother || "";
    modal.querySelector('#modal-children').textContent = person.children && person.children.length ? person.children.map(child => child.name).join(', ') : "Нет данных";
    if (person.articleId) {
      modal.querySelector('#modal-article').innerHTML = `<a href="articles.html?id=${person.articleId}" target="_blank">Посмотреть статью</a>`;
    } else {
      modal.querySelector('#modal-article').textContent = "Нет данных";
    }
    const editorButtons = document.getElementById('editor-buttons');
    if (editorButtons && editorButtons.style.display === "block") {
      modal.querySelector('#edit-btn').style.display = "block";
      modal.querySelector('#delete-btn').style.display = "block";
    } else {
      modal.querySelector('#edit-btn').style.display = "none";
      modal.querySelector('#delete-btn').style.display = "none";
    }
    modal.classList.add('active');
  }
  function hideModal() {
    modal.classList.remove('active');
  }
  document.getElementById('close-modal').addEventListener('click', hideModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) hideModal();
  });
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const editorLoginBtn = document.getElementById('editor-login-btn');
  const editorButtons = document.getElementById('editor-buttons');
  const loginError = document.getElementById('login-error');
  editorLoginBtn.addEventListener('click', function () {
    loginModal.classList.add('active');
  });
  document.getElementById('close-login-modal').addEventListener('click', function () {
    loginModal.classList.remove('active');
    loginError.style.display = "none";
  });
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const password = document.getElementById('login-password').value;
    fetch('/api/verifyPassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    }).then(response => response.json())
      .then(data => {
        if (data.success) {
          loginModal.classList.remove('active');
          editorLoginBtn.style.display = "none";
          editorButtons.style.display = "block";
        } else {
          loginError.style.display = "block";
        }
      })
      .catch(err => {
        console.error('Error verifying password', err);
        loginError.style.display = "block";
      });
  });
  const articleSelectionModal = document.getElementById('article-selection-modal');
  const closeArticleSelectionModal = document.getElementById('close-article-selection-modal');
  const articleSelectionList = document.getElementById('article-selection-list');
  function loadArticleSelection(callback) {
    fetch('/api/articles')
      .then(response => response.json())
      .then(articles => {
        articleSelectionList.innerHTML = "";
        articles.forEach(article => {
          const item = document.createElement('div');
          item.classList.add('article-selection-item');
          item.innerHTML = `<strong>${article.title}</strong>`;
          item.dataset.id = article.id;
          item.addEventListener('click', function () {
            if (articleSelectionModal.dataset.for === "child") {
              selectedArticleId = article.id;
              document.getElementById('selected-article-text').textContent = `Статья: ${article.title}`;
              articleSelectionModal.classList.remove('active');
              document.getElementById('add-child-modal').classList.add('active');
            } else if (articleSelectionModal.dataset.for === "spouse") {
              selectedArticleSpouseId = article.id;
              document.getElementById('selected-article-spouse-text').textContent = `Статья: ${article.title}`;
              articleSelectionModal.classList.remove('active');
              document.getElementById('add-spouse-modal').classList.add('active');
            }
          });
          articleSelectionList.appendChild(item);
        });
        if (callback) callback();
      })
      .catch(err => console.error("Error loading articles for selection", err));
  }
  document.getElementById('choose-article-btn').addEventListener('click', function () {
    document.getElementById('add-child-modal').classList.remove('active');
    articleSelectionModal.dataset.for = "child";
    loadArticleSelection();
    articleSelectionModal.classList.add('active');
  });
  document.getElementById('choose-article-spouse-btn').addEventListener('click', function () {
    document.getElementById('add-spouse-modal').classList.remove('active');
    articleSelectionModal.dataset.for = "spouse";
    loadArticleSelection();
    articleSelectionModal.classList.add('active');
  });
  closeArticleSelectionModal.addEventListener('click', function () {
    articleSelectionModal.classList.remove('active');
    if (articleSelectionModal.dataset.for === "child") {
      document.getElementById('add-child-modal').classList.add('active');
    } else if (articleSelectionModal.dataset.for === "spouse") {
      document.getElementById('add-spouse-modal').classList.add('active');
    }
  });
  const wrapper = document.getElementById('tree-container-wrapper');
  const treeContainer = document.getElementById('tree-container');
  let isDragging = false, startX, startY;
  updateTransform();
  treeContainer.addEventListener('dragstart', e => e.preventDefault());
  wrapper.addEventListener('mousedown', e => {
    if (!e.ctrlKey) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      wrapper.style.cursor = "grabbing";
    }
  });
  wrapper.addEventListener('mousemove', e => {
    if (isDragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = e.clientX;
      startY = e.clientY;
      translateX += dx;
      translateY += dy;
      updateTransform();
    }
  });
  wrapper.addEventListener('mouseup', () => {
    isDragging = false;
    wrapper.style.cursor = "grab";
  });
  wrapper.addEventListener('mouseleave', () => {
    isDragging = false;
    wrapper.style.cursor = "grab";
  });
  wrapper.addEventListener('wheel', e => {
    if (e.ctrlKey) {
      e.preventDefault();
      const rect = wrapper.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      let newScale = scale * zoomFactor;
      if (newScale > maxScale) {
        if (scale >= maxScale) return;
        newScale = maxScale;
      }
      if (newScale < minScale) {
        if (scale <= minScale) return;
        newScale = minScale;
      }
      const factor = newScale / scale;
      translateX = offsetX - factor * (offsetX - translateX);
      translateY = offsetY - factor * (offsetY - translateY);
      scale = newScale;
      updateTransform();
    }
  });
  let initialDistance = null, initialScale = null, initialTranslateX = null, initialTranslateY = null;
  let initialCenterX = null, initialCenterY = null;
  wrapper.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      initialDistance = getDistance(e.touches[0], e.touches[1]);
      initialScale = scale;
      initialTranslateX = translateX;
      initialTranslateY = translateY;
      initialCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      initialCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
  }, { passive: false });
  wrapper.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      translateX += dx;
      translateY += dy;
      updateTransform();
    } else if (e.touches.length === 2) {
      let currentDistance = getDistance(e.touches[0], e.touches[1]);
      let pinchScale = currentDistance / initialDistance;
      let newScale = initialScale * pinchScale;
      if (newScale > maxScale) newScale = maxScale;
      if (newScale < minScale) newScale = minScale;
      let currentCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      let currentCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      translateX = currentCenterX - (currentCenterX - initialTranslateX) * (newScale / initialScale);
      translateY = currentCenterY - (currentCenterY - initialTranslateY) * (newScale / initialScale);
      scale = newScale;
      updateTransform();
    }
  }, { passive: false });
  wrapper.addEventListener('touchend', function (e) {
    if (e.touches.length === 0) {
      isDragging = false;
      initialDistance = null;
    }
  });
  function getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  const addChildBtn = document.getElementById('add-child-btn');
  const addChildModal = document.getElementById('add-child-modal');
  const closeAddModal = document.getElementById('close-add-modal');
  const addChildForm = document.getElementById('add-child-form');
  const chooseParentBtn = document.getElementById('choose-parent-btn');
  const selectedParentText = document.getElementById('selected-parent-text');
  const submitChildBtn = document.getElementById('submit-child-btn');
  addChildBtn.addEventListener('click', function () {
    isEditing = false;
    addChildForm.reset();
    submitChildBtn.textContent = "Сохранить";
    chooseParentBtn.style.display = "inline-block";
    chooseParentBtn.textContent = "Выбрать родителя";
    document.getElementById('choose-article-btn').style.display = "inline-block";
    document.getElementById('selected-article-text').textContent = "Статья не выбрана";
    selectedParentId = null;
    selectedParentText.textContent = "Родитель не выбран";
    selectedArticleId = null;
    document.querySelector('#add-child-modal h2').textContent = "Добавить ребенка";
    addChildModal.classList.add('active');
  });
  closeAddModal.addEventListener('click', function () {
    addChildModal.classList.remove('active');
  });
  chooseParentBtn.addEventListener('click', function () {
    if (!isEditing) {
      addChildModal.classList.remove('active');
      selectedParentText.textContent = "Выберите родителя...";
      isSelectingParent = true;
    }
  });
  addChildForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (document.getElementById('new-name').value.trim() === "") {
      alert("Введите имя");
      return;
    }
    if (!isEditing && !selectedParentId) {
      alert("Нужно выбрать родителя");
      return;
    }
    const photoInput = document.getElementById('new-photo');
    let newImg;
    if (photoInput.files && photoInput.files[0]) {
      newImg = URL.createObjectURL(photoInput.files[0]);
    } else {
      if (isEditing && personById[currentPersonId] && personById[currentPersonId].img) {
        newImg = personById[currentPersonId].img;
      } else {
        newImg = document.getElementById('new-gender').value === "Мужской" ? "images/default_male.jpg" : "images/default_female.jpg";
      }
    }
    const newChild = {
      img: newImg,
      name: document.getElementById('new-name').value,
      gender: document.getElementById('new-gender').value,
      years: document.getElementById('new-years').value,
      profession: document.getElementById('new-profession').value,
      birthPlace: document.getElementById('new-birthPlace').value,
      bio: document.getElementById('new-bio').value,
      father: "",
      mother: "",
      parentId: isEditing ? personById[currentPersonId].parentId : selectedParentId,
      children: []
    };
    newChild.years = newChild.years.trim() ? newChild.years : "н/в";
    if (selectedArticleId) {
      newChild.articleId = selectedArticleId;
    }
    if (!isEditing) {
      if (selectedParentId && personById[selectedParentId]) {
        let parent = personById[selectedParentId];
        if (parent.isSpouse) {
          let mainParent = findParentBySpouseId(selectedParentId, treeData);
          if (mainParent) {
            parent = mainParent;
          }
        }
        if (parent.gender === "Мужской") {
          newChild.parentRole = "Папа";
          newChild.father = parent.name;
        } else {
          newChild.parentRole = "Мама";
          newChild.mother = parent.name;
        }
        newChild.parentId = parent.id;
        if (!parent.children) parent.children = [];
        parent.children.push(newChild);
      } else {
        treeData.push(newChild);
      }
    } else {
      const person = personById[currentPersonId];
      person.img = newChild.img;
      person.name = newChild.name;
      person.gender = newChild.gender;
      person.years = newChild.years;
      person.profession = newChild.profession;
      person.birthPlace = newChild.birthPlace;
      person.bio = newChild.bio;
      person.articleId = newChild.articleId;
    }
    addChildForm.reset();
    selectedParentId = null;
    selectedParentText.textContent = "Родитель не выбран";
    selectedArticleId = null;
    document.getElementById('selected-article-text').textContent = "Статья не выбрана";
    addChildModal.classList.remove('active');
    personIdCounter = 0;
    Object.keys(personById).forEach(key => delete personById[key]);
    treeRoot.innerHTML = generateTree(treeData);
    saveTreeData();
    isEditing = false;
    submitChildBtn.textContent = "Сохранить";
    chooseParentBtn.style.display = "inline-block";
    document.querySelector('#add-child-modal h2').textContent = "Добавить ребенка";
  });
  const addSpouseBtn = document.getElementById('add-spouse-btn');
  const addSpouseModal = document.getElementById('add-spouse-modal');
  const closeSpouseModal = document.getElementById('close-spouse-modal');
  const addSpouseForm = document.getElementById('add-spouse-form');
  const chooseSpouseBtn = document.getElementById('choose-spouse-btn');
  const selectedSpouseText = document.getElementById('selected-spouse-text');
  const submitSpouseBtn = document.getElementById('submit-spouse-btn');
  addSpouseBtn.addEventListener('click', function () {
    addSpouseForm.reset();
    submitSpouseBtn.textContent = "Сохранить";
    chooseSpouseBtn.style.display = "inline-block";
    document.getElementById('choose-article-spouse-btn').style.display = "inline-block";
    document.getElementById('selected-article-spouse-text').textContent = "Статья не выбрана";
    document.querySelector('#add-spouse-modal h2').textContent = "Добавить супруга(-у)";
    addSpouseModal.classList.add('active');
  });
  closeSpouseModal.addEventListener('click', function () {
    addSpouseModal.classList.remove('active');
  });
  chooseSpouseBtn.addEventListener('click', function () {
    if (!isEditing) {
      addSpouseModal.classList.remove('active');
      selectedSpouseText.textContent = "Выберите супруга(-у)...";
      isSelectingSpouse = true;
    }
  });
  addSpouseForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (document.getElementById('new-spouse-name').value.trim() === "") {
      alert("Введите имя");
      return;
    }
    if (!isEditing && !selectedSpouseId) {
      alert("Нужно выбрать супруга(-у)");
      return;
    }
    const photoInput = document.getElementById('new-spouse-photo');
    let newSpouseImg;
    const existingSpouse = personById[selectedSpouseId];
    if (photoInput.files && photoInput.files[0]) {
      newSpouseImg = URL.createObjectURL(photoInput.files[0]);
    } else {
      if (isEditing && existingSpouse && existingSpouse.img) {
        newSpouseImg = existingSpouse.img;
      } else {
        newSpouseImg = document.getElementById('new-spouse-gender').value === "Мужской" ? "images/default_male.jpg" : "images/default_female.jpg";
      }
    }
    const spouseData = {
      img: newSpouseImg,
      name: document.getElementById('new-spouse-name').value,
      gender: document.getElementById('new-spouse-gender').value,
      years: document.getElementById('new-spouse-years').value,
      profession: document.getElementById('new-spouse-profession').value,
      birthPlace: document.getElementById('new-spouse-birthPlace').value,
      bio: document.getElementById('new-spouse-bio').value,
      isSpouse: true
    };
    spouseData.years = spouseData.years.trim() ? spouseData.years : "н/в";
    if (selectedArticleSpouseId) {
      spouseData.articleId = selectedArticleSpouseId;
    }
    if (isEditing && selectedSpouseId) {
      let parentObj = null;
      function findParentOfSpouse(spouseId, nodes) {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].spouse && nodes[i].spouse.id == spouseId) {
            return nodes[i];
          }
          if (nodes[i].children && nodes[i].children.length) {
            let found = findParentOfSpouse(spouseId, nodes[i].children);
            if (found) return found;
          }
        }
        return null;
      }
      parentObj = findParentOfSpouse(selectedSpouseId, treeData);
      if (parentObj) {
        parentObj.spouse = spouseData;
      }
      personById[selectedSpouseId] = spouseData;
    } else {
      const person = personById[selectedSpouseId];
      person.spouse = spouseData;
    }
    addSpouseForm.reset();
    selectedSpouseId = null;
    selectedSpouseText.textContent = "Супруг(а) не выбран";
    document.getElementById('selected-article-spouse-text').textContent = "Статья не выбрана";
    addSpouseModal.classList.remove('active');
    personIdCounter = 0;
    Object.keys(personById).forEach(key => delete personById[key]);
    treeRoot.innerHTML = generateTree(treeData);
    saveTreeData();
  });
  const navUp = document.querySelector(".navigation-controls .up");
  const navDown = document.querySelector(".navigation-controls .down");
  const navLeft = document.querySelector(".navigation-controls .left");
  const navRight = document.querySelector(".navigation-controls .right");
  const zoomPlus = document.querySelector(".navigation-controls .plus");
  const zoomMinus = document.querySelector(".navigation-controls .minus");
  const panStep = 50;
  const zoomStep = 1.1;
  if (navUp) {
    navUp.addEventListener("click", function () {
      translateY -= panStep;
      updateTransform();
    });
  }
  if (navDown) {
    navDown.addEventListener("click", function () {
      translateY += panStep;
      updateTransform();
    });
  }
  if (navLeft) {
    navLeft.addEventListener("click", function () {
      translateX -= panStep;
      updateTransform();
    });
  }
  if (navRight) {
    navRight.addEventListener("click", function () {
      translateX += panStep;
      updateTransform();
    });
  }
  if (zoomPlus) {
    zoomPlus.addEventListener("click", function () {
      scale *= zoomStep;
      if (scale > maxScale) scale = maxScale;
      updateTransform();
    });
  }
  if (zoomMinus) {
    zoomMinus.addEventListener("click", function () {
      scale /= zoomStep;
      if (scale < minScale) scale = minScale;
      updateTransform();
    });
  }
  const editBtn = document.getElementById("edit-btn");
  const deleteBtn = document.getElementById("delete-btn");
  if (editBtn) {
    editBtn.addEventListener("click", function () {
      if (currentPersonId !== null && personById[currentPersonId]) {
        const person = personById[currentPersonId];
        if (person.isSpouse) {
          document.getElementById('new-spouse-name').value = person.name;
          document.getElementById('new-spouse-gender').value = person.gender;
          document.getElementById('new-spouse-years').value = person.years;
          document.getElementById('new-spouse-profession').value = person.profession;
          document.getElementById('new-spouse-birthPlace').value = person.birthPlace;
          document.getElementById('new-spouse-bio').value = person.bio;
          if (person.articleId) {
            selectedArticleSpouseId = person.articleId;
            document.getElementById('selected-article-spouse-text').textContent = `Статья ID: ${person.articleId}`;
          } else {
            document.getElementById('selected-article-spouse-text').textContent = "Статья не выбрана";
          }
          isEditing = true;
          selectedSpouseId = currentPersonId;
          addSpouseModal.classList.add('active');
          modal.classList.remove('active');
          submitSpouseBtn.textContent = "Сохранить";
          document.querySelector('#add-spouse-modal h2').textContent = "Редактировать супруга(-у)";
          chooseSpouseBtn.style.display = "none";
        } else {
          document.getElementById('new-name').value = person.name;
          document.getElementById('new-gender').value = person.gender;
          document.getElementById('new-years').value = person.years;
          document.getElementById('new-profession').value = person.profession;
          document.getElementById('new-birthPlace').value = person.birthPlace;
          document.getElementById('new-bio').value = person.bio;
          if (person.articleId) {
            selectedArticleId = person.articleId;
            document.getElementById('selected-article-text').textContent = `Статья ID: ${person.articleId}`;
          } else {
            document.getElementById('selected-article-text').textContent = "Статья не выбрана";
          }
          isEditing = true;
          addChildModal.classList.add('active');
          modal.classList.remove('active');
          submitChildBtn.textContent = "Сохранить";
          document.querySelector('#add-child-modal h2').textContent = "Редактировать ребенка";
          if (person.parentId) {
            selectedParentId = person.parentId;
            selectedParentText.textContent = `Родитель: ${person.parentRole === "Папа" ? person.father : person.mother}`;
          } else {
            selectedParentText.textContent = "Родитель не выбран";
          }
          chooseParentBtn.style.display = "none";
        }
      }
    });
  }
  if (deleteBtn) {
    deleteBtn.addEventListener("click", function () {
      if (currentPersonId !== null) {
        function removePersonById(id, nodes) {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id == id) {
              nodes.splice(i, 1);
              return true;
            } else if (nodes[i].children && nodes[i].children.length) {
              if (removePersonById(id, nodes[i].children)) return true;
            }
          }
          return false;
        }
        function removeSpouseById(id, nodes) {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].spouse && nodes[i].spouse.id == id) {
              delete nodes[i].spouse;
              return true;
            } else if (nodes[i].children && nodes[i].children.length) {
              if (removeSpouseById(id, nodes[i].children)) return true;
            }
          }
          return false;
        }
        if (personById[currentPersonId].isSpouse) {
          removeSpouseById(parseInt(currentPersonId), treeData);
        } else {
          removePersonById(parseInt(currentPersonId), treeData);
        }
        modal.classList.remove('active');
        personIdCounter = 0;
        Object.keys(personById).forEach(key => delete personById[key]);
        treeRoot.innerHTML = generateTree(treeData);
        saveTreeData();
      }
    });
  }
  const expandBtn = document.getElementById("expand-container-btn");
  expandBtn.addEventListener("click", function () {
    const container = document.getElementById("tree-container-wrapper");
    container.classList.toggle("expanded");
    if (container.classList.contains("expanded")) {
      expandBtn.textContent = "Свернуть контейнер";
    } else {
      expandBtn.textContent = "Расширить контейнер";
    }
  });
});
