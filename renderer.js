const $ = require('jquery');
const ipc = require('electron').ipcRenderer;

let questions = null;
let current = -1;

Date.prototype.format = function(msFlag) {
  if (msFlag) {
    let yyyy = this.getFullYear();
    let m = this.getMonth();
    let d = this.getDate();
    let hh = ('0' + this.getHours()).slice(-2);
    let mm = ('0' + this.getMinutes()).slice(-2);
    let ss = ('0' + this.getSeconds()).slice(-2);
    let ms = ('00' + this.getMilliseconds()).slice(-3)
    return yyyy + "/" + m + "/" + d + ' ' + hh + ":" + mm + ":" + ss + '.' + ms;
  } else {
    let ymd = this.getFullYear() + ('0' + this.getMonth()).slice(-2) + ('0' + this.getDate()).slice(-2)
    let hms = ('0' + this.getHours()).slice(-2) + ('0' + this.getMinutes()).slice(-2) + ('0' + this.getSeconds()).slice(-2)
    return ymd + hms;
  }
}

$("#select-button").click(function (event) {
  console.log("#select-button click");
  if (current != -1) return;
  ipc.send('open-dialogue', null);
});

ipc.on('return-path', function (event, args) {
  console.log("ipc on return-path", args);
  $("#path-text").text(args);
});

ipc.on('return-questions', (event, args) => {
  console.log("ipc on return-questions", args);
  questions = args;

  $("#path-text").css("display", "none");
  $("#out-text").css("display", "none");

  $("#question-text").text("START を押して開始");
});


function setQuestion(current) {
  let now = new Date();
  $("#answer-input").val("");
  $("#question-text").text('Q: ' + questions[current]['Q']);
  $("#hint-text").text(questions[current]['HINT']);
  questions[current]['start'] = now.format(true);
  return now;
}



$("#start-button").click( function (event) {
  console.log("#start-button click")

  if (questions == null) {
    alert("Please select an excel file.");
    return;
  }

  $("#select-button").css("display", "none");
  $("#start-button").css("display", "none");

  current = 0;
  let now = setQuestion(current);

  let inputPath = $("#path-text").text();
  let outputPath = inputPath + '.' + now.format(false) + '.csv';
  $("#out-text").text(outputPath);
  ipc.send('send-data', {'path': outputPath, 'data': ['ID', 'start', 'first-focusin', 'hint', 'end', 'answer']});
})

$("#answer-button").click(function (event) {
  console.log("#answer-button click");

  if (current >= 0 && current < questions.length) {
    $("#hint-card").css("display", "none");

    let now = new Date();
    questions[current]['end'] = now.format(true);
    questions[current]['answer'] = $("#answer-input").val();

    let outputPath = $("#out-text").text();
    let data = ['ID', 'start', 'first-focusin', 'hint', 'end', 'answer'].map((k) => {return questions[current][k]})
    ipc.send('send-data', {'path': outputPath, 'data': data});

    current = current + 1;
    if (current >= questions.length) {
      // End
      $("#answer-input").val("");
      $("#question-text").text("終わり");
      $("#select-button").css("display", "block");
      $("#start-button").css("display", "block");
      $("#path-text").css("display", "block");
      $("#out-text").css("display", "block");

      questions = null;
      current = -1;
    } else {
      // Next
      setQuestion(current);
    }
  } else {
    alert("Not yet started");
  }
});

$("#hint-button").click(function (event) {
  console.log("#hint-button click");
  if (current >= 0 && current < questions.length) {
    if ($("#hint-card").css("display") == "none") {
      $("#hint-card").css("display", "block");
      questions[current]['hint'] = new Date().format(true);
    }
  } else {
    alert("Not yet started");
  }
});

$("#answer-input").focusin(function(){
  console.log("#answer-input focusin");
  if (current >= 0 && current < questions.length) {
    if (typeof(questions[current]['first-focusin']) == "undefined") {
      questions[current]['first-focusin'] = new Date().format(true);
    }
  }
});

$("#answer-input").focusout(function(){
  console.log("#answer-input focusout");
});

$('#answer-input').change(function() {
  console.log("#answer-input change: " + $(this).val());
});
