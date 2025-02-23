const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

const dataFile = path.join(__dirname, 'treeData.json');
const articlesFile = path.join(__dirname, 'articles.json');
const editorPassword = 'admin123';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Обслуживание статических файлов из папки images (в том числе загруженных)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Настройка multer для загрузки изображений статьи: сохраняем в public/images/articles
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, 'public/images/articles');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage: storage });

app.post('/api/uploadArticleImage', upload.single('articleImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Нет файла' });
  }
  const imageUrl = '/images/articles/' + req.file.filename;
  res.json({ success: true, imageUrl });
});

app.get('/api/treeData', (req, res) => {
  fs.readFile(dataFile, 'utf8', (err, data) => {
    if(err) return res.status(500).json({ error: 'Ошибка чтения данных' });
    res.json(JSON.parse(data));
  });
});

app.post('/api/treeData', (req, res) => {
  const treeData = req.body;
  fs.writeFile(dataFile, JSON.stringify(treeData, null, 2), 'utf8', (err) => {
    if(err) return res.status(500).json({ error: 'Ошибка сохранения данных' });
    res.json({ success: true });
  });
});

app.post('/api/verifyPassword', (req, res) => {
  const { password } = req.body;
  if(password === editorPassword){
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

function readArticles(callback) {
  fs.readFile(articlesFile, 'utf8', (err, data) => {
    if(err) return callback(err);
    let articles = [];
    try {
      articles = JSON.parse(data);
    } catch(e) {
      return callback(e);
    }
    callback(null, articles);
  });
}

function writeArticles(articles, callback) {
  fs.writeFile(articlesFile, JSON.stringify(articles, null, 2), 'utf8', callback);
}

app.get('/api/articles', (req, res) => {
  readArticles((err, articles) => {
    if(err) return res.status(500).json({ error: 'Ошибка чтения статей' });
    if(req.query.id){
      const id = parseInt(req.query.id);
      const article = articles.find(a => a.id === id);
      return res.json(article || {});
    }
    res.json(articles);
  });
});

app.post('/api/articles', (req, res) => {
  readArticles((err, articles) => {
    if(err) return res.status(500).json({ error: 'Ошибка чтения статей' });
    const article = req.body;
    const newId = articles.length ? Math.max(...articles.map(a => a.id)) + 1 : 1;
    article.id = newId;
    articles.push(article);
    writeArticles(articles, (err) => {
      if(err) return res.status(500).json({ error: 'Ошибка сохранения статьи' });
      res.json({ success: true, id: newId });
    });
  });
});

app.put('/api/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  readArticles((err, articles) => {
    if(err) return res.status(500).json({ error: 'Ошибка чтения статей' });
    const index = articles.findIndex(a => a.id === id);
    if(index === -1) return res.status(404).json({ error: 'Статья не найдена' });
    articles[index] = req.body;
    articles[index].id = id;
    writeArticles(articles, (err) => {
      if(err) return res.status(500).json({ error: 'Ошибка сохранения статьи' });
      res.json({ success: true });
    });
  });
});

app.delete('/api/articles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  readArticles((err, articles) => {
    if(err) return res.status(500).json({ error: 'Ошибка чтения статей' });
    const newArticles = articles.filter(a => a.id !== id);
    writeArticles(newArticles, (err) => {
      if(err) return res.status(500).json({ error: 'Ошибка удаления статьи' });
      res.json({ success: true });
    });
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
