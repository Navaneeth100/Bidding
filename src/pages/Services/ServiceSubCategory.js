import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase"; // your firebase config
import { url } from "../../../mainurl"; // your API base url

const ChatApp = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [creatingChatUserId, setCreatingChatUserId] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Extract current user ID from JWT token stored in localStorage
  const getCurrentUserIdFromToken = () => {
    const authTokens = localStorage.getItem("authTokens");
    if (!authTokens) return null;
    try {
      const accessToken = JSON.parse(authTokens).access;
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      console.log("Decoded JWT payload:", payload);
      // Adjust user ID key according to your token payload
      return payload.user_id || payload.userId || payload.sub || null;
    } catch (err) {
      console.error("Failed to decode token", err);
      return null;
    }
  };

  // Fetch list of employees/users from your API
  const fetchUserList = async () => {
    try {
      const tokenStr = JSON.parse(localStorage.getItem("authTokens"))?.access;
      if (!tokenStr) return;

      const res = await axios.get(`${url}/auth/employees/?data=list`, {
        headers: { Authorization: `Bearer ${tokenStr}` },
      });
      setEmployeeList(res.data);
    } catch (error) {
      console.error("Failed to fetch employee list", error);
      // You can add token refresh or logout logic here if needed
    }
  };

  // Fetch all chats where current user is a participant (users array contains currentUserId)
  const fetchUserChats = async (userId) => {
    if (!userId) return;

    try {
      const chatsQuery = query(
        collection(db, "chats"),
        where("users", "array-contains", userId)
      );

      const snapshot = await getDocs(chatsQuery);
      const userChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChats(userChats);

      // Auto-select first chat if none selected yet
      if (userChats.length > 0 && !selectedChatId) {
        setSelectedChatId(userChats[0].id);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  // Listen for messages in the selected chat and update in realtime
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, "chats", selectedChatId, "messages"),
      orderBy("timestamp", "asc") // show oldest messages first
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedChatId]);

  // On component mount: get user ID, fetch user chats & employee list
  useEffect(() => {
    const userId = getCurrentUserIdFromToken();
    console.log("Current user employee ID:", userId);
    if (userId) {
      setCurrentUserId(userId);
      fetchUserChats(userId);
      fetchUserList();
    }
  }, []);

  // Create new chat with selected employee
  const createNewChat = async () => {
    if (!creatingChatUserId || !currentUserId) return;

    // Check if chat already exists between these two users
    const existingChat = chats.find(
      (chat) =>
        chat.users.length === 2 &&
        chat.users.includes(currentUserId) &&
        chat.users.includes(creatingChatUserId)
    );

    if (existingChat) {
      // Just select the existing chat
      setSelectedChatId(existingChat.id);
      setCreatingChatUserId("");
      return;
    }

    // Create new chat doc in Firestore
    try {
      const chatDoc = await addDoc(collection(db, "chats"), {
        users: [currentUserId, creatingChatUserId],
        createdAt: serverTimestamp(),
      });

      // Refresh chats and select the new chat
      fetchUserChats(currentUserId);
      setSelectedChatId(chatDoc.id);
      setCreatingChatUserId("");
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  // Send new message to selected chat
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId || !currentUserId) return;

    try {
      await addDoc(collection(db, "chats", selectedChatId, "messages"), {
        content: newMessage.trim(),
        senderId: currentUserId,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h2>🔥 Firebase Chat App</h2>

      <div style={{ marginBottom: 20 }}>
        <label>
          Create New Chat:{" "}
          <select
            value={creatingChatUserId}
            onChange={(e) => setCreatingChatUserId(e.target.value)}
          >
            <option value="">Select user</option>
            {employeeList
              .filter((u) => u.id !== currentUserId)
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email || user.id}
                </option>
              ))}
          </select>
        </label>
        <button
          onClick={createNewChat}
          disabled={!creatingChatUserId}
          style={{ marginLeft: 10 }}
        >
          Create
        </button>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        {/* Chat List */}
        <div
          style={{
            width: "30%",
            border: "1px solid #ccc",
            padding: 10,
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          <h3>Your Chats</h3>
          {chats.length === 0 && <p>No chats found</p>}
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              style={{
                padding: 8,
                cursor: "pointer",
                backgroundColor:
                  chat.id === selectedChatId ? "#eee" : "white",
                borderBottom: "1px solid #ddd",
              }}
            >
              <div>
                <strong>Chat ID:</strong> {chat.id}
              </div>
              <div>
                <strong>Users:</strong> {chat.users.join(", ")}
              </div>
            </div>
          ))}
        </div>

        {/* Messages + input */}
        <div
          style={{
            width: "70%",
            border: "1px solid #ccc",
            height: 400,
            display: "flex",
            flexDirection: "column",
            padding: 10,
          }}
        >
          {selectedChatId ? (
            <>
              <h3>Chat Messages</h3>
              <div
                style={{
                  flexGrow: 1,
                  overflowY: "auto",
                  marginBottom: 10,
                  border: "1px solid #ddd",
                  padding: 10,
                  borderRadius: 4,
                  backgroundColor: "#fafafa",
                }}
              >
                {messages.length === 0 && <p>No messages yet.</p>}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: 8,
                      textAlign:
                        msg.senderId === currentUserId ? "right" : "left",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: 16,
                        backgroundColor:
                          msg.senderId === currentUserId
                            ? "#4caf50"
                            : "#e0e0e0",
                        color: msg.senderId === currentUserId ? "white" : "black",
                        maxWidth: "70%",
                        wordWrap: "break-word",
                      }}
                    >
                      {msg.content || "[No Text]"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Message input */}
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  style={{
                    flexGrow: 1,
                    padding: 8,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <button onClick={sendMessage} disabled={!newMessage.trim()}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <p>Select a chat to see messages</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
