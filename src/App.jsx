import React, { useState } from 'react';
import './App.css';
import DevUtils from './DevUtils';
import { blogTeam } from './blogTeam';
import { imageTeam } from './generateFigure';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

import AgeSelector from './features/selection/AgeSelector';
import GradeSelector from './features/selection/GradeSelector';
import SubjectSelector from './features/selection/SubjectSelector';
import LevelSelector from './features/selection/LevelSelector';
import Chat from './features/chat/Chat';
import Quiz from './features/quiz/Quiz';
// import ChatIconComponent from './features/chat/ChatIcon';

function App() {

// AGENT CODE --------------------------------------------------------------------------------------------
 // Setting up State
  const [topic, setTopic] = useState('');
  const [blogPost, setBlogPost] = useState('');
  const [stats, setStats] = useState(null);
  const [question, setQuestion] = useState('');
  const [quiz, setQuiz] = useState(null);

  // Connecting to the KaibanJS Store
  const useTeamStore = blogTeam.useStore();

  const {
    agents,
    tasks,
    teamWorkflowStatus
  } = useTeamStore(state => ({
    agents: state.agents,
    tasks: state.tasks,
    teamWorkflowStatus: state.teamWorkflowStatus
  }));

  const [studentId, setStudentId] = useState('10');
  const [email, setEmail] = useState('1');
  const [age, setAge] = useState('1');
  const [grade, setGrade] = useState('1');

  const generateBlogPost = async () => {
    setBlogPost('');
    setStats(null);

    try {
      const studentData = { studentId, email, age, grade };
      const response = await axios.post('http://localhost:5000/save-student', studentData);
      console.log(response.data.message);  // Success message

      const output = await blogTeam.start("8th grade geometry math");
      if (output.status === 'FINISHED') {
        setBlogPost(output.result);
        console.log(output.result);
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: output.result }]);
        const { costDetails, llmUsageStats, duration } = output.stats;
        setStats({
          duration: duration,
          totalTokenCount: llmUsageStats.inputTokens + llmUsageStats.outputTokens,
          totalCost: costDetails.totalCost
        });
        setQuestion(JSON.parse(output.result)["quiz"]["questions"][0][question]);
        document.getElementById('question').hidden = false;
      } else if (output.status === 'BLOCKED') {
        console.log(`Workflow is blocked, unable to complete`);
      }
    } catch (error) {
      console.error('Error generating blog post:', error);
    }
  };

  const generateImage = async () => {
    try {
      console.log("inside generate image: ", question)
      const output = await imageTeam.start({ "question" : question });
      if (output.status === 'FINISHED') {
        console.log(output.result);
      } else if (output.status === 'BLOCKED') {
        console.log(`Workflow is blocked, unable to complete`);
      }
    } catch (error) {
      console.error('Error generating blog post:', error);
    }
  };

  // FRONTEND CODE --------------------------------------------------------------------------------------------
  const [searchInput, setSearchInput] = useState('');
  const [messages, setMessages] = useState([{ sender: 'Agent', text: 'Welcome! Please enter your email.' }]);
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [stepInput, setStepInput] = useState('');
  const [showChat, setShowChat] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setMessages((prevMessages) => [...prevMessages, { sender: 'Student', text: searchInput }]);
      setSearchInput('');
    }
  };

  const handleSelect = (key, value) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
    setMessages((prevMessages) => [...prevMessages, { sender: 'Student', text: `${key}: ${value}` }]);
    setStep((prevStep) => prevStep + 1);
    setStepInput('');

    // Add agent's prompt for the next step
    switch (step + 1) {
      case 1:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Please select your age.' }]);
               break;
      case 2:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Please select your grade.' }]);
        break;
      case 3:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Please select the subject you are interested in.' }]);
        break;
      case 4:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Please select your level.' }]);
        break;
      case 5:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Thank you! Your selections have been recorded.' }]);
        passSelectionsToFunction(); // call the agent with student info - age, grade, subject and level
        const quizObj = generateBlogPost();
        setQuiz(quizObj.quiz);
        // Function 1 -- first time experience 
        // call the agent method with question, expected ans and received ans - receive categorized student level and score
        // Display the categorized student level, strengts and weakness,  dispaly sorted topics and resources to learn (books names, online mater links etc)
        // + Display how the student wants to learn(WIP:pictures, text, audio) 

        // Function 2 - returned user -- repeated every time
        // Call the agent with student details, categarized level and preferred learning method
        // Gives - Quiz on the specific topic, level and subject

        //Function 3 - Post submission of quiz
        // Send back quiz response and ask for new categorized level and score and display remaining/new topics
        break;
      default:
        break;
    }
  };

  const handleKeyPress = (e, key) => {
    if (e.key === 'Enter') {
      handleSelect(key, e.target.value);
    }
  };

  // TODO: Should be updated and call Agent to generate the quiz
  const passSelectionsToFunction = () => {
    console.log('Passing selections to another function:', selections.email);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="input-container">
            <label>Email: </label>
            <input
              type="text"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'email')}
              placeholder="Enter your email..."
            />
          </div>
        );
        case 1:
        return (
          <div className="input-container">
            <label>Age: </label>
            <input
              type="number"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'age')}
              placeholder="Enter your age..."
            />
          </div>
        );
      case 2:
        return (
          <div className="input-container">
            <label>Grade: </label>
            <input
              type="text"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'grade')}
              placeholder="Enter your grade..."
            />
          </div>
        );
      case 3:
        return <SubjectSelector onSelect={handleSelect} />;
      case 4:
        return <LevelSelector onSelect={handleSelect} />;
      case 5:
        // return
        return (
          <div id="question" hidden={true}>
            <button onClick={generateImage}>Generate Image</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <Chat messages={messages} />
        {renderStep()}
      </div>
      {showChat && (
        <form onSubmit={handleSubmit} className="chat-form">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Type your query here..."
          />
          <button type="submit">Send</button>
        </form>
      )}
      {/* <ChatIconComponent onClick={() => setShowChat(!showChat)} /> */}
    </div>
  );

  // return (
  //   <div className="container">
  //     <h1 className="header">AI Agents News Blogging Team</h1>
  //     <div className="grid">
  //       <div className="column">
  //         <div className="options">
  //           <input
  //             type="text"
  //             value={topic}
  //             onChange={(e) => setTopic(e.target.value)}
  //             placeholder="Enter a topic... E.g. math"
  //           />
  //           <button onClick={generateBlogPost}>
  //             Generate
  //           </button>
  //         </div>
  //         <div className="status">Status <span>{teamWorkflowStatus}</span></div>
  //         {/* Generated Blog Post */}
  //         <div className="blog-post">
  //           {blogPost ? (
  //             <ReactMarkdown>{blogPost}</ReactMarkdown>
  //           ) : (
  //             <p className="blog-post-info"><span>ℹ️</span><span>No blog post available yet</span><span>Enter a topic and click 'Generate' to see results here.</span></p>
  //           )}
  //         </div>
  //       </div>

  //       {/* We'll add more UI elements in the next steps */}
  //       <div className="column">
  //         {/* Agents Here */}
  //         <h2 className="title">Agents</h2>
  //         <ul className="agent-list">
  //           {agents && agents.map((agent, index) => (
  //             <li key={index}>
  //               <img src={`https://ui-avatars.com/api/name=${encodeURIComponent(agent.name)}?background=3b82f6&color=fff`} alt={`${agent.name}'s avatar`} />
  //               <span>{agent.name}</span>
  //               <span>{agent.status}</span>
  //             </li>
  //           ))}
  //         </ul>

  //         {/* Tasks Here */}
  //         <h2 className="title">Tasks</h2>
  //         <ul className="task-list">
  //           {tasks && tasks.map((task, index) => (
  //             <li key={index}>
  //               <span>{task.title}</span>
  //               <span>{task.status}</span>
  //             </li>
  //           ))}
  //         </ul>

  //         {/* Stats Here */}
  //         <h2 className="title">Stats</h2>
  //         {stats ? (
  //           <div className="stats">
  //             <p>
  //               <span>Total Tokens: </span>
  //               <span>{stats.totalTokenCount}</span>
  //             </p>
  //             <p>
  //               <span>Total Cost: </span>
  //               <span>${stats.totalCost.toFixed(4)}</span>
  //             </p>
  //             <p>
  //               <span>Duration: </span>
  //               <span>{stats.duration} ms</span>
  //             </p>
  //           </div>
  //         ) : (
  //           <div className="stats"><p className="stats-info">ℹ️ No stats generated yet.</p></div>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );
}

export default App;