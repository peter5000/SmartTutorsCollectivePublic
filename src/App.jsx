import React, { useState } from 'react';
import './App.css';
import DevUtils from './DevUtils';
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
  const [quiz, setQuiz] = useState(null);
  const [question, setQuestion] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [student, setStudent] = useState({
    age: '',
    grade: '',
    lastLogin: '',
    strengths: '',
    weaknesses: ''
  });

  const [error, setError] = useState('');
 // FRONTEND CODE --------------------------------------------------------------------------------------------
 const [searchInput, setSearchInput] = useState('');
 const [messages, setMessages] = useState([{ sender: 'Agent', text: 'Welcome! Please enter your email.' }]);
 const [step, setStep] = useState(0);
 const [selections, setSelections] = useState({});
 const [stepInput, setStepInput] = useState('');
 const [showChat, setShowChat] = useState(false);
 

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


  const fetchStudent = async (email) => {
    try {
      const response = await axios.get(`http://localhost:5000/get-student?email=${email}`);
      setStudent(response.data);
      setError('');
      setSelections((prev) => ({
        ...prev,
        email: response.data.email,
        age: response.data.age,
        grade: response.data.grade,
      }));
      setStep(3);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'Agent', text: 'Welcome back! Please select the subject you are interested in.' },
      ]);

      saveStudent(response.data); // calling save student to update last login in the backend data
      return true; // Student found
    } catch (err) {
      const studentData = { email, age: '', grade: '', lastLogin: '' };
      setStudent(studentData);
      setError(err.response?.data?.message || 'Student not found. Please continue.');
      return false; // Student not found
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setMessages((prevMessages) => [...prevMessages, { sender: 'Student', text: searchInput }]);
      setSearchInput('');
    }
  };

  const saveStudent = async (studentData) => {
    const response = await axios.post('http://localhost:5000/save-student', studentData);
      console.log(response.data.message);  // Success message
  }


  const handleSelect = async (key, value) => {
     
    setSelections((prev) => ({ ...prev, [key]: value }));

    if (key === 'email') {
      const studentFound = await fetchStudent(value);
      if(studentFound) {
        return;
      }
    }
    
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
        { 
          setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Thank you! Your selections have been recorded and generating the quiz.' }]);
          const studentData = {
            email: selections.email,
            age: selections.age,
            grade: selections.grade,
        };
        saveStudent(studentData);
        setStudent(studentData);
      
        generateQuiz(selections.grade, selections.subject, selections.age, value).then(res => {
          let quizObj = res.data;
          if (quizObj.quiz && quizObj.quiz.questions) {
            setQuiz(quizObj.quiz);
            document.getElementById('question').hidden = false;
          } else {
            console.error('Quiz object does not contain questions');
          }
        });
        break; 
      }
      case 6:
        { 
          setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Working to evaluate submitted quiz...' }]);
          evaluateQuiz(selections.grade, selections.subject, selections.age, selections.level, quiz).then(res => {
          let quizObj = res.data;
          setStudent({email: student.email, age: student.age, grade: student.grade, 
            lastLogin: student.lastLogin, strengths: quizObj.quiz.topic_strengths.toString(), weaknesses: quizObj.quiz.topic_weaknesses.toString()})
        });
        break; 
      }
        // setQuiz(quizObj.quiz);
        // Function 1 -- first time experience 
        // call the agent method with question, expected ans and received ans - receive categorized student level and score
        // Display the categorized student level, strengts and weakness,  dispaly sorted topics and resources to learn (books names, online mater links etc)
        // + Display how the student wants to learn(WIP:pictures, text, audio) 

        // Function 2 - returned user -- repeated every time
        // Call the agent with student details, categarized level and preferred learning method
        // Gives - Quiz on the specific topic, level and subject

        //Function 3 - Post submission of quiz
        // Send back quiz response and ask for new categorized level and score and display remaining/new topics

      default:
        break;
    }
  
  };

  const handleKeyPress = (e, key) => {
    if (e.key === 'Enter') {
      handleSelect(key, e.target.value);
    }
  };

  const tempQuizFunc = () => {
    // example quiz with chosenAnswer field added to each question (note that this is 0 indexed)
    setQuiz(JSON.parse('{"questions":[{"question":"What is 5 + 3?","options":["6","7","8","9"],"correctAnswer":2,"topic":"Addition","chosenAnswer":0},{"question":"What is 10 - 4?","options":["5","6","7","8"],"correctAnswer":0,"topic":"Subtraction","chosenAnswer":0},{"question":"What is 3 x 2?","options":["5","6","7","8"],"correctAnswer":1,"topic":"Multiplication","chosenAnswer":0},{"question":"What is 12 ÷ 4?","options":["2","3","4","5"],"correctAnswer":1,"topic":"Division","chosenAnswer":0},{"question":"If you have 3 apples and you get 2 more, how many apples do you have?","options":["4","5","6","7"],"correctAnswer":1,"topic":"Addition","chosenAnswer":0},{"question":"What is the shape of a stop sign?","options":["Circle","Square","Triangle","Octagon"],"correctAnswer":3,"topic":"Geometry","chosenAnswer":0},{"question":"What is the next number in the sequence: 1, 2, 3, ___?","options":["4","5","6","7"],"correctAnswer":0,"topic":"Number Sequences","chosenAnswer":0},{"question":"How many sides does a rectangle have?","options":["2","3","4","5"],"correctAnswer":2,"topic":"Geometry","chosenAnswer":0},{"question":"What is 9 + 1?","options":["8","9","10","11"],"correctAnswer":2,"topic":"Addition","chosenAnswer":0},{"question":"What is half of 8?","options":["3","4","5","6"],"correctAnswer":1,"topic":"Fractions","chosenAnswer":0}]}'));
    handleSelect("quiz", "submitted");
  }

  const generateQuiz = (grade, subject, age, level) => {
    return axios.post(`http://localhost:5000/generate-quiz`, {
      grade: grade,
      subject: subject,
      age: age,
      level: level
    });
  };

  const evaluateQuiz = (grade, subject, age, level, quiz) => {
    return axios.post(`http://localhost:5000/evaluate-quiz`, {
      grade: grade,
      subject: subject,
      age: age,
      level: level,
      quiz: quiz
    });
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
        return (
          <div id="question" hidden={true}>
             {quiz && <Quiz quiz={quiz} />}
             <button onClick={tempQuizFunc}>Skip to next stage</button>
          </div>
        );
      case 6:
        return (<div>INSERT QUIZ HERE</div>);
      default:
        return null;
    }
  };

  return (
  <div>
  <div className="header">
    Smart Tutors Collective
  </div>
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

  <div className="student-card">
    {student && (
      <div className="student-details">
        <h2>Student Details</h2>
        <p><strong>Age:</strong> {student.age}</p>
        <p><strong>Grade:</strong> {student.grade}</p>
        <p><strong>Last Interacted On:</strong> {student.lastLogin? new Date(student.lastLogin).toLocaleString():''}</p>
        <p><strong>Strengths:</strong> {student.strengths}</p>
        <p><strong>Weaknesses:</strong> {student.weaknesses}</p>
      </div>
    )}
  </div>
</div>

</div>
    
  );
}

export default App;