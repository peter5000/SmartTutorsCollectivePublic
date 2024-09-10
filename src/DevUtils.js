const showApiKeyError = (missingKeys) => {
  const errorContainer = document.createElement('div');
  errorContainer.style.position = 'fixed';
  errorContainer.style.left = '0';
  errorContainer.style.top = '0';
  errorContainer.style.width = '100%';
  errorContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
  errorContainer.style.color = 'white';
  errorContainer.style.textAlign = 'center';
  errorContainer.style.padding = '20px';
  errorContainer.style.boxSizing = 'border-box';
  errorContainer.style.zIndex = '1000';

  errorContainer.innerHTML = `
    <p style="font-size: 1.2em; font-weight: bold;">The following API key(s) are missing:</p>
    <ul style="list-style-type: none; padding: 0;">
      ${missingKeys.map(key => `
        <li style="background-color: rgba(255, 255, 255); color: #535353; margin-bottom: 10px; padding: 10px; border-radius: 5px; text-align: left;">
          <div style="margin-bottom: 20px; font-size: 1.2em; font-weight: bold;">${key.name}</div>
          <div style="margin-bottom: 8px;">
            <span style="font-weight: 600;">Purpose:</span> ${key.purpose}
          </div>
          <div style="margin-bottom: 8px;">
            <span style="font-weight: 600;">Where to put it:</span> ${key.projectLocation}
          </div>
          <div>
            <span style="font-weight: 600;">Get the value here:</span> <a href="${key.valueLocation}" target="_blank" style="color: #535353; text-decoration: underline;">${key.valueLocation}</a>
          </div>
        </li>
      `).join('')}
    </ul>
    <p>Please add the missing key(s) to continue.</p>
    <p>Need help? Join our <a href="https://kaibanjs.com/discord" target="_blank" style="color: #fff; font-weight: bold;">Discord support channel</a>.</p>
    <button onclick="this.parentElement.style.display='none';" style="background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
  `;

  document.body.appendChild(errorContainer);
}

const DevUtils = () => {
  const missingKeys = [];
  
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    missingKeys.push({
      name: 'VITE_OPENAI_API_KEY',
      purpose: 'Used for generating AI responses and processing natural language queries.',
      projectLocation: 'In the .env file on the root of the project: VITE_OPENAI_API_KEY=your-api-key-value',
      valueLocation: 'https://platform.openai.com/account/api-keys'
    });
  }
  
  if (!import.meta.env.VITE_TRAVILY_API_KEY) {
    missingKeys.push({
      name: 'VITE_TRAVILY_API_KEY',
      purpose: 'Powers the search tool for agents, providing access to search-related data and services.',
      projectLocation: 'In the .env file on the root of the project: VITE_TRAVILY_API_KEY=your-api-key-value',
      valueLocation: 'https://tavily.com/#api' // Replace with actual URL if different
    });
  }

  if (missingKeys.length > 0) {
    showApiKeyError(missingKeys);
  }
}

DevUtils();

export default DevUtils;
