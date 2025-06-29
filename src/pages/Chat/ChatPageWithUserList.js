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
import { db, auth } from "../../firebase";
import { url } from "../../../mainurl";

const ChatApp = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [creatingChatUserId, setCreatingChatUserId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [user_id, setUser_id] = useState("");
  const [firebaseUID, setFirebaseUID] = useState(null);
  const [tokenUserId, setTokenUserId] = useState(null);

console.log("firebaseUID",firebaseUID);

  const getCurrentUserIdFromToken = () => {
    const authTokens = localStorage.getItem("authTokens");
    if (!authTokens) return null;

    try {
      const accessToken = JSON.parse(authTokens).access;
      if (!accessToken) return null;

      const payloadBase64 = accessToken.split(".")[1];
      if (!payloadBase64) return null;

      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      return payload.user_id || null;
    } catch (err) {
      console.error("Failed to decode token", err);
      return null;
    }
  };

  useEffect(() => {
    const userId = getCurrentUserIdFromToken();
    if (userId) {
      setUser_id(userId);
    }
  }, []);

  // This effect will run *after* user_id changes
  useEffect(() => {
    console.log("auth_id:", user_id);
  }, [user_id]);



 



  // Fetch employee list from your API
  const fetchUserList = async () => {
    try {
      const tokenStr = JSON.parse(localStorage.getItem("authTokens"))?.access;
      if (!tokenStr) return;

      const res = await axios.get(`${url}/auth/employees/?data=list`, {
        headers: { Authorization: `Bearer ${tokenStr}` },
      });
      setEmployeeList(res.data);
      console.log("Employee list:", res.data);
    } catch (error) {
      console.error("Failed to fetch employee list", error);
    }
  };

  // Fetch chats where currentUserId is in users array
  const fetchUserChats = async (user_id) => {
    if (!user_id) return;

    try {
      const chatsQuery = query(
        collection(db, "chats"),
        where("users", "array-contains", user_id)
      );
      const snapshot = await getDocs(chatsQuery);
      const userChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChats(userChats);
      if (userChats.length > 0 && !selectedChatId) {
        setSelectedChatId(userChats[0].id);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  // Listen for messages in selected chat
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
   
      return;
    }

    const messagesQuery = query(
      collection(db, "chats", selectedChatId, "messages"),
      orderBy("timestamp", "asc")
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

useEffect(() => {
  console.log("Setting up Firebase auth listener...");

  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log("Firebase user logged in:", user);
      console.log("Firebase user UID:", user.uid);
      setFirebaseUID(user.uid);

      // Optionally load your authTokens if needed
      let tokens = localStorage.getItem("authTokens");
      if (!tokens) {
        console.log("No authTokens found. You may need to re-authenticate your API.");
        // Here you could request a new token or redirect to login
        return;
      }

      tokens = JSON.parse(tokens);
      const apiUserId = getCurrentUserIdFromToken();
      if (apiUserId) {
        setUser_id(apiUserId);
      } else {
        console.log("No API user_id decoded. You may need to re-login.");
      }
    } else {
      console.log("No Firebase user logged in");
      setFirebaseUID(null);
      setUser_id(null);
    }
  });

  return () => {
    console.log("Cleaning up Firebase auth listener");
    unsubscribe();
  };
}, []);


  // Create new chat with selected Firebase UID user
  const createNewChat = async () => {
    if (!creatingChatUserId || !currentUserId) return;

    // Double check if chat exists just in case (should be excluded in dropdown)
    const existingChat = chats.find(
      (chat) =>
        chat.users.length === 2 &&
        chat.users.includes(currentUserId) &&
        chat.users.includes(creatingChatUserId)
    );

    if (existingChat) {
      setSelectedChatId(existingChat.id);
      setCreatingChatUserId("");
      return;
    }

    try {
      const chatDoc = await addDoc(collection(db, "chats"), {
        users: [currentUserId, creatingChatUserId],
        createdAt: serverTimestamp(),
      });

      fetchUserChats(currentUserId);
      setSelectedChatId(chatDoc.id);
      setCreatingChatUserId("");
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  // Send message in selected chat
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
              .filter((u) => {
                if (u.id === currentUserId) return false; // exclude yourself
                // exclude users already in chat with currentUserId
                const hasChat = chats.some(
                  (chat) =>
                    chat.users.length === 2 &&
                    chat.users.includes(currentUserId) &&
                    chat.users.includes(u.id)
                );
                return !hasChat;
              })
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
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

              </div>
              <div>
                <strong>Users:</strong>{" "}
                {chat.users
                  .map((uid) => {
                    const user = employeeList.find((e) => e.id === uid);
                    return user ? user.username : null; // return null if no username found
                  })
                  .filter(Boolean) // remove nulls
                  .join(", ")
                }

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
