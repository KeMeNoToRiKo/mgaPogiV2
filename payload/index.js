console.log("MGAPOGIv2");

async function fetchData() {
  let parseThis = document.querySelectorAll('script')[1].innerText;
  let courseId = /(?<="COURSE_ID":")\d+/.exec(parseThis)?.[0];
  let assignmentId = /(?<=assignment_id":")\d+/.exec(parseThis)?.[0];
  let userId = /(?<="id":")\d+/.exec(parseThis)?.[0];

  const response = await fetch(`/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}?include[]=submission_history`);
  const data = await response.json();
  console.log(data);
  return data;
}

async function getCorrectAns() {
  let correctAnswer = [];
  let questionSet = new Set();

  let submissionHistory = await fetchData();
  submissionHistory = submissionHistory.submission_history;

  submissionHistory.forEach((submission) => {
    submission.submission_data.forEach((entry) => {
      if (entry.correct && !questionSet.has(entry.question_id)) {
        questionSet.add(entry.question_id);
        correctAnswer.push({
          question_id: entry.question_id,
          answer_id: entry.answer_id,
          correct : true
        });
      } else if (!entry.correct && !questionSet.has(entry.question_id)) {
        questionSet.add(entry.question_id);
        correctAnswer.push({
          question_id: entry.question_id,
          answer_id: entry.answer_id,
          correct : false
        });
      }
    });
  });
  console.log("correctAnswerFunction", correctAnswer);
  return correctAnswer;
}

let courseId = /\d+/.exec(window.location.href)?.[0];

let questionsRaw = document.querySelectorAll(".question_text");
let questionsTable = [];
questionsRaw.forEach((q) => {
  questionsTable.push({
    question_id: /[0-9]+/.exec(q.id)?.[0],
    course_id: courseId,
    question_text: q.innerText.trim()
  });
});

let answersRaw = document.querySelectorAll(".answer_label");
let answersTable = [];
answersRaw.forEach((ans) => {
  answersTable.push({
    answer_id: /\d+(?=_label)/.exec(ans.id)?.[0],
    question_id: /\d+/.exec(ans.id)?.[0],
    course_id: courseId,
    answer_text: ans.innerText.trim(),
  });
});

async function processCorrectAnswer() {
  let correctAnswerRaw = await getCorrectAns(); // ✅ Wait for the data
  let correctAnswerTable = [];

  let correctAnswerQuestionId = answersTable[0]?.question_id;

  console.log("correctAnswerID", correctAnswerQuestionId);

  let isFound = false;
  for (let i = 0; i < correctAnswerRaw.length; i++) {
    if (correctAnswerRaw[i].question_id == correctAnswerQuestionId) {
      isFound = true;
      for (let j = 0; j < answersTable.length; j++) {
        if (answersTable[j].answer_id == correctAnswerRaw[i].answer_id && correctAnswerRaw[i].correct) {
          correctAnswerTable.push({
            answer_id: answersTable[j].answer_id,
            answer_text: "✅ " + answersTable[j].answer_text
          });
        } else if (answersTable[j].answer_id == correctAnswerRaw[i].answer_id && !correctAnswerRaw[i].correct) {
          correctAnswerTable.push({
            answer_id: answersTable[j].answer_id,
            answer_text: "❌ " + answersTable[j].answer_text
          });
        } else {
          correctAnswerTable.push({
            answer_id: answersTable[j].answer_id,
            answer_text: "🚫 " + answersTable[j].answer_text
        })
        }
      }
    } 
  }

  if (!isFound) {
    for (let i = 0; i < answersTable.length; i++) {
      correctAnswerTable.push({
        answer_id: answersTable[i].answer_id,
        answer_text: "🚫 " + answersTable[i].answer_text
    })
  }
  }
  return correctAnswerTable.map(a => `**Answer ID:** ${a.answer_id}\n${a.answer_text}`).join("\n\n");
}

async function sendToDiscord() {
  const formattedCorrectAnswer = await processCorrectAnswer(); // ✅ Wait for processing
  const formattedQuestions = questionsTable.map(q => `**Text:** ${q.question_text}`).join("\n\n");
  const formattedAnswers = answersTable.map(a => `**Answer ID:** ${a.answer_id}\n**Text:** ${a.answer_text}`).join("\n\n");
  

  const jsonPayload = {
    "content": " ",
    "embeds": [{
      "title": courseId,
      "fields": [
        { "name": "Questions", "value": formattedQuestions, "inline": true },
        { "name": "Answers", "value": formattedCorrectAnswer || "No correct answers found.", "inline": true }
      ]
    }]
  };

  const webhookUrl = "https://discord.com/api/webhooks/1351423855138181180/qhx_BwtPN2zYXt-B9bshDgLxQnysEqwg7j_r1Qu5bSxeAegD72jzm40OwXf_qZ8KcyZL";

  sendToWebhook(jsonPayload, webhookUrl);
}

function sendToWebhook(jsonData, url) {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData)
  })
    .then(data => console.log('Message sent to Discord:', data))
    .catch(error => console.error('Error sending message to Discord:', error));
}

sendToDiscord(); // ✅ Corrected function call
