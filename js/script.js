document.addEventListener("DOMContentLoaded", function () {
  // Глобальный счетчик и карта для хранения данных о каждом человеке
  let personIdCounter = 0;
  const personById = {};

  // Флаги режима выбора родителя и супруга
  let isSelectingParent = false;
  let selectedParentId = null;
  let isSelectingSpouse = false;
  let selectedSpouseId = null;
  let currentPersonId = null; // для редактирования/удаления
  let isEditing = false; // режим редактирования

  // Глобальная переменная для данных дерева, которые будут загружены из JSON
  let treeData = [];

  // Начальные параметры трансформации
  let scale = 1, translateX = 0, translateY = 0;

  function updateTransform() {
    const treeContainer = document.getElementById('tree-container');
    treeContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  // Функция генерации HTML дерева с data-id для каждой карточки
  function generateTree(nodes) {
    let html = '<ul>';
    nodes.forEach(node => {
      const id = personIdCounter++;
      node.id = id; // присваиваем уникальный id непосредственно объекту
      personById[id] = node;
      html += '<li>';
      if (node.spouse) {
        html += `<a href="#" class="person-card spouse-card" data-id="${id}">
                   <div class="spouse-part">
                     <img src="${node.img}" draggable="false">
                     <span>${node.name}</span>
                     <span>${node.years}</span>
                   </div>
                   <div class="spouse-part">
                     <img src="${node.spouse.img}" draggable="false">
                     <span>${node.spouse.name}</span>
                     <span>${node.spouse.years}</span>
                   </div>
                 </a>`;
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

  // Функция для загрузки данных из treeData.json
  function loadTreeData() {
    fetch("treeData.json")
      .then(response => response.json())
      .then(data => {
        treeData = data;
        personIdCounter = 0;
        Object.keys(personById).forEach(key => delete personById[key]);
        const treeRoot = document.getElementById("tree-root");
        treeRoot.innerHTML = generateTree(treeData);
        // Вместо центрирования, устанавливаем начальное положение так,
        // чтобы левая часть дерева была видна (translateX = 0)
        setTimeout(() => {
          translateX = 0;
          translateY = 0;
          updateTransform();
        }, 100);
      })
      .catch(error => console.error("Ошибка загрузки treeData.json:", error));
  }

  loadTreeData();

  // Обработчик клика по дереву
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

  // Модальное окно для детальной информации
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
    document.getElementById('modal-father').textContent = person.father;
    document.getElementById('modal-mother').textContent = person.mother;
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

  // Функционал зума и перетаскивания дерева (ПК и планшеты)
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
      updateTransform();
    }
  });

  // Добавляем поддержку touch событий для мобильных устройств
  wrapper.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      initialDistance = getDistance(e.touches[0], e.touches[1]);
      initialScale = scale;
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
      scale = initialScale * pinchScale;
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

  /* --- Функционал формы добавления/редактирования ребенка --- */
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
    submitChildBtn.textContent = "Добавить";
    chooseParentBtn.textContent = "Выбрать родителя";
    addChildModal.classList.add('active');
  });
  closeAddModal.addEventListener('click', function () {
    addChildModal.classList.remove('active');
  });
  chooseParentBtn.addEventListener('click', function () {
    addChildModal.classList.remove('active');
    selectedParentText.textContent = "Выберите родителя...";
    isSelectingParent = true;
  });
  addChildForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const newChild = {
      img: "",
      name: document.getElementById('new-name').value,
      gender: document.getElementById('new-gender').value,
      years: document.getElementById('new-years').value,
      profession: document.getElementById('new-profession').value,
      birthPlace: document.getElementById('new-birthPlace').value,
      bio: document.getElementById('new-bio').value,
      father: "",
      mother: "",
      children: []
    };
    const photoInput = document.getElementById('new-photo');
    if (photoInput.files && photoInput.files[0]) {
      newChild.img = URL.createObjectURL(photoInput.files[0]);
    } else {
      newChild.img = newChild.gender === "Мужской" ? "images/default_male.jpg" : "images/default_female.jpg";
    }
    if (isEditing && currentPersonId !== null && personById[currentPersonId]) {
      const person = personById[currentPersonId];
      person.img = newChild.img;
      person.name = newChild.name;
      person.gender = newChild.gender;
      person.years = newChild.years;
      person.profession = newChild.profession;
      person.birthPlace = newChild.birthPlace;
      person.bio = newChild.bio;
      if (selectedParentId && personById[selectedParentId]) {
        const parent = personById[selectedParentId];
        if (parent.gender === "Мужской") {
          person.parentRole = "Папа";
          person.father = parent.name;
        } else {
          person.parentRole = "Мама";
          person.mother = parent.name;
        }
      }
    } else {
      if (selectedParentId && personById[selectedParentId]) {
        const parent = personById[selectedParentId];
        if (parent.gender === "Мужской") {
          newChild.parentRole = "Папа";
          newChild.father = parent.name;
        } else {
          newChild.parentRole = "Мама";
          newChild.mother = parent.name;
        }
        if (!parent.children) parent.children = [];
        parent.children.push(newChild);
      } else {
        treeData.push(newChild);
      }
    }
    addChildForm.reset();
    selectedParentId = null;
    selectedParentText.textContent = "Родитель не выбран";
    addChildModal.classList.remove('active');
    personIdCounter = 0;
    Object.keys(personById).forEach(key => delete personById[key]);
    treeRoot.innerHTML = generateTree(treeData);
    isEditing = false;
    submitChildBtn.textContent = "Добавить";
    chooseParentBtn.textContent = "Выбрать родителя";
  });

  /* --- Функционал формы добавления супруга(-ы) --- */
  const addSpouseBtn = document.getElementById('add-spouse-btn');
  const addSpouseModal = document.getElementById('add-spouse-modal');
  const closeSpouseModal = document.getElementById('close-spouse-modal');
  const addSpouseForm = document.getElementById('add-spouse-form');
  const chooseSpouseBtn = document.getElementById('choose-spouse-btn');
  const selectedSpouseText = document.getElementById('selected-spouse-text');
  const submitSpouseBtn = document.getElementById('submit-spouse-btn');

  addSpouseBtn.addEventListener('click', function () {
    addSpouseForm.reset();
    submitSpouseBtn.textContent = "Добавить";
    chooseSpouseBtn.textContent = "Выбрать супруга(-у)";
    addSpouseModal.classList.add('active');
  });

  closeSpouseModal.addEventListener('click', function () {
    addSpouseModal.classList.remove('active');
  });

  chooseSpouseBtn.addEventListener('click', function () {
    addSpouseModal.classList.remove('active');
    selectedSpouseText.textContent = "Выберите супруга(-у)...";
    isSelectingSpouse = true;
  });

  addSpouseForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (selectedSpouseId && personById[selectedSpouseId]) {
      const spouseData = {
        img: "",
        name: document.getElementById('new-spouse-name').value,
        gender: document.getElementById('new-spouse-gender').value,
        years: document.getElementById('new-spouse-years').value,
        profession: document.getElementById('new-spouse-profession').value,
        birthPlace: document.getElementById('new-spouse-birthPlace').value,
        bio: document.getElementById('new-spouse-bio').value
      };
      const photoInput = document.getElementById('new-spouse-photo');
      if (photoInput.files && photoInput.files[0]) {
        spouseData.img = URL.createObjectURL(photoInput.files[0]);
      } else {
        spouseData.img = spouseData.gender === "Мужской" ? "images/default_male.jpg" : "images/default_female.jpg";
      }
      const person = personById[selectedSpouseId];
      person.spouse = spouseData;
      addSpouseForm.reset();
      selectedSpouseId = null;
      selectedSpouseText.textContent = "Супруг(а) не выбран";
      addSpouseModal.classList.remove('active');
      personIdCounter = 0;
      Object.keys(personById).forEach(key => delete personById[key]);
      treeRoot.innerHTML = generateTree(treeData);
    }
  });

  // --- Обработчики для навигационных кнопок контейнера ---
  const navUp = document.querySelector(".navigation-controls .up");
  const navDown = document.querySelector(".navigation-controls .down");
  const navLeft = document.querySelector(".navigation-controls .left");
  const navRight = document.querySelector(".navigation-controls .right");
  const zoomPlus = document.querySelector(".navigation-controls .plus");
  const zoomMinus = document.querySelector(".navigation-controls .minus");

  const panStep = 50; // шаг перемещения
  const zoomStep = 1.1; // коэффициент зума

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
      updateTransform();
    });
  }
  if (zoomMinus) {
    zoomMinus.addEventListener("click", function() {
      scale /= zoomStep;
      updateTransform();
    });
  }

  // --- Обработчики для кнопок редактирования и удаления в модальном окне ---
  const editBtn = document.getElementById("edit-btn");
  const deleteBtn = document.getElementById("delete-btn");

  if (editBtn) {
    editBtn.addEventListener("click", function() {
      if (currentPersonId !== null && personById[currentPersonId]) {
        const person = personById[currentPersonId];
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
        if ((person.parentRole === "Папа" && person.father) || (person.parentRole === "Мама" && person.mother)) {
          selectedParentText.textContent = `Родитель: ${person.parentRole === "Папа" ? person.father : person.mother}`;
        } else {
          selectedParentText.textContent = "Родитель не выбран";
        }
        chooseParentBtn.textContent = "Сменить родителя";
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", function() {
      if (currentPersonId !== null) {
        if (confirm("Вы действительно хотите удалить эту карточку?")) {
          function removePersonById(id, nodes) {
            for (let i = 0; i < nodes.length; i++) {
              if (nodes[i].id === id) {
                nodes.splice(i, 1);
                return true;
              } else if (nodes[i].children && nodes[i].children.length) {
                const removed = removePersonById(id, nodes[i].children);
                if (removed) return true;
              }
            }
            return false;
          }
          removePersonById(parseInt(currentPersonId), treeData);
          modal.classList.remove('active');
          personIdCounter = 0;
          Object.keys(personById).forEach(key => delete personById[key]);
          treeRoot.innerHTML = generateTree(treeData);
        }
      }
    });
  }

  // --- Новая функциональность: Кнопка "Расширить контейнер" ---
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
