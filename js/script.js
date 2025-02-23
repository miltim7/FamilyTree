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
  function updateTransform() {
    const treeContainer = document.getElementById('tree-container');
    treeContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
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
    fetch("treeData.json")
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
      .catch(error => console.error("Ошибка загрузки treeData.json:", error));
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
    document.getElementById('modal-photo').src = person.img;
    document.getElementById('modal-name').textContent = person.name;
    document.getElementById('modal-gender').textContent = person.gender;
    document.getElementById('modal-years').textContent = person.years;
    document.getElementById('modal-profession').textContent = person.profession;
    document.getElementById('modal-birthPlace').textContent = person.birthPlace;
    document.getElementById('modal-bio').textContent = person.bio;
    if (person.parentRole === "Папа") {
      document.getElementById('modal-father-label').textContent = "Папа:";
    } else {
      document.getElementById('modal-father-label').textContent = "Отец:";
    }
    if (person.parentRole === "Мама") {
      document.getElementById('modal-mother-label').textContent = "Мама:";
    } else {
      document.getElementById('modal-mother-label').textContent = "Мать:";
    }
    document.getElementById('modal-father').textContent = person.father || "";
    document.getElementById('modal-mother').textContent = person.mother || "";
    document.getElementById('modal-children').textContent =
      person.children && person.children.length
        ? person.children.map(child => child.name).join(', ')
        : "Нет данных";
    modal.classList.add('active');
  }
  function hideModal() {
    modal.classList.remove('active');
  }
  document.getElementById('close-modal').addEventListener('click', hideModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) hideModal();
  });
  const wrapper = document.getElementById('tree-container-wrapper');
  const treeContainer = document.getElementById('tree-container');
  let isDragging = false, startX, startY;
  function updateTransform() {
    treeContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }
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
      translateX = offsetX - zoomFactor * (offsetX - translateX);
      translateY = offsetY - zoomFactor * (offsetY - translateY);
      scale *= zoomFactor;
      if (scale > maxScale) scale = maxScale;
      if (scale < minScale) scale = minScale;
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
  }, {passive: false});
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
  }, {passive: false});
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
    selectedParentId = null;
    selectedParentText.textContent = "Родитель не выбран";
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
    }
    addChildForm.reset();
    selectedParentId = null;
    selectedParentText.textContent = "Родитель не выбран";
    addChildModal.classList.remove('active');
    personIdCounter = 0;
    Object.keys(personById).forEach(key => delete personById[key]);
    treeRoot.innerHTML = generateTree(treeData);
    isEditing = false;
    submitChildBtn.textContent = "Сохранить";
    chooseParentBtn.style.display = "inline-block";
    chooseParentBtn.textContent = "Выбрать родителя";
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
    addSpouseModal.classList.remove('active');
    personIdCounter = 0;
    Object.keys(personById).forEach(key => delete personById[key]);
    treeRoot.innerHTML = generateTree(treeData);
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
    navUp.addEventListener("click", function() {
      translateY -= panStep;
      updateTransform();
    });
  }
  if (navDown) {
    navDown.addEventListener("click", function() {
      translateY += panStep;
      updateTransform();
    });
  }
  if (navLeft) {
    navLeft.addEventListener("click", function() {
      translateX -= panStep;
      updateTransform();
    });
  }
  if (navRight) {
    navRight.addEventListener("click", function() {
      translateX += panStep;
      updateTransform();
    });
  }
  if (zoomPlus) {
    zoomPlus.addEventListener("click", function() {
      scale *= zoomStep;
      if (scale > maxScale) scale = maxScale;
      updateTransform();
    });
  }
  if (zoomMinus) {
    zoomMinus.addEventListener("click", function() {
      scale /= zoomStep;
      if (scale < minScale) scale = minScale;
      updateTransform();
    });
  }
  const editBtn = document.getElementById("edit-btn");
  const deleteBtn = document.getElementById("delete-btn");
  if (editBtn) {
    editBtn.addEventListener("click", function() {
      if (currentPersonId !== null && personById[currentPersonId]) {
        const person = personById[currentPersonId];
        if (person.isSpouse) {
          document.getElementById('new-spouse-name').value = person.name;
          document.getElementById('new-spouse-gender').value = person.gender;
          document.getElementById('new-spouse-years').value = person.years;
          document.getElementById('new-spouse-profession').value = person.profession;
          document.getElementById('new-spouse-birthPlace').value = person.birthPlace;
          document.getElementById('new-spouse-bio').value = person.bio;
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
    deleteBtn.addEventListener("click", function() {
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
      }
    });
  }
  const expandBtn = document.getElementById("expand-container-btn");
  expandBtn.addEventListener("click", function() {
    const container = document.getElementById("tree-container-wrapper");
    container.classList.toggle("expanded");
    if (container.classList.contains("expanded")) {
      expandBtn.textContent = "Свернуть контейнер";
    } else {
      expandBtn.textContent = "Расширить контейнер";
    }
  });
});
