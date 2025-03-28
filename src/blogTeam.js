import { Agent, Task, Team } from 'kaibanjs';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';

// Define the search tool used by the Research Agent
const searchTool = new TavilySearchResults({
  maxResults: 5,
  apiKey: import.meta.env.VITE_TRAVILY_API_KEY
});

// Define the Research Agent
const researchAgent = new Agent({
    name: 'Ava',
    role: 'Online Subject Researcher',
    goal: 'Find online questions on a given topic',
    background: 'Experienced in data analysis and information gathering',
    tools: [searchTool]
  });
  
  // Define the Writer Agent
  const writerAgent = new Agent({
    name: 'Kai',
    role: 'Quiz Creator',
    goal: 'Create multiple choice exams based on provided information',
    background: 'Skilled in exam creation',
    tools: []
  });

  // Define Tasks
const researchTask = new Task({
    title: 'Subject research',
    description: 'Find online questions on the given topic: {topic}',
    expectedOutput: 'A list of questions that exist',
    agent: researchAgent
  });
  
  const writingTask = new Task({
    title: 'Quiz creation',
    description: 'Create a multiple choice quiz about {topic} based on the provided research',
    expectedOutput: `Create a 10 question multiple choice quiz, with correct answers in json format. The json format should be: 
    {\"quiz\": 
      \"questions\": [
        {
          \"question\": \"QUESTION 1 HERE\",
          \"options\": [\"OPTION 1 FOR QUESTION 1 HERE\", \"OPTION 2 FOR QUESTION 1 HERE\"...]
          \"correctAnswer\": SOME INTEGER REPRESENTING CORRECT ANSWER FROM 0-3
        }
      ]
    }`,
    agent: writerAgent
  });

  // Create the Team
const blogTeam = new Team({
    name: 'AI News Blogging Team',
    agents: [researchAgent, writerAgent],
    tasks: [researchTask, writingTask],
    env: { OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY }
  });
  
  export { blogTeam };