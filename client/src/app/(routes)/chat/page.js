"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const ChatPage = () => {
  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-gray-600 mt-4">Start chatting with your friends</p>
      </div>
    </ProtectedRoute>
  );
};

export default ChatPage;
