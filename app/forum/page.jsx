'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase'; // Import konfigurasi Firebase Anda

const ForumPage = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [posting, setPosting] = useState(false);
    const auth = getAuth(app);
    const user = auth.currentUser;

    const db = getFirestore(app);
    const forumCollection = collection(db, 'forum');

    useEffect(() => {
        // Mendapatkan pesan forum secara real-time dari Firestore
        const q = query(forumCollection, orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(messagesList);
        });

        return () => unsubscribe();
    }, []);

    const handlePostMessage = async () => {
        if (!message.trim()) {
            alert("Please enter a message.");
            return;
        }
        if (!user) {
            alert("You must be logged in to post a message.");
            return;
        }

        setPosting(true);

        try {
            await addDoc(forumCollection, {
                content: message,
                timestamp: new Date(),
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
            });
            setMessage('');
        } catch (error) {
            console.error("Error posting message:", error);
            alert("Failed to post the message.");
        }

        setPosting(false);
    };

    return (
        <div className="flex flex-col items-center p-8 mt-4">
            <h1 className="text-2xl font-bold">Forum Diskusi</h1>
            <p className="text-gray-500 mt-2">Diskusikan catatan dan ide di sini</p>

            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-4 mb-2 p-4 border rounded-md w-[50rem] md:w-[60rem] h-[10rem] md:h-[12rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message here..."
            />

            <button
                onClick={handlePostMessage}
                className={`btn ${posting ? 'bg-gray-400' : 'bg-blue-500'} text-white hover:bg-blue-700 mt-4`}
                disabled={posting}
            >
                {posting ? 'Posting...' : 'Post Message'}
            </button>

            <div className="w-full mt-8">
                {messages.map((msg) => (
                    <div key={msg.id} className="bg-gray-100 p-4 mb-4 rounded shadow-lg w-full">
                        <div className="text-sm text-gray-600">{msg.userName || 'Anonymous'}</div>
                        <p className="mt-2">{msg.content}</p>
                        <div className="text-xs text-gray-500 mt-2">{msg.timestamp.toDate().toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ForumPage;
