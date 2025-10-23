const functions = require('firebase-functions');
const { z } = require('zod');
const { Agent, Task, Team } = require('kaibanjs');
const { TavilySearchResults } = require('@langchain/community/tools/tavily_search');

// QUIZ GENERATION BASED ON SUBJECT, AGE, GRADE, and SELF DECLARED LEVEL
function createBookSuggestionTeam(subject, age, grade, level, strength=undefined, weakness=undefined) {

  // Agent Creation
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!tavilyApiKey || !openaiApiKey) {
      throw new Error("Missing API keys in Firebase Functions configuration.");
  }

  const searchTool = new TavilySearchResults({ maxResults: 5, apiKey: tavilyApiKey });

  const bookAgent = new Agent({
      name: `${subject} Book Expert`,
      role: `${subject} Book Expert with Internet Access`,
      goal: `Find books online of ${subject} and summarize them.`,
      background: `Experienced in information gathering, communication, summarization, and providing topics on the subject when needed.`,
      tools: [searchTool]
  });

  subject = subject.toLowerCase();
  let content = `Find and summarize 5 books related to ${subject} for a user of age ${age}, grade ${grade}, and self evaluated level of ${level}. `;
  if (strength && weakness) {
    content += `The user has strengths in ${strength} and weaknesses in ${weakness}. `;
  }
  content += "The books should be related to the subject and the user should be able to understand them. The books will be used as a reference for the user to study and learn more about the subject."

  const writingTask = new Task({
    title: 'Book Suggestion',
    description: content,
    expectedOutput: `Create a list of books related to ${subject}. in json format. The json format should be:
    {\"books\": [
      {
        \"title\": \"BOOK TITLE HERE\",
        \"author\": \"AUTHOR HERE\",
        \"summary\": \"SUMMARY HERE\"
      }
    ]}`,
    agent: bookAgent,
    outputSchema: z.object({
      books: z.array(z.object({
        title: z.string(),
        author: z.string(),
        summary: z.string()
      }))
    })
  });
  return new Team({
    name: 'Book Suggestion Team',
    agents: [bookAgent],
    tasks: [writingTask],
    env: { OPENAI_API_KEY: openaiApiKey }
  });
}

// QUIZ EVALUATION BASED ON SUBJECT, AGE, GRADE, and SELF DECLARED LEVEL
function createTopicSuggestionTeam(subject, age, grade, level, learningPath=null, summary=null, strength=null, weakness=null) {

  // Agent Creation
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
      throw new Error("Missing OpenAI API key in Firebase Functions configuration.");
  }


  const topicAgent = new Agent({
    name: `${subject} Expert`,
    role: `${subject} Expert with Internet Access`,
    goal: `Find key topics of ${subject} based on given learning path.`,
    background: `Experienced in information gathering, communication, summarization, and providing topics on the subject when needed.`,
    tools: []
  })

  subject = subject.toLowerCase();
  let content = `Choose 5 topics related to ${subject} for a user of age ${age}, grade ${grade}, and self evaluated level of ${level}. `;
  if (strength && weakness) {
    content += `The user has strengths in ${strength} and weaknesses in ${weakness}. `;
  }
  content += `This is a learning path chosen by the user ${learningPath} and the summary is of learning path is here ${summary}. The topics should be related to the subject and should be appropriate for the grade. The topics should also be within the learning path and should agree with the summary. The topics will be used as a reference for the user to study and learn more about the subject. If the strengths and weaknesses are provided, the topics should be related to the strengths and weaknesses.`

  const writingTask = new Task({
    title: 'Topic Suggestion',
    description: content,
    expectedOutput: `Create a list of topics related to ${subject} in json format. The json format should be:
    {\"topics\": [
      {
        \"topic\": \"TOPIC HERE\"
      }
    ]}`,
    agent: topicAgent,
    outputSchema: z.object({
      topics: z.array(z.object({
        topic: z.string()
      }))
    })
  });
  return new Team({
    name: 'Topic Suggestion Team',
    agents: [topicAgent],
    tasks: [writingTask],
    env: { OPENAI_API_KEY: openaiApiKey }
  });
}

function createBookInquiryTeam(subject, age, grade, level, book, authors, question) {


  // Agent Creation
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
      throw new Error("Missing OpenAI API key in Firebase Functions configuration.");
  }


  const bookInquiryAgent = new Agent({
    name: `${subject} Expert`,
    role: `${subject} Expert with Internet Access`,
    goal: `Given a book on ${subject}, answer any questions about the topic. Some questions are out of scope to answer. In that case, feel free to tell the user that.`,
    background: `Experienced in information gathering, communication, summarization, and providing topics on the subject when needed.`,
    tools: []
  })

  subject = subject.toLowerCase();
  let content = `Answer the following query about the book ${book} written by ${authors}. For context, the user is of age ${age}, grade ${grade}, and self evaluated level of ${level}. This is their question: ${question}`;
  const writingTask = new Task({
    title: 'Book Inquiry',
    description: content,
    expectedOutput: "plain text",
    agent: bookInquiryAgent,
    outputSchema: z.string()
  })
  return new Team({
    name: 'Book Inquiry Team',
    agents: [bookInquiryAgent],
    tasks: [writingTask],
    env: { OPENAI_API_KEY: openaiApiKey }
  });
}


// QUIZ GENERATION BASED ON SUBJECT, AGE, GRADE, and SELF DECLARED LEVEL
function createLearningPathSuggestionTeam(subject, age, grade, level, strength=undefined, weakness=undefined) {

  // Agent Creation
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey) {
      throw new Error("Missing OpenAI API key in Firebase Functions configuration.");
  }

  const learningPathAgent = new Agent({
    name: `${subject} Expert`,
    role: `${subject} Expert with Internet Access`,
    goal: `Create learning paths related to ${subject}.`,
    background: `Experienced in information gathering, communication, summarization, and providing topics on the subject when needed.`,
    tools: []
  })

  subject = subject.toLowerCase();
  let content = `Find and summarize 5 learning paths related to ${subject} for a user of age ${age}, grade ${grade}, and self evaluated level of ${level}.`;
  if (strength && weakness) {
    content += `The user has strengths in ${strength} and weaknesses in ${weakness}. `;
  }
  content += "For example, learning paths for high school math are like Standard High School Math Path, Advanced Math for STEM, Math for Data Science & Machine Learning, and Competition Math. The learning paths will be later used to generate topics and quizzes related to topics. Summary should include the general description of the learning paths"

  const writingTask = new Task({
    title: 'Book Suggestion',
    description: content,
    expectedOutput: `Create a list of learning paths related to ${subject}. in json format. The json format should be:
    {\"learningPaths\": [
      {
        \"learningPath\": \"LEARNING PATH HERE\",
        \"summary\": \"SUMMARY HERE\"
      }
    ]}`,
    agent: learningPathAgent,
    outputSchema: z.object({
      learningPaths: z.array(z.object({
        learningPath: z.string(),
        summary: z.string()
      }))
    })
  });
  return new Team({
    name: 'Learning Path Suggestion Team',
    agents: [learningPathAgent],
    tasks: [writingTask],
    env: { OPENAI_API_KEY: openaiApiKey }
  });
}

module.exports = { createBookSuggestionTeam, createTopicSuggestionTeam, createBookInquiryTeam, createLearningPathSuggestionTeam }