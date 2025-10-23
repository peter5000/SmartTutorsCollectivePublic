# Smart Tutors Collective

Smart Tutors Collective is a web app powered by AI agents, offering personalized and interactive learning experiences. Users can explore subjects and learning paths, take quizzes to assess their strengths and weaknesses, and receive tailored recommendations for books and learning paths. It's a comprehensive solution for engaging and adaptive education.

## Installation

To get this project up and running, follow these steps:

1. **Clone the repository**

   ```bash
   git clone https://github.com/SeattleDataAI-Hackathon/SDAIC-Hackathon-Team-08
   cd SDAIC-Hackathon-Team-08
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

Create a `.env` file in the backend folder and add your API keys for Tavily and OpenAI:

```
TAVILY_API_KEY=your-tavily-api-key
OPENAI_API_KEY=your-tavily-api-key
```

## Running the Application

To start the application in development mode, on your terminal, type:

```bash
cd ..
npm run dev
```

Then, leave the first terminal open, and open up another terminal for the backend server. Then type:

```bash
cd backend
node server.js
```

If the frontend is failing to run, on the first terminal, check your current directory by:

```bash
pwd
// Expected Output: <YourFilePath>/SDAIC-Hackathon-Team-08
```

If the backend is failing to run, on the second terminal, check your current directory by:

```bash
pwd
// Expected Output: <YourFilePath>/SDAIC-Hackathon-Team-08/backend
```

## Using the Demo

- Open up your browser and type `http://localhost:5173/` on the address bar
- Freely interact with our AI agents using the web app!

## Features

Smart Tutors Collective simplifies interactions with AI agents by integrating them into intuitive web components. The AI agents analyze user input to deliver a range of personalized and interactive features, including:

- **Subject Exploration**: AI-guided research offering curated insights on chosen topics.
- **Adaptive Quiz Creation**: Quizzes are dynamically tailored to the user's grade, age, and proficiency level.
- **Knowledge Analysis**: Personalized evaluations highlighting strengths and areas for improvement.
- **Resource Recommendations**: Tailored suggestions for books and learning paths to deepen learning.
- **Focused Practice Paths**: Sub-topic suggestions with specialized quizzes to target specific learning areas.

This streamlined approach empowers users to engage with AI-driven, adaptive learning in a meaningful and efficient manner.

## Building for Production

To build the production application:

```bash
npm run build
```

This command generates a production-optimized build in the `dist/` directory.

## Feedback and Support

If you encounter any issues or have suggestions for improvements, please open an issue in this repository.
