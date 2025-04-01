require('dotenv').config();
const { z } = require('zod');
const { Agent, Task, Team } = require('kaibanjs');
const { TavilySearchResults } = require('@langchain/community/tools/tavily_search');

// Define the search tool used by the Research Agent
const searchTool = new TavilySearchResults({
  maxResults: 5,
  apiKey: process.env.TAVILY_API_KEY
});


const subjects = ["english", "math", "science"]

// English, Math, Science agents
const agentMap = new Map();

for(var i = 0; i < subjects.length; i++) {
  let subject = subjects[i];
  agentMap.set(subject,
    new Agent({
      name: `${subject} Expert`,
      role: `${subject} Expert with Internet Access`,
      goal: `Provide information of ${subject}, conducting research online to supplement missing knowledge.`,
      background: `Experienced in information gathering, communication, evaluating experience levels, and providing topics on the subject when needed.`,
      tools: [searchTool]
    })
  )
}


// QUIZ GENERATION BASED ON SUBJECT, AGE, GRADE, and SELF DECLARED LEVEL
function createQuizGenTeam(subject, age, grade, level) {
  subject = subject.toLowerCase();
  const writingTask = new Task({
    title: 'Quiz creation',
    description: `Create a 5 question multiple choice quiz about ${subject}. The quiz should be oriented towards an audience of age ${age}, grade ${grade}, and self evaluated level of ${level}. The quiz should wield a diverse set of topics to evaluate a quiz taker's strengths and weaknesses.`,
    expectedOutput: `Create a question multiple choice quiz, with correct answers in json format. The json format should be:
    {\"quiz\":
      {\"questions\": [
        {
          \"question\": \"QUESTION 1 HERE\",
          \"options\": [\"OPTION 1 FOR QUESTION 1 HERE\", \"OPTION 2 FOR QUESTION 1 HERE\"...],
          \"correctAnswer\": SOME INTEGER REPRESENTING CORRECT ANSWER FROM 0-3,
          \"topic\": TOPIC
        }
      ]}
    }`,
    agent: agentMap.get(subject),
    outputSchema: z.object({
        quiz: z.object({
            questions: z.array(z.object({
                question: z.string(),
                options: z.array(
                    z.string()
                ),
                correctAnswer: z.number(),
                topic: z.string()
            }))
        })
      })
  });
  return new Team({
    name: 'Quiz Creation Team',
    agents: [agentMap.get(subject)],
    tasks: [writingTask],
    env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY }
  });


}

// QUIZ EVALUATION BASED ON SUBJECT, AGE, GRADE, and SELF DECLARED LEVEL
function createQuizEvalTeam(subject, age, grade, level, quiz) {
quiz = JSON.stringify(quiz);
subject = subject.toLowerCase();
  const writingTask = new Task({
    title: 'Quiz Feedback',
    description: `You'll receive a 10 question multiple choice quiz in json format.
    If a candidate incorrectly answered a question related to a topic, that topic should be added to a list of weaknesses. If a candidate answers all questions associated with a topic correctly, that topic should be added to strengths.
    The topics in the strengths and weaknesses should not overlap.
    The quiz is oriented towards an user of age ${age}, grade ${grade}, and self evaluated level of ${level}. The format is:
    {\"quiz\":
      \"questions\": [
        {
          \"question\": \"QUESTION 1 HERE\",
          \"options\": [\"OPTION 1 FOR QUESTION 1 HERE\", \"OPTION 2 FOR QUESTION 1 HERE\"...],
          \"correctAnswer\": SOME INTEGER REPRESENTING CORRECT ANSWER FROM 0-3,
          \"chosenAnswer\": SOME INTEGER FROM 0-3,
          \"topic\": TOPIC
        }
      ]
    }

    Here is the quiz: ${quiz}`,
    expectedOutput: `An updated version of the quiz json, with explanations for each incorrect answer in json format.
    If a candidate incorrectly answered a question related to a topic, that topic should be added to a list of weaknesses. If a candidate answers all questions associated with a topic correctly, that topic should be added to strengths.
    The topics in the strengths and weaknesses should not overlap.
    The json format should be:
    {\"quiz\":
      \"questions\": [
        {
          \"question\": \"QUESTION 1 HERE\",
          \"options\": [\"OPTION 1 FOR QUESTION 1 HERE\", \"OPTION 2 FOR QUESTION 1 HERE\"...],
          \"correctAnswer\": SOME INTEGER REPRESENTING CORRECT ANSWER FROM 0-3,
          \"chosenAnswer\": SOME INTEGER FROM 0-3,
          \"explanation\": \"Explanation for why chosen answer was wrong or right",
          \"topic\": TOPIC
        }
      ],
      \"topic_strengths\": [list of strengths (topics)],
      \"topic_weaknesses\" [list of weaknesses (topics)]
    }`,
    agent: agentMap.get(subject),
    outputSchema: z.object({
        quiz: z.object({
            questions: z.array(z.object({
                question: z.string(),
                options: z.array(
                    z.string()
                ),
                correctAnswer: z.number(),
                chosenAnswer: z.number(),
                explanation: z.string(),
                topic: z.string(),
            })),
        topic_strengths: z.array(z.string()),
        topic_weaknesses: z.array(z.string())
        })
      })
  });
  return new Team({
    name: 'Quiz Evaluation Team',
    agents: [agentMap.get(subject)],
    tasks: [writingTask],
    env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY }
  });
}

