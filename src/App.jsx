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
  const [showEvaluationPrompt, setShowEvaluationPrompt] = useState(true);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [evaluatedQuiz, setEvaluatedQuiz] = useState(null);
  const [question, setQuestion] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [firstQuiz, setFirstQuiz] = useState(true);


  const [student, setStudent] = useState({ });

  const [error, setError] = useState('');
 // FRONTEND CODE --------------------------------------------------------------------------------------------
 const [searchInput, setSearchInput] = useState('');
 const [messages, setMessages] = useState([{ sender: 'Agent', text: 'Welcome! Please enter your email address to get started.' }]);
 const [step, setStep] = useState(0);
 const [selections, setSelections] = useState({});
 const [stepInput, setStepInput] = useState('');
 const [showChat, setShowChat] = useState(false);
  const [topics, setTopics] = useState([]);
  const [books, setBooks] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [currentBook, setCurrentBook] = useState('');
  const [currentBookAuthors, setCurrentBookAuthors] = useState('');

  const MAIN_SELECTOR_STEP = 5;


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
        { sender: 'Agent', text: 'Welcome back! What subject would you like to explore today?' },
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


  const handleSelect = async (key, value, jumpStep) => {
    // JUMP STEP SHOULD BE PASSED IN TO JUMP BACKWARDS/FORWARDS IN FLOW. SHOULD BE ONE LESS THAN DESIRED CASE NUMBER (as step + 1 exists in switch statement)
    console.log(key, value, jumpStep)
    if (jumpStep === undefined) {
      setSelections((prev) => ({ ...prev, [key]: value }));

      if (key === 'email') {
        const studentFound = await fetchStudent(value);
        if(studentFound) {
          return;
        }
      }
      if (key === 'learning path')
        {setMessages((prevMessages) => [...prevMessages, { sender: 'Student', text: `${key}: ${value.learningPath}` }]);
      } else {
        setMessages((prevMessages) => [...prevMessages, { sender: 'Student', text: `${key}: ${value}` }]);
      }
      setStep((prevStep) => prevStep + 1);
    } else {
      setStep(jumpStep + 1);
    }

    setStepInput('');

    let nextStep = jumpStep ? jumpStep : step; 
    // Add agent's prompt for the next step
    switch (nextStep + 1) {
      case 1:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Thank you! Now, could you please enter your age?' }]);
        break;
      case 2:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Got it! Next, please enter your grade level.' }]);
        break;
      case 3:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Great! What subject are you interested in exploring today?' }]);
        break;
      case 4:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Great choice! Please select your proficiency level.' }]);
        break;
      case 5:
          {
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: 'Agent', text: 'Thank you! Your preferences have been saved.' },
            ]);
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: 'Agent', text: 'Your personalized learning experience is being prepared. Please hold tight!' },
            ]);

            const studentData = {
              email: selections.email,
              age: selections.age,
              grade: selections.grade,
            };
            saveStudent(studentData);
            setStudent((prev) => ({...prev,
              email: selections.email,
              age: selections.age,
              grade: selections.grade,
              subject: selections.subject,
            }));
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
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'Agent', text: `Do you want to see book suggestions or learning paths under the selected subject above or do you want to try new subject?` }
          ]);
        }
        break;
      case 7:
        {
          setFirstQuiz(false);
          setQuiz(null);
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
          } else if (value == 'Select a New Subject') {
            setMessages((prevMessages) => [...prevMessages, {sender: 'Agent', text: 'Please select a new subject.'}])
            setQuiz(null);
            setEvaluatedQuiz(null);
            setQuizCompleted(false);
            setFirstQuiz(true);
            setStep(3);
          }
          else {
            console.error('Invalid suggestion type selected');
          }
          break;
        }
      case 8:
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
            .then(res => setTopics(res.topics))
            .then(() => {
              setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'Agent', text: `Please select a topic you want to practice` }
              ])});
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
      case 9:
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

  const handleEvaluationPromptResponse = (response) => {
    if (response === 'yes') {
      setShowEvaluationPrompt(false);
      generateQuiz(); // Generate quiz ONLY if the user selects Yes
    } else {
      setShowEvaluationPrompt(false);
      setIsQuizActive(false); // Skip quiz generation
    }
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
                  firstQuiz={firstQuiz}
                  onQuizComplete={(result) => {
                    // Quiz skipped
                    if (!result) {
                      document.getElementById('question').hidden = true;
                      // LOOP HERE SKIPPED QUIZ TO 3 FLOW
                      handleSelect(null, null, MAIN_SELECTOR_STEP);
                      return;
                    }
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
                    const updateStudent = {
                      ...student,
                      strengths: strengths.join(', '),
                      weaknesses: weaknesses.join(', '),
                      lastLogin: new Date().toISOString()
                    };

                    setStudent(updateStudent);
                    saveStudent(updateStudent);
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
                    // LOOP HERE -> FIRST EVAL QUIZ TO 3 WAY CHOICE
                    document.getElementById('evalQuiz').hidden = true;
                    setEvaluatedQuiz(null);
                    setQuiz(null);
                    setQuizCompleted(false);
                    handleSelect(null, null, MAIN_SELECTOR_STEP);
                  }}
                />

              )}
            </div>
          </div>
        );

      case 6:
        return (<SuggestionSelector onSelect={handleSelect} />)
      case 7:
      return (
          <div>
            {learningPaths.length > 0 && (<LearningPathSelector learningPaths={learningPaths} onSelect={handleSelect} />)}
            {books.length > 0 && (<BookSelector books={books} onSelect={(book, authors) => {
              setCurrentBook(book);
              setCurrentBookAuthors(authors);
              handleSelect("book", book);
            }} />)}
          </div>
        );
      case 8:
        return <div>
          {topics.length > 0 && (<TopicSelector topics={topics} onSelect={handleSelect} />)}
          {books.length > 0 && (<BookQuery
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
              // CLEAR LEARNING PATHS
              // LOOP HERE -> EXITING CHAT TO OPTION SELECTS
              setBooks([]); 
              setCurrentBook(null);
              setCurrentBookAuthors(null);
              handleSelect(null, null, MAIN_SELECTOR_STEP);
            }
          }
          />)}
        </div>
      case 9:
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
                firstQuiz={firstQuiz}
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
                 setLearningPaths([]); // CLEAR LEARNING PATHS
                }}
              />
            )}
          </div>
          <div id="evalQuiz">
            {evaluatedQuiz && (
              <EvalQuiz
                quiz={evaluatedQuiz}
                onDone={() => {
                  // LOOP HERE -> TOPIC EVAL QUIZ TO 3 WAY CHOICE
                  setEvaluatedQuiz(null);
                  setQuiz(null);
                  document.getElementById('evalQuiz').hidden = true;
                  setQuizCompleted(false);
                  setTopics([]);
                  handleSelect(null, null, MAIN_SELECTOR_STEP);
                }}
              />

            )}
          </div>
        </div>
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
        <p>
          <strong>Status: </strong>
          {student.lastLogin
            ? "Returned Student"
            : "New Student"}
        </p>
        <p><strong>Age:</strong> {student.age}</p>
        <p><strong>Grade:</strong> {student.grade}</p>
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