import React, { useState } from 'react';
import './App.css';

function App() {
  const [emailTemplate, setEmailTemplate] = useState('');
  const [variables, setVariables] = useState([]);
  const [previewEmails, setPreviewEmails] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Add a new variable
  const addVariable = () => {
    const newVar = {
      id: Date.now(),
      name: '',
      placeholder: '',
      color: getRandomColor(),
      values: [] // Array of values for this field
    };
    setVariables([...variables, newVar]);
  };

  // Get a random color for visual connection
  const getRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Update variable name
  const updateVariable = (id, field, value) => {
    setVariables(variables.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  // Remove variable
  const removeVariable = (id) => {
    setVariables(variables.filter(v => v.id !== id));
  };

  // Add a new value to a variable
  const addValueToVariable = (variableId) => {
    setVariables(variables.map(v => 
      v.id === variableId 
        ? { ...v, values: [...v.values, { id: Date.now(), text: '' }] }
        : v
    ));
  };

  // Update a value in a variable
  const updateVariableValue = (variableId, valueId, text) => {
    setVariables(variables.map(v => 
      v.id === variableId 
        ? { 
            ...v, 
            values: v.values.map(val => 
              val.id === valueId ? { ...val, text } : val
            )
          }
        : v
    ));
  };

  // Remove a value from a variable
  const removeVariableValue = (variableId, valueId) => {
    setVariables(variables.map(v => 
      v.id === variableId 
        ? { ...v, values: v.values.filter(val => val.id !== valueId) }
        : v
    ));
  };

  // Generate preview emails
  const generatePreview = () => {
    if (!emailTemplate || variables.length === 0) {
      alert('Please add email template and at least one field with values!');
      return;
    }

    // Check if all variables have values
    const variablesWithValues = variables.filter(v => v.values.length > 0);
    if (variablesWithValues.length === 0) {
      alert('Please add values to at least one field!');
      return;
    }

    // Find the variable with the most values to determine how many emails to generate
    const maxValues = Math.max(...variablesWithValues.map(v => v.values.length));
    
    const emails = [];
    
    // Generate emails based on the maximum number of values
    for (let i = 0; i < maxValues; i++) {
      let emailContent = emailTemplate;
      
      // Replace variables with actual values
      variables.forEach(variable => {
        const value = variable.values[i]?.text || `[${variable.name || 'Field'}]`;
        const regex = new RegExp(`\\[${variable.name}\\]`, 'g');
        emailContent = emailContent.replace(regex, value);
      });

      emails.push({
        id: i,
        name: `Email ${i + 1}`,
        content: emailContent
      });
    }

    setPreviewEmails(emails);
    setShowPreview(true);
  };

  // Copy email to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Email content copied to clipboard!');
  };

  // Export all emails as text
  const exportEmails = () => {
    const exportText = previewEmails.map(email => 
      `=== ${email.name} ===\n${email.content}\n\n`
    ).join('');
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emails.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get total number of emails that will be generated
  const getTotalEmails = () => {
    if (variables.length === 0) return 0;
    const variablesWithValues = variables.filter(v => v.values.length > 0);
    if (variablesWithValues.length === 0) return 0;
    return Math.max(...variablesWithValues.map(v => v.values.length));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Email Builder</h1>
        <p>Create personalized emails without any coding knowledge!</p>
      </header>

      <main className="App-main">
        {/* Email Template Section */}
        <section className="section">
          <h2>Write Your Email</h2>
          <p className="help-text">
            Write your email content here. Use <strong>highlighted boxes</strong> below to insert personal information.
          </p>
          <textarea
            value={emailTemplate}
            onChange={(e) => setEmailTemplate(e.target.value)}
            placeholder="Dear [Name],\n\nThank you for your interest in [Product] from [Company]. We're excited to work with you!\n\nBest regards,\nYour Team"
            className="email-template"
          />
        </section>

        {/* Variables Section */}
        <section className="section">
          <h2>Personal Information Fields</h2>
          <p className="help-text">
            Add fields for information you want to personalize (like names, companies, products).
          </p>
          <button onClick={addVariable} className="add-button">
            + Add New Field
          </button>
          
          {variables.map(variable => (
            <div key={variable.id} className="variable-item">
              <div className="variable-header">
                <div className="variable-color" style={{ backgroundColor: variable.color }}></div>
                <input
                  type="text"
                  placeholder="Field name (e.g., name, company, product)"
                  value={variable.name}
                  onChange={(e) => updateVariable(variable.id, 'name', e.target.value)}
                  className="variable-input"
                />
                <button 
                  onClick={() => removeVariable(variable.id)}
                  className="remove-button"
                  title="Remove this field"
                >
                  ✕
                </button>
              </div>
              
              <div className="variable-preview">
                <span className="preview-label">This will look like:</span>
                <span className="preview-box" style={{ borderColor: variable.color }}>
                  {variable.name ? `[${variable.name}]` : '[Field Name]'}
                </span>
              </div>

              {/* Values for this variable */}
              <div className="variable-values">
                <div className="values-header">
                  <h4>Values for this field:</h4>
                  <button 
                    onClick={() => addValueToVariable(variable.id)}
                    className="add-value-button"
                  >
                    + Add Value
                  </button>
                </div>
                
                <div className="values-list">
                  {variable.values.map(value => (
                    <div key={value.id} className="value-item">
                      <input
                        type="text"
                        placeholder={`Enter ${variable.name || 'value'}`}
                        value={value.text}
                        onChange={(e) => updateVariableValue(variable.id, value.id, e.target.value)}
                        className="value-input"
                        style={{ borderColor: variable.color }}
                      />
                      <button 
                        onClick={() => removeVariableValue(variable.id, value.id)}
                        className="remove-value-button"
                        title="Remove this value"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                
                {variable.values.length === 0 && (
                  <p className="no-values">No values added yet. Click "Add Value" to get started.</p>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Generate Preview Button */}
        <section className="section">
          <div className="generate-section">
            <button 
              onClick={generatePreview} 
              className="generate-button"
              disabled={!emailTemplate || variables.length === 0 || getTotalEmails() === 0}
            >
              Create {getTotalEmails()} Personalized Emails
            </button>
            
            {(!emailTemplate || variables.length === 0 || getTotalEmails() === 0) && (
              <p className="button-help">
                {!emailTemplate ? 'Write your email first' : 
                 variables.length === 0 ? 'Add at least one field' : 
                 'Add values to your fields'}
              </p>
            )}
            
            {getTotalEmails() > 0 && (
              <p className="email-count">
                This will create <strong>{getTotalEmails()}</strong> personalized emails
              </p>
            )}
          </div>
        </section>

        {/* Preview Section */}
        {showPreview && previewEmails.length > 0 && (
          <section className="section">
            <h2>Your Personalized Emails</h2>
            <p className="help-text">
              Here are all your personalized emails ready to use!
            </p>
            
            <div className="preview-actions">
              <button onClick={exportEmails} className="export-button">
                Download All Emails
              </button>
            </div>

            <div className="preview-emails">
              {previewEmails.map(email => (
                <div key={email.id} className="preview-email">
                  <div className="email-header">
                    <h3>{email.name}</h3>
                    <button 
                      onClick={() => copyToClipboard(email.content)}
                      className="copy-button"
                    >
                      Copy Email
                    </button>
                  </div>
                  <div className="email-content">
                    {email.content.split('\n').map((line, index) => (
                      <p key={index}>{line || '\u00A0'}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
