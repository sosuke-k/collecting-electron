const readXlsxFile = require('read-excel-file/node');
const fs = require("fs");
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog
const ipc = electron.ipcMain

let mainWindow = null;

app.on('window-all-closed', function() {
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
  app.quit();
});

app.on('ready', function() {

  mainWindow = new BrowserWindow({width: 800, height: 600, webPreferences: {nodeIntegration: true}});
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

ipc.on('open-dialogue', function (event, arg) {
  console.log('open-dialogue');

  dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      title: 'Select a excel file',
      filters: [
          {name: 'excel file', extensions: ['xlsx', 'xls']}
      ]
  }).then(result => {
    console.log(result.canceled);
    if (!result.canceled) {
      let excelPath = result.filePaths[0];
      console.log(excelPath);
      event.sender.send('return-path', excelPath);
      readXlsxFile(excelPath).then(rows => {
        // `rows` is an array of rows
        // each row being an array of cells.
        cols = rows.shift();
        console.log(rows);

        let questions = rows.map((row) => {
          let question = {};
          for (let i = 0; i < cols.length; i++) {
            let k = cols[i];
            let v = row[i];
            question[k] = v;
          }
          return question;
        });
        console.log(questions);
        event.sender.send('return-questions', questions);
      })
    }
  }).catch(err => {
    console.log(err);
  })
});

ipc.on('send-data', function (event, arg) {
  let path = arg['path']
  let line = arg['data'].join(',') + '\n';
  fs.appendFile(path, line, (err) => {
    if(err) console.log(err);
    else console.log('write end');
  });
});
