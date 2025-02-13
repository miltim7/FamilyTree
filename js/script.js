document.addEventListener("DOMContentLoaded", function () {
  // Глобальный счетчик и карта для хранения данных о каждом человеке
  let personIdCounter = 0;
  const personById = {};

  // Флаг режима выбора родителя
  let isSelectingParent = false;
  let selectedParentId = null;

  // Данные дерева с расширенными полями
  const treeData = [
    {
      img: "images/1.jpg",
      name: "Child",
      gender: "Мужской",
      years: "1900-1290",
      profession: "Фермер",
      birthPlace: "Деревня А",
      bio: "Трудолюбивый человек с богатой историей.",
      father: "Неизвестен",
      mother: "Неизвестна",
      children: [
        {
          img: "images/2.jpg",
          name: "Grand Child",
          gender: "Женский",
          years: "1900-1290",
          profession: "Учитель",
          birthPlace: "Город Б",
          bio: "Заботливая учительница, посвятившая жизнь обучению детей.",
          father: "Child",
          mother: "Жена Child",
          children: [
            {
              img: "images/3.jpg",
              name: "Great Grand Child",
              gender: "Мужской",
              years: "1900-1290",
              profession: "Инженер",
              birthPlace: "Город В",
              bio: "Инновационный инженер с множеством идей.",
              father: "Grand Child",
              mother: "Жена Grand Child",
              children: []
            },
            {
              img: "images/4.jpg",
              name: "Great Grand Child",
              gender: "Женский",
              years: "1900-1290",
              profession: "Доктор",
              birthPlace: "Город Г",
              bio: "Сострадательная врач, помогающая людям.",
              father: "Grand Child",
              mother: "Жена Grand Child",
              children: []
            },
            {
              img: "images/4.jpg",
              name: "Great Grand Child",
              gender: "Мужской",
              years: "1900-1290",
              profession: "Художник",
              birthPlace: "Город Д",
              bio: "Творческий художник с яркой фантазией.",
              father: "Grand Child",
              mother: "Жена Grand Child",
              children: []
            }
          ]
        },
        {
          img: "images/2.jpg",
          name: "Grand Child",
          gender: "Мужской",
          years: "1900-1290",
          profession: "Механик",
          birthPlace: "Город Е",
          bio: "Опытный механик, знающий все тонкости техники.",
          father: "Child",
          mother: "Жена Child",
          children: [
            {
              img: "images/3.jpg",
              name: "Great Grand Child",
              gender: "Женский",
              years: "1900-1290",
              profession: "Медсестра",
              birthPlace: "Город Ж",
              bio: "Добрая медсестра, всегда готовая помочь.",
              father: "Grand Child",
              mother: "Жена Grand Child",
              children: []
            },
            {
              img: "images/4.jpg",
              name: "Great Grand Child",
              gender: "Мужской",
              years: "1900-1290",
              profession: "Юрист",
              birthPlace: "Город З",
              bio: "Остроумный юрист с большим опытом.",
              father: "Grand Child",
              mother: "Жена Grand Child",
              children: []
            },
            {
              img: "images/4.jpg",
              name: "Great Grand Child",
              gender: "Женский",
              years: "1900-1290",
              profession: "Повар",
              birthPlace: "Город И",
              bio: "Творческий повар, радующий гурманов.",
              father: "Grand Child",
              mother: "Жена Grand Child",
              children: []
            }
          ]
        },
        {
          img: "images/5.jpg",
          name: "Grand Child",
          gender: "Женский",
          years: "1900-1290",
          profession: "Учёный",
          birthPlace: "Город К",
          bio: "Страстная учёная, всегда ищущая новые знания.",
          father: "Child",
          mother: "Жена Child",
          children: [
            {
              img: "images/6.jpg",
              name: "Great Grand Child",
              gender: "Мужской",
              years: "1900-1290",
              profession: "Пилот",
              birthPlace: "Город Л",
              bio: "Отважный пилот, готовый к любым испытаниям.",
              father: "Grand Child",
              mother: "Жена Grand Child",
              children: []
            },
            {
              img: "images/7.jpg",
              name: "Great Grand Child",
              gender: "Женский",
              years: "1900-1290",
              profession: "Писатель",
              birthPlace: "Город М",
              bio: "Творческий писатель, любящий слова и ритмы.",
              father: "Grand Child",
              mother: "Жена Grand Child",
              children: []
            },
            {
              img: "images/8.jpg",
              name: "Great Grand Child",
              gender: "Мужской",
              years: "1900-1290",
              profession: "Музыкант",
              birthPlace: "Город Н",
              bio: "Талантливый музыкант, наполняющий мир звуками.",
              father: "Grand Child",
              mother: "Жена Grand Child",
              children: []
            },
            {
              img: "images/8.jpg",
              name: "Great Grand Child",
              gender: "Женский",
              years: "1900-1290",
              profession: "Танцовщица",
              birthPlace: "Город О",
              bio: "Выразительная танцовщица, владеющая искусством движения.",
              father: "Grand Child",
              mother: "Жена Grand Child",
              children: []
            },
            {
              img: "images/8.jpg",
              name: "Great Grand Child",
              gender: "Мужской",
              years: "1900-1290",
              profession: "Программист",
              birthPlace: "Город П",
              bio: "Опытный программист, создающий новые технологии.",
              father: "Grand Child",
              mother: "Жена Grand Child",
              children: []
            }
          ]
        },
        {
          img: "images/9.jpg",
          name: "Grand Child",
          gender: "Мужской",
          years: "1900-1290",
          profession: "Фермер",
          birthPlace: "Город Р",
          bio: "Преданный своему делу фермер, заботящийся о земле.",
          father: "Child",
          mother: "Жена Child",
          children: []
        }
      ]
    }
  ];

  // Функция генерации HTML дерева с data-id для каждой карточки
  function generateTree(nodes) {
    let html = '<ul>';
    nodes.forEach(node => {
      const id = personIdCounter++;
      personById[id] = node;
      html += `<li>
        <a href="#" class="person-card" data-id="${id}">
          <img src="${node.img}" draggable="false">
          <span>${node.name}</span>
          <span>${node.years}</span>
        </a>`;
      if (node.children && node.children.length) {
        html += generateTree(node.children);
      }
      html += '</li>';
    });
    html += '</ul>';
    return html;
  }

  // Вставляем сгенерированное дерево в #tree-root
  const treeRoot = document.getElementById("tree-root");
  treeRoot.innerHTML = generateTree(treeData);

  // Главный обработчик кликов по дереву.
  // Если режим выбора родителя включен, выбирается родитель (детальное окно не открывается).
  treeRoot.addEventListener('click', function (e) {
    const card = e.target.closest('.person-card');
    if (!card) return;
    e.preventDefault();
    if (isSelectingParent) {
      selectedParentId = card.dataset.id;
      selectedParentText.textContent = `Выбран родитель: ${card.querySelector('span').textContent}`;
      isSelectingParent = false;
      addChildModal.classList.add('active');
    } else {
      const id = card.dataset.id;
      const person = personById[id];
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

  // Функционал зума и перетаскивания дерева
  const wrapper = document.getElementById('tree-container-wrapper');
  const treeContainer = document.getElementById('tree-container');
  let scale = 1, translateX = 0, translateY = 0;
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

  /* --- Функционал формы добавления ребенка --- */
  const addChildBtn = document.getElementById('add-child-btn');
  const addChildModal = document.getElementById('add-child-modal');
  const closeAddModal = document.getElementById('close-add-modal');
  const addChildForm = document.getElementById('add-child-form');
  const chooseParentBtn = document.getElementById('choose-parent-btn');
  const selectedParentText = document.getElementById('selected-parent-text');

  addChildBtn.addEventListener('click', function () {
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
    addChildForm.reset();
    selectedParentId = null;
    selectedParentText.textContent = "Родитель не выбран";
    addChildModal.classList.remove('active');
    personIdCounter = 0;
    Object.keys(personById).forEach(key => delete personById[key]);
    treeRoot.innerHTML = generateTree(treeData);
  });
});
