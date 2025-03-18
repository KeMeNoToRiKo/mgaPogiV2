console.log("MGAPOGIv2")

// GET SUBMISSSIONS


async function getSubmission()
{
    let correctAnswers = [];
    let questionSet = new Set(); // Store question_ids for quick lookup to avoid dupes

    let submissionHistory = await fetchData();
    submissionHistory = submissionHistory.submission_history;

    submissionHistory.forEach((submission) => {
      submission.submission_data.forEach((entry) => {
        if (entry.correct && !questionSet.has(entry.question_id)) {
          questionSet.add(entry.question_id);
          correctAnswers.push({
            question_id: entry.question_id,
            correctanswer_id: entry.answer_id,
          });
        }
      });
    });
    console.log(correctAnswers)
    
    
    return correctAnswers;
};






















let courseId = /\d+/.exec(window.location.href).toString();

  let questionsRaw = document.querySelectorAll(".question_text");
  let questionsTable = [];
  questionsRaw.forEach((q) => {
    questionsTable.push({
      question_id: /[0-9]+/.exec(q.id).toString(), 
        course_id: courseId,
        question_text: q.innerText.trim()
    });
  });

  let answersRaw = document.querySelectorAll(".answer_label");
  let answersTable = [];
  answersRaw.forEach((ans) => {
    answersTable.push({
      answer_id: /\d+(?=_label)/.exec(ans.id).toString(),
      question_id: /\d+/.exec(ans.id).toString(),
      course_id: courseId,
      answer_text: ans.innerText.trim(),
    });
  });

// Format questions and answers into string representations
const formattedQuestions = questionsTable.map(q => `**Question ID:** ${q.question_id}\n**Text:** ${q.question_text}`).join("\n\n");
const formattedAnswers = answersTable.map(a => `**Answer ID:** ${a.answer_id}\n**Question ID:** ${a.question_id}\n**Text:** ${a.answer_text}`).join("\n\n");


// Format correct answers for webhook
const formattedCorrectAnswers = correctAnswers.map(a => `**Question ID:** ${a.question_id}\n**Correct Answer ID:** ${a.correctanswer_id}`).join("\n\n");


// Assuming you have a JSON object from your extension or API
const jsonPayload = {
    "content": "Testing",       // Plain message sent to Discord
    "embeds": [{              // Embeds to send JSON data
      "title": "Example JSON Data",
      "description": "This is the JSON data sent from the extension",
      "fields": [
        {
          "name": "Course ID",
          "value": courseId,
          "inline": true
        },
        {
          "name": "Questions",
          "value": formattedQuestions,
          "inline": true
        },
        {
          "name": "Answers",
          "value": formattedAnswers,
          "inline": true
        },
        {
          "name": "Correct Answers",
          "value": formattedCorrectAnswers,
          "inline": true
        }
      ]
    }]
  };
const webhookUrl = "https://discord.com/api/webhooks/1351423855138181180/qhx_BwtPN2zYXt-B9bshDgLxQnysEqwg7j_r1Qu5bSxeAegD72jzm40OwXf_qZ8KcyZL";

  // Send the payload to the Discord Webhook
  sendToWebhook(jsonPayload, webhookUrl);

// Function to send message to Discord webhook
function sendToWebhook(jsonData, url) {
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jsonData)
  })
    .then(response => response.json())
    .then(data => {
      console.log('Message sent to Discord:', data);
    })
    .catch(error => {
      console.error('Error sending message to Discord:', error);
    });
}