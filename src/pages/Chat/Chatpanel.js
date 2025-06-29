// ChatApp.js
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { db, storage, auth } from "../../firebase";
import { signInWithCustomToken, onAuthStateChanged } from "firebase/auth";

const user1 = "yGq1awsdMeYI";
const user2 = "Ku1fR1yyQpSB";

const ChatApp = () => {
  const [chatId, setChatId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Auto-login with Firebase custom token (if needed)
  const loginUserToFirebase = async (token) => {
    const userCred = await signInWithCustomToken(auth, token);
    console.log("Firebase UID:", userCred.user?.uid);
    return userCred.user?.uid;
  };

  // Create or get chat between the two fixed users
  const createChatBetweenUsers = async (userId1, userId2) => {
    const q = query(collection(db, "admin_chats"), where("users", "array-contains", userId1));
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const users = docSnap.data().users || [];
      if (users.includes(userId2)) {
        return docSnap.id;
      }
    }

    const chatRef = await addDoc(collection(db, "admin_chats"), {
      users: [userId1, userId2],
      createdAt: serverTimestamp(),
    });

    return chatRef.id;
  };

  // Upload a file and return its URL
  const uploadFileToChat = async (file, chatId) => {
    const fileName = file.name;
    const storageRef = ref(storage, `chat_media/${chatId}/${uuidv4()}_${fileName}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // Send a message (text or file)
  const sendMessage = async () => {
    if (!chatId || (!messageText.trim() && !selectedFile)) return;

    let fileUrl = [];
    if (selectedFile) {
      const url = await uploadFileToChat(selectedFile, chatId);
      fileUrl.push(url);
    }

    const messageId = uuidv4();
    const messageRef = doc(db, "admin_chats", chatId, "messages", messageId);

    await setDoc(messageRef, {
      id: messageId,
      senderId: currentUser.uid,
      content: messageText || null,
      type: selectedFile ? "file" : "text",
      fileUrl,
      timestamp: serverTimestamp(),
    });

    setMessageText("");
    setSelectedFile(null);
  };

  // Listen to real-time messages
  const listenToMessages = (chatId) => {
    const q = query(
      collection(db, "admin_chats", chatId, "messages"),
      orderBy("timestamp", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
      setMessages(msgs);
    });
  };

  // Auth + Init Chat
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const otherUser = user.uid === user1 ? user2 : user1;
        const cid = await createChatBetweenUsers(user.uid, otherUser);
        setChatId(cid);
        listenToMessages(cid);
      }
    });
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>🔥 Firebase Chat App</h2>
      <div style={{ border: "1px solid #ccc", height: 300, overflowY: "auto", padding: 10 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: 10 }}>
            <strong>{msg.senderId === currentUser?.uid ? "You" : "Other"}:</strong>{" "}
            {msg.type === "file" && msg.fileUrl.length > 0 ? (
              msg.fileUrl.map((url, i) => (
                <div key={i}>
                  <a href={url} target="_blank" rel="noopener noreferrer">📎 File {i + 1}</a>
                </div>
              ))
            ) : (
              msg.content
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          style={{ width: "70%", marginRight: 5 }}
        />
        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatApp;
const rawTokens = localStorage.getItem("authTokens");
let decoded = null;

if (rawTokens) {
  try {
    const authTokens = JSON.parse(rawTokens);
    const tokenStr = String(authTokens?.access);

    decoded = jwtDecode(tokenStr);
    console.log("Decoded JWT Payload:", decoded);

    // setCurrentUser(decoded.user_id); // ✅ Correct usage

  } catch (err) {
    console.error("Error decoding JWT:", err);
  }
} else {
  console.warn("No authTokens found in localStorage.");
}