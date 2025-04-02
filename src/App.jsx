import React, { useState } from 'react';
import './App.css';
import DevUtils from './DevUtils';
import { imageTeam } from './generateFigure';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

import AgeSelector from './features/selection/AgeSelector';
import GradeSelector from './features/selection/GradeSelector';
import BookQuery from './features/selection/BookQuery';
import SubjectSelector from './features/selection/SubjectSelector';
import LevelSelector from './features/selection/LevelSelector';
import SuggestionSelector from './features/selection/SuggestionSelector';
import TopicSelector from './features/selection/TopicSelector';
import BookSelector from './features/selection/BookSelector';
import Chat from './features/chat/Chat';
import Quiz from './features/quiz/Quiz';
import EvalQuiz from './features/quiz/EvalQuiz';
import LearningPathSelector from './features/selection/LearningPathSelector';
// import ChatIconComponent from './features/chat/ChatIcon';

function App() {

// AGENT CODE --------------------------------------------------------------------------------------------
 // Setting up State
  const [quiz, setQuiz] = useState(null);
  const [evaluatedQuiz, setEvaluatedQuiz] = useState(null);
  const [question, setQuestion] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizNumber, setQuizNumber] = useState(0); // important for resetting quiz component

  const [student, setStudent] = useState({ });

  const [error, setError] = useState('');
 // FRONTEND CODE --------------------------------------------------------------------------------------------
 const [searchInput, setSearchInput] = useState('');
 const [messages, setMessages] = useState([{ sender: 'Agent', text: 'Welcome! Please enter your email.' }]);
 const [step, setStep] = useState(0);
 const [selections, setSelections] = useState({});
 const [stepInput, setStepInput] = useState('');
 const [showChat, setShowChat] = useState(false);
  const [topics, setTopics] = useState([]);
  const [books, setBooks] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [currentBook, setCurrentBook] = useState('');
  const [currentBookAuthors, setCurrentBookAuthors] = useState('');


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

    if (key === 'learning path') 
    {setMessages((prevMessages) => [...prevMessages, { sender: 'Student', text: `${key}: ${value.learningPath}` }]);

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
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: 'Agent', text: 'Thank you! Your selections have been recorded and generating the quiz.' },
              { sender: 'Agent', text: 'Would you like to take the evaluation now?' }
            ]);          const studentData = {
              email: selections.email,
              age: selections.age,
              grade: selections.grade,
              subject: selections.subject,
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
          if (value == 'Learning Paths') {
            setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Generating learning paths'}]);
            suggestLearningPaths(selections.grade, selections.subject, selections.age, selections.level, student.strengths, student.weaknesses)
              .then(res => res.data)
              .then(res => setLearningPaths(res.learningPaths));
          } else if (value == 'Books') {
            setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Generating book recommendations'}]);
            suggestBooks(selections.grade, selections.subject, selections.age, selections.level, student.strengths, student.weaknesses)
              .then(res => res.data)
              .then(res => setBooks(res.books));
          } else {
            console.error('Invalid suggestion type selected');
          }
          break;
        }
      case 7:
        {
          if (key === 'learning path') {
            value = JSON.parse(value);
            let learningPath = value.learningPath;
            let summary = value.summary;
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: 'Agent', text: `Generating the Topics related to the ${learningPath}...` }
            ]);
            suggestTopics(selections.grade, selections.subject, selections.age, selections.level, learningPath, summary, student.strengths, student.weaknesses)
            .then(res => res.data)
            .then(res => setTopics(res.topics));
          } else if (key === 'book') {
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: 'Agent', text: 'What would you like to learn more about this book?' }
            ]);
          } else {
            // Handle invalid selection
            // Theoretically, never should trigger
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: 'Agent', text: 'Invalid selection. Please select a valid topic or book.' }
            ]);
          }
          break;
        }
      case 8:
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'Agent', text: 'Generating the quiz...' }
        ]);
        setSelections((prev) => ({ ...prev, topic: value }));
        generateQuiz(selections.grade, selections.subject, selections.age, selections.level, value).then(res => {
          let quizObj = res.data;
          if (quizObj.quiz && quizObj.quiz.questions) {
            setQuiz(quizObj.quiz);
            document.getElementById('topic-question').hidden = false;
          } else {
            console.error('Quiz object does not contain questions');
          }
        });
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

  const generateQuiz = (grade, subject, age, level, topic=null) => {
    return axios.post(`http://localhost:5000/generate-quiz`, {
      grade: grade,
      subject: subject,
      age: age,
      level: level,
      topic: topic
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

    const suggestTopics = (grade, subject, age, level, learningPath, summary, strength=undefined, weakness=undefined) => {
      return axios.post(`http://localhost:5000/topic-suggestions`, {
        grade: grade,
        subject: subject,
        age: age,
        level: level,
        learningPath: learningPath,
        summary: summary,
        strength: strength,
        weakness: weakness
      });
    };

    const suggestBooks = (grade, subject, age, level, strength=undefined, weakness=undefined) => {
      return axios.post(`http://localhost:5000/book-suggestions`, {
        grade: grade,
        subject: subject,
        age: age,
        level: level,
        strength: strength,
        weakness: weakness
      });
    };

    const suggestLearningPaths = (grade, subject, age, level, strength=undefined, weakness=undefined) => {
      return axios.post(`http://localhost:5000/learning-path-suggestions`, {
        grade: grade,
        subject: subject,
        age: age,
        level: level,
        strength: strength,
        weakness: weakness
      });
    };

    const bookQuery = (subject, age, grade, level, book, authors, question) => {
      return axios.post(`http://localhost:5000/book-inquiry`, {
        subject: subject,
        age: age,
        grade: grade,
        level: level,
        book: book,
        authors: authors,
        question: question
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
          <div>
            <div id="question" hidden={true}>
                {quiz && !quizCompleted && (
                <Quiz
                  quiz={quiz}
                  subject={selections.subject}
                  age={selections.age}
                  grade={selections.grade}
                  level={selections.level}
                  onQuizComplete={(result) => {
                  // Extract strengths and weaknesses from the result
                    setEvaluatedQuiz(result.quiz);
                    const strengths = result.quiz.topic_strengths || [];
                    const weaknesses = result.quiz.topic_weaknesses || [];
                    // Calculate the score
                    const questions = result.quiz.questions || [];
                    const totalQuestions = questions.length;
                    const correctAnswers = questions.filter((q) => q.chosenAnswer === q.correctAnswer).length;
                    const score = `${correctAnswers} / ${totalQuestions}`; // Format as "correct / total"
                    // Update the student details with the evaluation result
                    setStudent((prevStudent) => ({
                      ...prevStudent,
                      strengths: strengths.join(', '), // Convert array to a comma-separated string
                      weaknesses: weaknesses.join(', '), // Convert array to a comma-separated string
                    }));
                    // Hide the quiz
                    setQuizCompleted(true);
                    document.getElementById('question').hidden = true;
                    // Display a message or update the UI
                    setMessages((prevMessages) => [
                      ...prevMessages,
                      { sender: 'Agent', text: `Your quiz is complete!` },
                      { sender: 'Agent', text: `Score: ${score}` },
                      { sender: 'Agent', text: `Strengths: ${strengths.join(', ')}` },
                      { sender: 'Agent', text: `Weaknesses: ${weaknesses.join(', ')}` },
                    ]);
                    document.getElementById('evalQuiz').hidden = false;
                  }}
                />
              )}
            </div>
            <div id="evalQuiz">
              {evaluatedQuiz && (
                <EvalQuiz
                  quiz={evaluatedQuiz}
                  onDone={() => {
                    setEvaluatedQuiz(null);
                    setQuiz(null);
                    document.getElementById('evalQuiz').hidden = true;
                    setMessages((prevMessages) => [
                      ...prevMessages,
                      { sender: 'Agent', text: `Do you want to see book suggestions or learning paths under the selected subject?` }
                    ]);
                    document.querySelector(".suggestion-selection").hidden = false;
                    setQuizCompleted(false);
                  }}
                />

              )}
            </div>
            <SuggestionSelector onSelect={handleSelect} />
          </div>
        );
      case 6:
      return (
          <div>
            {learningPaths.length > 0 && (<LearningPathSelector learningPaths={learningPaths} onSelect={handleSelect} />)}
            {books.length > 0 && (<BookSelector books={books} onSelect={(book, authors) => {
              handleSelect("book", book);
              setCurrentBook(book);
              setCurrentBookAuthors(authors);
              setStep(step + 3);
            }} />)}
          </div>
        );
      case 7:
        return <div>{topics.length > 0 && (<TopicSelector topics={topics} onSelect={handleSelect} />)}</div>
      case 8:
      return (
        <div>
          <div id="topic-question" hidden={true}>
              {quiz && !quizCompleted && (
              <Quiz
                quiz={quiz}
                subject={selections.subject}
                age={selections.age}
                grade={selections.grade}
                level={selections.level}
                topic={selections.topic}
                onQuizComplete={(result) => {
                // Extract strengths and weaknesses from the result
                  setEvaluatedQuiz(result.quiz)
                  // Calculate the score
                  const questions = result.quiz.questions || [];
                  const totalQuestions = questions.length;
                  const correctAnswers = questions.filter((q) => q.chosenAnswer === q.correctAnswer).length;
                  const score = `${correctAnswers} / ${totalQuestions}`; // Format as "correct / total"
                  // Hide the quiz
                  setQuizCompleted(true);
                  document.getElementById('topic-question').hidden = true;
                  // Display a message or update the UI
                  setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: 'Agent', text: `Your quiz is complete!` },
                    { sender: 'Agent', text: `Score: ${score}` }
                  ]);
                  document.getElementById('evalQuiz').hidden = false;
                // Clear the topic selection
                 setSelections((prev) => ({ ...prev, topic: null }));
                 console.log("Selected topic: ", selections.topic)
                }}
              />
            )}
          </div>
          <div id="evalQuiz">
            {evaluatedQuiz && (
              <EvalQuiz
                quiz={evaluatedQuiz}
                onDone={() => {
                  setEvaluatedQuiz(null);
                  setQuiz(null);
                  document.getElementById('evalQuiz').hidden = true;
                }}
              />

            )}
          </div>
        </div>
      );
      case 9:
        return (
          <BookQuery
            onQuery={(question) => {
              setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'Student', text: `${question}` },
              ]);
              bookQuery(selections.subject, selections.age, selections.age, selections.level, currentBook, currentBookAuthors, question).then(res => {
                let response = res.data;
                setMessages((prevMessages) => [
                  ...prevMessages,
                  { sender: 'Agent', text: `${response}` },
                ]);

              })
            }}
            onQuit={() => {
              // NEXT ITEM IN FLOWCHART HERE
            }
          }
          />
        );
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
    {student && Object.keys(student).length>0 ? (
      <div className="student-details">
        <h2>Student Details</h2>
        <p><strong>Age:</strong> {student.age}</p>
        <p><strong>Grade:</strong> {student.grade}</p>
        <p>
          <strong>Last Activity: </strong>
          {student.lastLogin
            ? new Date(student.lastLogin).toLocaleString()
            : ""}
        </p>
        <p><strong>Subject:</strong> {student.subject}</p>
        <p><strong>Strengths:</strong> {student.strengths}</p>
        <p><strong>Weaknesses:</strong> {student.weaknesses}</p>
      </div>
    ):""}
  </div>
</div>
</div>

  );
}

export default App;