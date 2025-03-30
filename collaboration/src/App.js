import React, { useState, useRef } from 'react';
import CollaborativeEditor from './components/editor';
import Whiteboard from './components/Whiteboard';
import DocumentEditor from './components/DocumentEditor';
import './App.css';

function App() {
  const [mode, setMode] = useState('editor');
  const [fileName, setFileName] = useState('untitled');
  const [language, setLanguage] = useState('javascript');
  const editorRef = useRef(null);

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      css: 'css',
      html: 'html',
      typescript: 'ts',
      markdown: 'md',
      text: 'txt'
    };
    return extensions[lang] || 'txt';
  };

  const handleSave = async () => {
    let content;
    if (mode === 'editor' && editorRef.current) {
      content = editorRef.current.getValue();
    } else if (mode === 'whiteboard') {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        content = canvas.toDataURL('image/png');
      }
    } else if (mode === 'document') {
      const docContent = document.querySelector('.document-editor');
      if (docContent) {
        content = docContent.innerHTML;
      }
    }

    if (content) {
      const element = document.createElement('a');
      if (mode === 'editor') {
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${fileName}.${getFileExtension(language)}`;
      } else if (mode === 'whiteboard') {
        element.href = content;
        element.download = `${fileName}.png`;
      } else {
        const file = new Blob([content], { type: 'text/html' });
        element.href = URL.createObjectURL(file);
        element.download = `${fileName}.html`;
      }
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Real-time Collaborative Tool</h1>
        <div className="controls">
          <input 
            type="text" 
            value={fileName} 
            onChange={(e) => setFileName(e.target.value)}
            placeholder="File name"
            className="filename-input"
          />
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
            className="mode-select"
          >
            <option value="editor">Code Editor</option>
            <option value="document">Document Editor</option>
            <option value="whiteboard">Whiteboard</option>
          </select>
          {mode === 'editor' && (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="css">CSS</option>
              <option value="html">HTML</option>
              <option value="typescript">TypeScript</option>
              <option value="markdown">Markdown</option>
            </select>
          )}
          <button onClick={handleSave} className="save-button">
            Save File
          </button>
        </div>
      </header>
      {mode === 'editor' ? (
        <CollaborativeEditor 
          language={language}
          onEditorDidMount={handleEditorDidMount}
        />
      ) : mode === 'document' ? (
        <DocumentEditor />
      ) : (
        <Whiteboard />
      )}
    </div>
  );
}

export default App;