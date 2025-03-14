import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const DocumentEditor = () => {
    const [content, setContent] = useState('');
    const socketRef = useRef();
    const editorRef = useRef(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('doc-update', (newContent) => {
            if (newContent !== content && editorRef.current) {
                editorRef.current.innerHTML = newContent;
            }
        });

        return () => socketRef.current.disconnect();
    }, [content]);

    const handleInput = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            setContent(newContent);
            socketRef.current.emit('doc-change', newContent);
        }
    };

    const formatText = (command) => {
        document.execCommand(command, false, null);
        editorRef.current.focus();
    };

    return (
        <div className="document-editor-container">
            <div className="toolbar">
                <button onClick={() => formatText('bold')}>Bold</button>
                <button onClick={() => formatText('italic')}>Italic</button>
                <button onClick={() => formatText('underline')}>Underline</button>
                <button onClick={() => formatText('insertUnorderedList')}>Bullet List</button>
                <button onClick={() => formatText('insertOrderedList')}>Numbered List</button>
            </div>
            <div
                ref={editorRef}
                className="document-editor"
                contentEditable={true}
                onInput={handleInput}
                suppressContentEditableWarning={true}
            />
        </div>
    );
};

export default DocumentEditor;