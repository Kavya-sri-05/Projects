import React, { useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import io from 'socket.io-client';

const CollaborativeEditor = ({ language, onEditorDidMount }) => {
    const socketRef = useRef();
    const editorRef = useRef(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('init-document', (content) => {
            if (editorRef.current) {
                editorRef.current.setValue(content);
            }
        });

        socketRef.current.on('content-update', (content) => {
            if (editorRef.current && editorRef.current.getValue() !== content) {
                editorRef.current.setValue(content);
            }
        });

        return () => socketRef.current.disconnect();
    }, []);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
        onEditorDidMount(editor);
        
        editor.onDidChangeModelContent(() => {
            const content = editor.getValue();
            socketRef.current.emit('content-change', content);
        });
    };

    return (
        <div style={{ height: '100vh' }}>
            <Editor
                height="90vh"
                defaultLanguage={language}
                theme="vs-dark"
                onMount={handleEditorDidMount}
            />
        </div>
    );
};

export default CollaborativeEditor;