# Smart Tutors Collective

Smart Tutors Collective is a web application that leverages AI agents to provide interactive, personalized learning experiences. By interacting with web components, users can engage with AI-agents to explore subjects, take evaluative quizzes, recognize strengths and weaknesses, and receive tailored book and learning path recommendations.

## Installation

To get this project up and running, follow these steps:

1. **Clone the repository**

   ```bash
   git clone https://github.com/sreyasukavasi3/SmartTutorsCollective.git
   cd SmartTutorsCollective
   ```

2. **Install dependencies**

   Install frontend dependencies
   ```bash
   npm install
   ```

   Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

## Configuration

Create a `.env` file in the project root and add your API keys for Tavily and OpenAI:

```
VITE_TRAVILY_API_KEY=your-tavily-api-key
VITE_OPENAI_API_KEY=your-openai-api-key
```

Create a `.env` file in the backend folder and add your API keys for Tavily and OpenAI:

```
TAVILY_API_KEY=your-tavily-api-key
OPENAI_API_KEY=your-tavily-api-key
```

## Running the Application

To start the application in development mode, on your terminal type:

```bash
cd ..
npm run dev
```

Then leave the first terminal open, and open up another terminal for backend server. Then type:
```bash
cd backend
node server.js
```

If the frontend is failing to run, on the first terminal check you current directory by:
```bash
pwd
// Expected Output: <YourFilePath>/SmartTutorsCollective
```

If the backend is failing to run, on the second terminal check you current directory by:
```bash
pwd
// Expected Output: <YourFilePath>/SmartTutorsCollective/backend
```

## Using the Demo

- Open up your browser and type `http://localhost:5173/` on the address bar
- Freely interact with our AI agents using the web app!

## Features

This web app enables users to abstract out interaction with AI agents into web components. The AI agents analyze user input and generate various interactive features, including:

- **Subject Research** – AI-assisted exploration of topics with curated insights.
- **Quiz Generation** – Dynamic quizzes tailored to the user's grade, age, and claimed proficiency level on the chosen subject.
- **Strength & Weakness Evaluation** – Personalized analysis of user knowledge to highlight areas for improvement.
- **Book & Learning Path Suggestions** – AI-recommended resources and study plans to enhance learning.
- **Focused Practices** - Learning paths comes with sub-topic suggestions that users can work on. Then quizzes will generated specialized on those topics

## Building for Production

To build the application for production:

```bash
npm run build
```

This command generates a production-optimized build in the `dist/` directory.

## Feedback and Support

If you encounter any issues or have suggestions for improvements, please open an issue in this repository.