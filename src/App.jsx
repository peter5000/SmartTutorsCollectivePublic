import React, { useState } from 'react';
import './App.css';
import DevUtils from './DevUtils';
import { blogTeam } from './blogTeam';
import ReactMarkdown from 'react-markdown';

function App() {
  // Setting up State
  const [topic, setTopic] = useState('');
  const [blogPost, setBlogPost] = useState('');
  const [stats, setStats] = useState(null);

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

  const generateBlogPost = async () => {
    setBlogPost('');
    setStats(null);
  
    try {
      const output = await blogTeam.start({ topic });
      if (output.status === 'FINISHED') {
        setBlogPost(output.result);
  
        const { costDetails, llmUsageStats, duration } = output.stats;
        setStats({
          duration: duration,
          totalTokenCount: llmUsageStats.inputTokens + llmUsageStats.outputTokens,
          totalCost: costDetails.totalCost
        });
      } else if (output.status === 'BLOCKED') {
        console.log(`Workflow is blocked, unable to complete`);
      }
    } catch (error) {
      console.error('Error generating blog post:', error);
    }
  };

  return (
    <div className="App">
      <h1>AI Agents News Blogging Team</h1>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter a topic... E.g. 'AI News Sep, 2024'"
      />
      <button onClick={generateBlogPost}>
        Generate Blog Post
      </button>
      <div>Status: {teamWorkflowStatus}</div>
      <h2>Generated Blog Post:</h2>
      <div className="blog-post">
  {blogPost ? (
    <ReactMarkdown>{blogPost}</ReactMarkdown>
  ) : (
    <p>No blog post available yet. Enter a topic and click 'Generate Blog Post' to see results here.</p>
  )}
</div>

      {/* We'll add more UI elements in the next steps */}
      
      {/* Agents Here */}
      <h2>🕵️‍♂️ Agents:</h2>
<ul className="agent-list">
  {agents && agents.map((agent, index) => (
    <li key={index}>
      {agent.name}: {agent.status}
    </li>
  ))}
</ul>      

      {/* Tasks Here */}
      <h2>📝 Tasks:</h2>
<ul className="task-list">
  {tasks && tasks.map((task, index) => (
    <li key={index}>
      {task.title}: {task.status}
    </li>
  ))}
</ul>      
      
      {/* Stats Here */}
      <h2>📊 Stats:</h2>
{stats ? (
  <div className="stats">
    <p>Duration: {stats.duration} ms</p>
    <p>Total Token Count: {stats.totalTokenCount}</p>
    <p>Total Cost: ${stats.totalCost.toFixed(4)}</p>
  </div>
) : (
  <div className="stats"><p>No stats generated yet.</p></div>
)}      
    </div>
  );
}

export default App;