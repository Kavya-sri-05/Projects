import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const socketRef = useRef();
    const isDrawing = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = window.innerWidth * 0.9;
        canvas.height = window.innerHeight * 0.8;
        
        // Set drawing style
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.lineCap = 'round';

        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('draw-line', ({x0, y0, x1, y1}) => {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.stroke();
        });

        return () => socketRef.current.disconnect();
    }, []);

    const startDrawing = (e) => {
        isDrawing.current = true;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        canvas.getContext('2d').moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing.current) return;
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const x0 = context.lastX || x;
        const y0 = context.lastY || y;

        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x, y);
        context.stroke();

        socketRef.current.emit('draw-line', {x0, y0, x1: x, y1: y});
        
        context.lastX = x;
        context.lastY = y;
    };

    const stopDrawing = () => {
        isDrawing.current = false;
        const context = canvasRef.current.getContext('2d');
        context.lastX = undefined;
        context.lastY = undefined;
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            className="whiteboard"
        />
    );
};

export default Whiteboard;