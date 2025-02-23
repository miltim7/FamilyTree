const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const dataFile = path.join(__dirname, 'treeData.json');
const editorPassword = 'admin123';
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/treeData', (req, res) => {
  fs.readFile(dataFile, 'utf8', (err, data) => {
    if(err) return res.status(500).send({error: 'Ошибка чтения данных'});
    res.send(JSON.parse(data));
  });
});
app.post('/api/treeData', (req, res) => {
  const treeData = req.body;
  fs.writeFile(dataFile, JSON.stringify(treeData, null, 2), 'utf8', (err) => {
    if(err) return res.status(500).send({error: 'Ошибка сохранения данных'});
    res.send({success: true});
  });
});
app.post('/api/verifyPassword', (req, res) => {
  const { password } = req.body;
  if(password === editorPassword){
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