// QUIZ GENERATION BASED ON SUBJECT, AGE, GRADE, SELF DECLARED LEVEL, and TOPIC
function createTopicQuizGenTeam(subject, age, grade, level, topic) {
  subject = subject.toLowerCase();
  const writingTask = new Task({
    title: 'Quiz creation',
    description: `Create a 5 question multiple choice quiz about ${subject} only related to ${topic}. The quiz should be oriented towards an audience of age ${age}, grade ${grade}, and self evaluated level of ${level}. The quiz should focus on ${topic} to enhance the quiz taker's knowledge in that area.`,
    expectedOutput: `Create a question multiple choice quiz, with correct answers in json format. The json format should be:
    {\"quiz\":
      {\"questions\": [
        {
          \"question\": \"QUESTION 1 HERE\",
          \"options\": [\"OPTION 1 FOR QUESTION 1 HERE\", \"OPTION 2 FOR QUESTION 1 HERE\"...],
          \"correctAnswer\": SOME INTEGER REPRESENTING CORRECT ANSWER FROM 0-3
        }
      ]}
    }`,
    agent: agentMap.get(subject),
    outputSchema: z.object({
        quiz: z.object({
            questions: z.array(z.object({
                question: z.string(),
                options: z.array(
                    z.string()
                ),
                correctAnswer: z.number()
            }))
        })
      })
  });
  return new Team({
    name: 'Quiz with Topic Creation Team',
    agents: [agentMap.get(subject)],
    tasks: [writingTask],
    env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY }
  });


}

// QUIZ EVALUATION BASED ON SUBJECT, AGE, GRADE, SELF DECLARED LEVEL, and TOPIC
function createTopicQuizEvalTeam(subject, age, grade, level, quiz) {
quiz = JSON.stringify(quiz);
subject = subject.toLowerCase();
  const writingTask = new Task({
    title: 'Quiz Feedback',
    description: `You'll receive a 5 question multiple choice quiz in json format.
    The quiz is oriented towards an user of age ${age}, grade ${grade}, and self evaluated level of ${level}. The quiz is specialized in ${topic}. The format is:
    {\"quiz\":
      \"questions\": [
        {
          \"question\": \"QUESTION 1 HERE\",
          \"options\": [\"OPTION 1 FOR QUESTION 1 HERE\", \"OPTION 2 FOR QUESTION 1 HERE\"...],
          \"correctAnswer\": SOME INTEGER REPRESENTING CORRECT ANSWER FROM 0-3,
          \"chosenAnswer\": SOME INTEGER FROM 0-3
        }
      ]
    }

    Here is the quiz: ${quiz}`,
    expectedOutput: `An updated version of the quiz json, with explanations for each incorrect answer in json format.
    If a candidate incorrectly answered a question related to a topic, that topic should be added to a list of weaknesses. If a candidate answers all questions associated with a topic correctly, that topic should be added to strengths.
    The topics in the strengths and weaknesses should not overlap.
    The json format should be:
    {\"quiz\":
      \"questions\": [
        {
          \"question\": \"QUESTION 1 HERE\",
          \"options\": [\"OPTION 1 FOR QUESTION 1 HERE\", \"OPTION 2 FOR QUESTION 1 HERE\"...],
          \"correctAnswer\": SOME INTEGER REPRESENTING CORRECT ANSWER FROM 0-3,
          \"chosenAnswer\": SOME INTEGER FROM 0-3,
          \"explanation\": \"Detailed explanation for why chosen answer was wrong or right"
        }
      ]
    }`,
    agent: agentMap.get(subject),
    outputSchema: z.object({
        quiz: z.object({
            questions: z.array(z.object({
                question: z.string(),
                options: z.array(
                    z.string()
                ),
                correctAnswer: z.number(),
                chosenAnswer: z.number(),
                explanation: z.string()
            }))
        })
      })
  });
  return new Team({
    name: 'Quiz with Topic Evaluation Team',
    agents: [agentMap.get(subject)],
    tasks: [writingTask],
    env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY }
  });
}

module.exports = { createQuizGenTeam, createQuizEvalTeam, createTopicQuizGenTeam, createTopicQuizEvalTeam };