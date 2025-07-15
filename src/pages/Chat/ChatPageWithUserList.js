import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  writeBatch,
  deleteDoc,
  updateDoc,
  collectionGroup,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
  Skeleton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { alpha } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode';
import { url } from '../../../mainurl';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { motion, useAnimation } from 'framer-motion';

const firebaseConfig = {
  apiKey: 'AIzaSyDSJ8r73OsF3b0aF27JzoHjHVfKHkYDMTs',
  authDomain: 'bidding-app-de135.firebaseapp.com',
  projectId: 'bidding-app-de135',
  storageBucket: 'bidding-app-de135.appspot.com',
  messagingSenderId: '1098780501455',
  appId: '1:1098780501455:web:c5a22af91902f565529eba',
  measurementId: 'G-Z5MDF4Z37T',
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Typing Dots Animation
const TypingDots = ({ color = '#999' }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    {Array(3).fill(0).map((_, i) => (
      <Box
        key={i}
        component="span"
        sx={{
          display: 'inline-block',
          width: 7, height: 7, borderRadius: '50%',
          background: color,
          mx: 0.3,
          animation: 'typingDot 1.2s infinite',
          animationDelay: `${i * 0.18}s`,
          '@keyframes typingDot': {
            '0%': { opacity: 0.3, transform: 'translateY(0)' },
            '30%': { opacity: 1, transform: 'translateY(-2.5px)' },
            '60%': { opacity: 0.3, transform: 'translateY(0)' },
            '100%': { opacity: 0.3, transform: 'translateY(0)' },
          }
        }}
      />
    ))}
  </Box>
);

export default function ChatPage() {
  const theme = useTheme();
  const bottomRef = useRef(null);
  const lastMyMsgRef = useRef(null);
  const typingTimeout = useRef(null);
  const [isTyping, setIsTyping] = useState(false); // Add this state!
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [myAppUserId, setMyAppUserId] = useState(null);
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showDeleteFor, setShowDeleteFor] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const controls = useAnimation();
  const [lastMyMsgId, setLastMyMsgId] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const { access, firebase_token } = JSON.parse(localStorage.getItem('authTokens') || '{}');
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editInput, setEditInput] = useState('');



  // Load cached sidebar (instant)
  useEffect(() => {
    const cached = localStorage.getItem('chatSidebarCache');
    if (cached) {
      try { setEmployees(JSON.parse(cached)); } catch { }
      setLoadingPage(false);
    }
  }, []);

  // JWT decode
  useEffect(() => {
    if (!access) return;
    try {
      const { user_id } = jwtDecode(access);
      setMyAppUserId(user_id);
    } catch (e) {
      console.error('JWT decode failed:', e);
    }
  }, [access]);

  // Firebase sign-in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setFirebaseUid(u.uid);
      else if (firebase_token) signInWithCustomToken(auth, firebase_token).catch(console.error);
    });
    return unsub;
  }, [firebase_token]);

  // Fetch all sidebar data and cache it
  const fetchSidebarData = async () => {
    setLoadingPage(true);
    const empRes = await axios.get(`${url}/auth/employees/?data=list`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    const rawList = empRes.data;
    let list = myAppUserId ? rawList.filter((e) => e.id !== myAppUserId) : rawList;
    list = list.map(e => ({
      ...e,
      lastMsg: '',
      lastMsgObj: null,
      lastMsgTime: null,
      chatDocId: null,
      unread: 0,
      loadingMsg: true,
    }));
    setEmployees(list);

    const chatQ = query(collection(db, 'chats'), where('users', 'array-contains', myAppUserId));
    const chatSnap = await getDocs(chatQ);

    let chatMap = {};
    chatSnap.forEach(docu => {
      const users = docu.data().users;
      const otherId = users.find(u => u !== myAppUserId);
      if (otherId) chatMap[otherId] = docu.id;
    });

    const updated = [...list];
    for (let i = 0; i < updated.length; i++) {
      const e = updated[i];
      let chatId = chatMap[e.id];
      let lastMsgObj = null, lastMsg = '', lastMsgTime = null, unread = 0;
      if (chatId) {
        const msgSnap = await getDocs(query(
          collection(db, 'chats', chatId, 'messages'),
          orderBy('timestamp', 'desc')
        ));
        if (!msgSnap.empty) {
          lastMsgObj = msgSnap.docs[0].data();
          lastMsg = lastMsgObj.content;
          lastMsgTime = lastMsgObj.timestamp;
        }
        const unreadSnap = await getDocs(query(
          collection(db, 'chats', chatId, 'messages'),
          where('receiverId', '==', myAppUserId),
          where('senderId', '==', e.id),
          where('read', '==', false)
        ));
        unread = unreadSnap.size;
      }
      updated[i] = {
        ...e,
        chatDocId: chatId || null,
        lastMsgObj,
        lastMsg,
        lastMsgTime,
        unread,
        loadingMsg: false,
      };
      setEmployees(prev => {
        const arr = [...prev];
        arr[i] = updated[i];
        arr.sort((a, b) => {
          const tA = a.lastMsgTime?.seconds || 0;
          const tB = b.lastMsgTime?.seconds || 0;
          return tB - tA;
        });
        return arr;
      });
    }
    updated.sort((a, b) => {
      const tA = a.lastMsgTime?.seconds || 0;
      const tB = b.lastMsgTime?.seconds || 0;
      return tB - tA;
    });
    setEmployees(updated);
    localStorage.setItem('chatSidebarCache', JSON.stringify(updated));
    setLoadingPage(false);
  };

  // Fetch sidebar after login
  useEffect(() => {
    if (access && myAppUserId && firebaseUid) {
      fetchSidebarData();
    }
  }, [access, myAppUserId, firebaseUid]);

  // Real-time sidebar updates using messages collectionGroup (not while typing!)
  useEffect(() => {
    if (!myAppUserId || employees.length === 0) return;
    if (isTyping) return; // don't fetch while typing
    const q = query(
      collectionGroup(db, 'messages'),
      where('receiverId', '==', myAppUserId)
    );

    let lastNotified = {};
    const unsub = onSnapshot(q, (snap) => {
      fetchSidebarData();
      // Show notification for added docs (not if you are the sender)
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          const msg = change.doc.data();
          // Don't notify if chat is open and focused
          if (
            selectedEmployee?.id === msg.senderId &&
            document.hasFocus()
          ) return;
          // Avoid duplicate notification for same message
          if (lastNotified[msg.chatId] === msg.id) return;
          lastNotified[msg.chatId] = msg.id;

          // Notif only if not sent by me
          if (msg.senderId !== myAppUserId && window.Notification && Notification.permission === "granted") {
            new Notification("New message from " + (msg.senderName || "Employee"), {
              body: msg.content,
              icon: '/chat-icon.png', // Optional
              tag: msg.chatId
            });
          }
        }
      });
    });
    return unsub;
    // eslint-disable-next-line
  }, [myAppUserId, employees.length, selectedEmployee, isTyping]); // add isTyping!

  // Load messages and listen to typing
  useEffect(() => {
    setOtherTyping(false);
    if (!selectedEmployee?.id || !myAppUserId) return;
    setLoadingMessages(true);
    setMessages([]);
    setChatId(null);
    setLastMyMsgId(null);

    setEmployees(prev =>
      prev.map(e =>
        e.id === selectedEmployee.id ? { ...e, unread: 0 } : e
      )
    );
    const cached = localStorage.getItem('chatSidebarCache');
    if (cached) {
      try {
        const arr = JSON.parse(cached);
        const arrUpdated = arr.map(e =>
          e.id === selectedEmployee.id ? { ...e, unread: 0 } : e
        );
        localStorage.setItem('chatSidebarCache', JSON.stringify(arrUpdated));
      } catch { }
    }

    let unsub = () => { };
    let unsubTyping = () => { };
    (async () => {
      let chatDocId = selectedEmployee.chatDocId;
      if (!chatDocId) {
        const q = query(collection(db, 'chats'), where('users', 'array-contains', myAppUserId));
        const snap = await getDocs(q);
        snap.forEach((d) => {
          const users = d.data().users || [];
          if (users.includes(selectedEmployee.id)) chatDocId = d.id;
        });
      }
      if (chatDocId) {
        setChatId(chatDocId);
        unsub = onSnapshot(
          query(collection(db, 'chats', chatDocId, 'messages'), orderBy('timestamp', 'asc')),
          (s) => {
            const arr = s.docs.map((docu) => ({
              ...docu.data(),
              docId: docu.id,
            }));
            setMessages(arr);
            const myMsgs = arr.filter(m => m.senderId === myAppUserId);
            if (myMsgs.length) setLastMyMsgId(myMsgs[myMsgs.length - 1].id);
            setLoadingMessages(false);
          },
          (err) => {
            setLoadingMessages(false);
          },
        );
        // --- Typing indicator listener ---
        const chatDocRef = doc(db, 'chats', chatDocId);
        unsubTyping = onSnapshot(chatDocRef, (snap) => {
          const data = snap.data();
          if (!data?.typing) {
            setOtherTyping(false);
            return;
          }
          setOtherTyping(!!data.typing[selectedEmployee.id]);
        });
      } else {
        setLoadingMessages(false);
      }
    })();
    return () => {
      unsub();
      unsubTyping();
    };
  }, [selectedEmployee?.id, myAppUserId]);

  // Mark all received messages as read
  useEffect(() => {
    if (!chatId || !myAppUserId) return;
    const markAsRead = async () => {
      const msgsQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        where('receiverId', '==', myAppUserId),
        where('read', '==', false)
      );
      const unreadMsgs = await getDocs(msgsQuery);
      const batch = writeBatch(db);
      unreadMsgs.forEach((docu) => {
        batch.update(docu.ref, { read: true });
      });
      if (!unreadMsgs.empty) {
        await batch.commit();
      }
    };
    markAsRead();
  }, [chatId, myAppUserId, messages.length]);

  const lastReceivedMsgId = (() => {
    const received = messages.filter(m => m.senderId !== myAppUserId);
    return received.length ? received[received.length - 1].id : null;
  })();

  useEffect(() => {
    if (lastMyMsgRef.current) {
      lastMyMsgRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      controls.start({
        scale: [1, 1.25, 1],
        boxShadow: [
          '0 0 0px 0px rgba(56, 161, 105, 0)',
          '0 0 16px 6px rgba(56, 161, 105, 0.15)',
          '0 0 0px 0px rgba(56, 161, 105, 0)',
        ],
        transition: { duration: 0.8 }
      });
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lastMyMsgId, messages.length]);

  // --- TYPING INDICATOR LOGIC ---
  const setTypingStatus = async (isTypingNow) => {
    setIsTyping(isTypingNow);
    if (!chatId || !myAppUserId) return;
    const chatDocRef = doc(db, 'chats', chatId);
    try {
      await updateDoc(chatDocRef, {
        [`typing.${myAppUserId}`]: isTypingNow,
      });
    } catch (err) { }
  };

  const handleInputChange = (e) => {
    setMsgInput(e.target.value);
    if (chatId && myAppUserId) {
      setTypingStatus(true);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        setTypingStatus(false);
      }, 1200);
    }
  };

  const handleSend = async () => {
    setMsgInput('');
    setIsTyping(false);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    setTypingStatus(false);

    const text = msgInput.trim();
    if (!text || !selectedEmployee?.id) return;

    try {
      let id = chatId;

      if (!id) {
        const ref = await addDoc(collection(db, 'chats'), {
          users: [myAppUserId, selectedEmployee.id],
          createdAt: serverTimestamp(),
        });
        id = ref.id;
        setChatId(id);
        onSnapshot(
          query(collection(db, 'chats', id, 'messages'), orderBy('timestamp', 'asc')),
          (s) => setMessages(s.docs.map((d) => d.data()))
        );
      }

      const newMsgId = doc(collection(db, '_')).id;

      await addDoc(collection(db, 'chats', id, 'messages'), {
        id: newMsgId,
        senderId: myAppUserId,
        receiverId: selectedEmployee.id,
        content: text,
        type: 'text',
        timestamp: serverTimestamp(),
        read: false,
        chatId: id,

        // 🔽 Soft delete flags (initially 0)
        dltSender: 0,
        dltReceiver: 0,
      });

      setLastMyMsgId(newMsgId);
      fetchSidebarData();
    } catch (e) {
      console.error('Send message failed:', e);
    }
  };

  const handleDelete = async (msgId) => {
    if (!chatId) {
      console.warn('handleDelete: no chatId available – cannot delete message', msgId);
      return;
    }
    try {
      console.log('Attempting to delete message:', msgId, 'in chat:', chatId);
      await deleteDoc(doc(db, 'chats', chatId, 'messages', msgId));
      console.log('Message deleted successfully:', msgId);
      fetchSidebarData();
    } catch (e) {
      console.error('Error deleting message', msgId, 'in chat:', chatId, e);
    }
  };





  const filteredEmployees = useMemo(
    () =>
      employees
        .filter((e) =>
          e.username?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
          const tA = a.lastMsgTime?.seconds || 0;
          const tB = b.lastMsgTime?.seconds || 0;
          return tB - tA;
        }),
    [employees, search]
  );

  function MsgStatusIcon({ read, delivered }) {
    if (read)
      return <DoneAllIcon fontSize="small" sx={{ color: '#18b9ff', ml: 0.8, verticalAlign: 'middle' }} />;
    if (delivered)
      return <DoneAllIcon fontSize="small" sx={{ color: 'grey.500', ml: 0.8, verticalAlign: 'middle' }} />;
    return <DoneIcon fontSize="small" sx={{ color: 'grey.500', ml: 0.8, verticalAlign: 'middle' }} />;
  }

  if (loadingPage && employees.length === 0) {
    return (
      <Box sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme.palette.background.default,
        borderRadius: 3,
      }}>
        <CircularProgress size={52} thickness={4} color="primary" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isSmall ? 'column' : 'row',
        height: '80vh',
        p: isSmall ? 1 : 3,
        gap: 3,
        bgcolor: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #232526 0%, #414345 100%)'
          : 'linear-gradient(135deg, #f8ffae 0%, #43cea2 100%)',
        borderRadius: 4,
        minWidth: 320,
        transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
      }}
    >
      {/* Sidebar */}
      <Paper
        elevation={3}
        sx={{
          width: isSmall ? '100%' : 320,
          maxWidth: '100%',
          minHeight: 0,
          overflow: 'auto',
          flexShrink: 0,
          borderRadius: 3,
          bgcolor: isSmall
            ? theme.palette.background.paper
            : 'linear-gradient(135deg,rgb(93, 187, 246) 0%,rgb(82, 182, 235) 100%)',
          backdropFilter: isSmall ? 'none' : 'blur(8px)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <Box
          sx={{
            p: 2,
            position: 'sticky',
            top: 0,
            bgcolor: theme.palette.background.paper,
            zIndex: 2,
            borderBottom: 1,
            borderColor: 'divider',
            borderRadius: 3,
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 1,
              fontWeight: 800,
              letterSpacing: 0.3,
              background: '#198754',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Employees
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              sx: {
                bgcolor: theme.palette.background.default,
                borderRadius: 2,
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.01)',
                transition: 'box-shadow 0.3s',
                '&:focus-within': {
                  boxShadow: '0 0 0 2pxrgb(198, 225, 252)',
                },
              },
            }}
          />
        </Box>
        <List sx={{ flex: 1, p: 1 }}>
          {filteredEmployees.map((e) =>
            e.lastMsg && !e.loadingMsg ? (
              <Tooltip
                key={e.id}
                title={
                  <Typography sx={{ fontWeight: 500 }}>
                    {e.lastMsgObj?.senderId === myAppUserId ? 'You: ' : ''}
                    {e.lastMsg}
                  </Typography>
                }
                placement="right"
                arrow
              >
                <ListItemButton
                  selected={selectedEmployee?.id === e.id}
                  onClick={() => setSelectedEmployee(e)}
                  sx={{
                    borderRadius: 2,
                    my: 0.5,
                    px: 2,
                    transition: 'background 0.2s, color 0.2s',
                    '&.Mui-selected': {
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      },
                    },
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                >
                  <Badge
                    color="error"
                    badgeContent={e.unread || 0}
                    invisible={!e.unread}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    sx={{
                      '& .MuiBadge-badge': {
                        transform: 'translate(1000%, -50%)', // move further out
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        mr: 2,
                        background: `linear-gradient(135deg, ${[
                          '#ff9966,#ff5e62',
                          '#36d1c4,#6d8efd',
                          '#c471f5,#fa71cd',
                          '#f7971e,#ffd200',
                          '#43e97b,#38f9d7',
                          '#fc6076,#ff9a44',
                          '#30cfd0,#330867',
                          '#f953c6,#b91d73',
                        ][(e.username?.charCodeAt(0) || 65) % 8]
                          })`,
                        color: '#fff',
                        fontWeight: 700,
                        border: `2px solid ${theme.palette.background.paper}`,
                        boxShadow: theme.shadows[2],
                      }}
                    >
                      {(e.username?.[0] || '?').toUpperCase()}
                    </Avatar>
                  </Badge>

                  <ListItemText
                    primary={e.username}
                    secondary={
                      <Box sx={{
                        width: '95%',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        fontSize: 13,
                        color: 'text.secondary',
                        display: 'inline-block'
                      }}>
                        {e.lastMsgObj?.senderId === myAppUserId ? (
                          <>
                            <span style={{ color: theme.palette.text.secondary, fontWeight: 600 }}>You: </span>
                            {e.lastMsg}
                          </>
                        ) : (
                          e.lastMsg
                        )}
                      </Box>
                    }
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItemButton>
              </Tooltip>
            ) : (
              <ListItemButton
                key={e.id}
                selected={selectedEmployee?.id === e.id}
                onClick={() => setSelectedEmployee(e)}
                sx={{
                  borderRadius: 2,
                  my: 0.5,
                  px: 2,
                  transition: 'background 0.2s, color 0.2s',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                  },
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
              >
                <Badge
                  color="error"
                  overlap="circular"
                  badgeContent={e.unread || 0}
                  invisible={!e.unread}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <Avatar
                    sx={{
                      mr: 2,
                      background: `linear-gradient(135deg, ${[
                        '#ff9966,#ff5e62',
                        '#36d1c4,#6d8efd',
                        '#c471f5,#fa71cd',
                        '#f7971e,#ffd200',
                        '#43e97b,#38f9d7',
                        '#fc6076,#ff9a44',
                        '#30cfd0,#330867',
                        '#f953c6,#b91d73',
                      ][(e.username?.charCodeAt(0) || 65) % 8]
                        })`,
                      color: '#fff',
                      fontWeight: 700,
                      border: `2px solid ${theme.palette.background.paper}`,
                      boxShadow: theme.shadows[2],
                    }}
                  >
                    {(e.username?.[0] || '?').toUpperCase()}
                  </Avatar>
                </Badge>
                <ListItemText
                  primary={e.username}
                  secondary={
                    e.loadingMsg ? (
                      <Skeleton
                        variant="text"
                        width={90}
                        height={10}
                        sx={{
                          fontSize: '1rem',
                          bgcolor: theme.palette.mode === 'dark' ? '#272930' : '#ececec',
                        }}
                      />
                    ) : e.lastMsg ? (
                      <Box sx={{
                        width: '95%',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        fontSize: 13,
                        color: 'text.secondary',
                        display: 'inline-block'
                      }}>
                        {e.lastMsgObj?.senderId === myAppUserId ? (
                          <>
                            <span style={{ color: theme.palette.text.secondary, fontWeight: 600 }}>You: </span>
                            {e.lastMsg}
                          </>
                        ) : (
                          e.lastMsg
                        )}
                      </Box>
                    ) : (
                      (!selectedEmployee || selectedEmployee.id !== e.id) && (
                        <Box sx={{
                          width: '95%',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          fontSize: 13,
                          color: 'text.secondary',
                          display: 'inline-block'
                        }}>
                          <span style={{ color: '#ccc' }}>No messages yet</span>
                        </Box>
                      )
                    )
                  }
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItemButton>
            )
          )}
        </List>
      </Paper>

      {/* Chat pane */}
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.background.default,
          borderRadius: 3,
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.06)',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            color: theme.palette.primary.contrastText,
            position: 'sticky',
            top: 0,
            zIndex: 3,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            boxShadow: `0 2px 8px 0 ${theme.palette.grey[400]}33`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {selectedEmployee
              ? `Chat with ${selectedEmployee.username}`
              : 'No Chat Selected'}
          </Typography>
        </Box>

        {/* Messages */}
        {selectedEmployee ? (
          <Box
            sx={{
              flex: 1,
              p: 3,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.2,
              bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(36, 37, 42, 0.97)'
                : 'linear-gradient(135deg,rgb(176, 231, 139) 0%, #ace0f9 100%)',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {loadingMessages ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress size={32} />
              </Box>
            ) : (
              <>
                {messages.map((m) => {
                  const isMine = m.senderId === myAppUserId;
                  const isLastReceived = m.id === lastReceivedMsgId;
                  const delivered = true;
                  const read = !!m.read;

                  return (
                    <motion.div
                      key={m.id}
                      ref={isLastReceived ? lastMyMsgRef : null}
                      animate={isLastReceived ? controls : undefined}
                      initial={false}
                      transition={{ duration: 0.7, type: 'spring' }}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        marginBottom: 8,
                        zIndex: isLastReceived ? 10 : 1,
                        fontSize: isLastReceived ? '1.18rem' : '1.07rem',
                        fontWeight: isLastReceived ? 700 : 500,
                        background: isLastReceived
                          ? alpha(theme.palette.success.light, 0.12)
                          : 'none',
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (isMine) setShowDeleteFor(m.id);
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          mb: 1,
                          borderRadius: 4,
                          background: isMine
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                            : `linear-gradient(135deg, ${theme.palette.grey[200]} 0%, ${theme.palette.grey[100]} 100%)`,
                          color: isMine
                            ? theme.palette.primary.contrastText
                            : theme.palette.text.primary,
                          boxShadow: isLastReceived
                            ? '0 6px 36px 0 rgba(24,185,255,0.12)'
                            : theme.shadows[1],
                          fontWeight: isLastReceived ? 700 : 500,
                          fontSize: isLastReceived ? '1.18rem' : '1.07rem',
                          border: `1px solid ${isMine
                            ? theme.palette.primary.dark
                            : theme.palette.divider
                            }`,
                          transition: 'background 0.3s',
                          wordBreak: 'break-word',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: isLastReceived ? 700 : 500, pr: 0.6 }}
                          >
                            {m.content}
                          </Typography>
                          {isMine && <MsgStatusIcon read={read} delivered={delivered} />}
                        </Box>
                      </Paper>
                      {showDeleteFor === m.id && isMine && (
                        <IconButton
                          size="small"
                          sx={{
                            ml: 1,
                            alignSelf: 'center',
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: theme.shadows[2],
                            '&:hover': {
                              bgcolor: theme.palette.error.main,
                              color: theme.palette.error.contrastText,
                            },
                          }}
                          onClick={() => {
                            handleDelete(m.docId);
                            setShowDeleteFor(null);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </motion.div>
                  );
                })}


                {otherTyping && (
                  <Box
                    sx={{
                      alignSelf: 'flex-start',
                      mb: 1,
                      ml: 1.5,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Paper
                      sx={{
                        px: 1.6, py: 1,
                        borderRadius: 4,
                        display: 'inline-block',
                        background: alpha(theme.palette.info.main, 0.10),
                        color: theme.palette.text.secondary,
                        boxShadow: theme.shadows[1],
                        minWidth: 34
                      }}
                    >
                      <TypingDots color={theme.palette.info.main} />
                    </Paper>
                    <Typography variant="caption" sx={{ ml: 1, color: theme.palette.info.main }}>
                      {selectedEmployee.username} is typing...
                    </Typography>
                  </Box>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
            }}
          >
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Please select a chat to start messaging.
            </Typography>
          </Box>
        )}

        {/* Composer */}
        {selectedEmployee && (
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 2,
              bgcolor: theme.palette.background.paper,
              alignItems: 'center',
              position: 'sticky',
              bottom: 0,
              zIndex: 3,
              boxShadow: '0 -1px 8px 0 rgba(0,0,0,0.04)',
            }}
          >
            <TextField
              fullWidth
              size="medium"
              value={msgInput}
              onChange={handleInputChange}
              placeholder="Type a message…"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              sx={{
                borderRadius: 4,
                bgcolor: theme.palette.background.default,
                boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
                fontSize: '1.05rem',
                input: { py: 1.3 },
              }}
            />
            <Button
              variant="contained"
              sx={{
                minWidth: 48,
                minHeight: 48,
                borderRadius: '50%',
                backgroundColor: theme.palette.success.main,
                color: theme.palette.getContrastText(theme.palette.success.main),
                '&:hover': {
                  backgroundColor: theme.palette.success.dark,
                },
                boxShadow: theme.shadows[3],
              }}
              onClick={handleSend}
            >
              <SendIcon fontSize="small" sx={{ color: "white" }} />
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
