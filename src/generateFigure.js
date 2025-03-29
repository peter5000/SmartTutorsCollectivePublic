import { Agent, Task, Team } from 'kaibanjs';
import { DallEAPIWrapper } from "@langchain/openai";
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';


// Define the image generation tool used by the ImageGenerator Agent
const generateImageTool = new DallEAPIWrapper({
  n: 1,
  model: "dall-e-3",
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

// Define the search tool used by the Research Agent
const searchTool = new TavilySearchResults({
  maxResults: 5,
  apiKey: import.meta.env.VITE_TRAVILY_API_KEY
});

// Define the Research Agent
const researchAgent = new Agent({
  name: 'Ava',
  role: 'Online Subject Researcher',
  goal: 'Find 1 online question on a given topic',
  background: 'Experienced in data analysis and information gathering',
  tools: [searchTool]
});

// Define the ImageGenerator Agent (Dall-E)
const imageGeneratorAgent = new Agent({
  name: 'Dall-E',
  role: 'Image Creator',
  goal: 'Generate an image representing a given multiple choice question',
  background: 'Experienced in image prompting and image generation',
  tools: [generateImageTool]
});

// Define Tasks
const researchTask = new Task({
  title: 'Subject research',
  description: 'Find 1 online multiple choice question on the given topic: {topic}',
  expectedOutput: 'A list of questions that exist',
  agent: researchAgent
});

const imageGenerationTask = new Task({
  title: 'Image generation',
  description: 'Given a question, generate a image that explains the answer using Dall-E API',
  expectedOutput: 'An image generated using Dall-E API',
  agent: imageGeneratorAgent,
  isDeliverable: true
});

// Create the Team
const imageTeam = new Team({
  name: 'Question figure generation team',
  agents: [imageGeneratorAgent],
  tasks: [imageGenerationTask],
  env: { OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY }
});

export { imageTeam };