const ipc = require('electron').ipcRenderer;
const btnSel = document.getElementById('select-button');
const textP = document.getElementById('path-text');
const btnSta = document.getElementById('start-button');
const outP = document.getElementById('out-text');
const textQ = document.getElementById('question-text');
const inputA = document.getElementById('answer-input');
const btnAns = document.getElementById('answer-button');
const btnHnt = document.getElementById('hint-button');
const hntCard = document.getElementById('hint-card');
const textHnt = document.getElementById('hint-text');

btnSta.disabled = "disabled";
btnAns.disabled = "disabled";
btnHnt.disabled = "disabled";

let questions = null;
let current = -1;

Date.prototype.format = function(msFlag) {
  let ymd = this.getFullYear() + ('0' + this.getMonth()).slice(-2) + ('0' + this.getDate()).slice(-2)
  let hms = ('0' + this.getHours()).slice(-2) + ('0' + this.getMinutes()).slice(-2) + ('0' + this.getSeconds()).slice(-2)
  if (msFlag) {
    let ms = ('00' + this.getMilliseconds()).slice(-3)
    return ymd + '-' + hms + '.' + ms;
  } else {
    return ymd + hms;
  }
}


btnSel.addEventListener('click', function (event) {
  ipc.send('open-dialogue', null);
});

ipc.on('return-path', (event, args) => {
  textP.innerHTML = args;
});

ipc.on('return-questions', (event, args) => {
  questions = args;
  btnSta.disabled = "";
});

btnSta.addEventListener('click', function (event) {
  btnSel.style.display = 'none';
  btnSta.style.display = 'none';
  btnSta.disabled = "disabled";
  let now = new Date();
  let inputPath = textP.innerHTML;
  let outputPath = inputPath + '.' + now.format(false) + '.csv';
  outP.innerHTML = outputPath;
  ipc.send('send-data', {'path': outputPath, 'data': ['ID', 'start', 'end', 'answer']});

  current = 0;
  textQ.innerHTML = 'Q: ' + questions[current]['Q'];
  textHnt.innerHTML = questions[current]['HINT'];
  questions[current]['start'] = now.format(true);

  btnAns.disabled = "";
  btnHnt.disabled = "";
})

btnAns.addEventListener('click', function (event) {
  if (this.disabled == "disabled") return;

  hntCard.style.display = "none";

  let now = new Date();
  questions[current]['end'] = now.format(true);
  questions[current]['answer'] = inputA.value;

  let outputPath = outP.innerHTML;
  let data = ['ID', 'start', 'end', 'answer'].map((k) => {return questions[current][k]})
  ipc.send('send-data', {'path': outputPath, 'data': data});

  current = current + 1;
  if (current >= questions.length) {
    textQ.innerHTML = '終わり';
    btnAns.disabled = "disabled";
    btnHnt.disabled = "disabled";
    btnSel.style.display = 'block';
    btnSta.style.display = 'block';
    textP.style.display = 'block';
    outP.style.display = 'block';
  } else {
    inputA.value = '';
    textQ.innerHTML = 'Q: ' + questions[current]['Q'];
    textHnt.innerHTML = questions[current]['HINT'];
    questions[current]['start'] = new Date().format(true);
  }
})

btnHnt.addEventListener('click', function (event) {
  if (this.disabled == "disabled") return;
  hntCard.style.display = "block";
});
