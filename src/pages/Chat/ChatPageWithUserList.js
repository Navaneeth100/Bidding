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
  deleteDoc,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';

/* ───────────── Material‑UI ───────────── */
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,

} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { alpha, styled } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode';
import { url } from '../../../mainurl';

/* ───────────── Firebase bootstrap ───────────── */
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

/* ───────────── Helpers ───────────── */
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

const MessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isMine',
})(({ theme, isMine }) => ({
  padding: theme.spacing(1),
  maxWidth: '70%',
  alignSelf: isMine ? 'flex-end' : 'flex-start',
  backgroundColor: isMine
    ? alpha(theme.palette.primary.main, 0.15)
    : theme.palette.mode === 'dark'
      ? alpha('#ffffff', 0.05)
      : theme.palette.grey[100],
}));

/* ───────────── Component ───────────── */
export default function ChatPage() {
  const theme = useTheme();
  const bottomRef = useRef(null);

  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  /* ----------------- state ----------------- */
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [myAppUserId, setMyAppUserId] = useState(null); // JWT id
  const [firebaseUid, setFirebaseUid] = useState(null); // Auth uid (same value)
  const [chatId, setChatId] = useState(null);
  const [search, setSearch] = useState('');

  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showDeleteFor, setShowDeleteFor] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);

  /* -------- decode app user‑id from JWT -------- */
  const { access, firebase_token } = JSON.parse(localStorage.getItem('authTokens') || '{}');
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };
  useEffect(() => {
    if (!access) return;
    try {
      const { user_id } = jwtDecode(access);
      setMyAppUserId(user_id);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('JWT decode failed:', e);
    }
  }, [access]);

  /* -------- sign in with custom token -------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setFirebaseUid(u.uid);
      } else if (firebase_token) {
        signInWithCustomToken(auth, firebase_token).catch(console.error);
      }
    });
    return unsub;
  }, [firebase_token]);

  /* -------- fetch employees (excluding self) -------- */
  useEffect(() => {
    if (!access) return;
    axios
      .get(`${url}/auth/employees/?data=list`, {
        headers: { Authorization: `Bearer ${access}` },
      })
      .then(({ data }) => {
        const list = myAppUserId ? data.filter((e) => e.id !== myAppUserId) : data;
        setEmployees(list);
      })
      .catch(console.error);
  }, [access, myAppUserId]);

  /* -------- when user selects an employee -------- */
  useEffect(() => {
    if (!selectedEmployee?.id || !myAppUserId) return;

    setLoadingMessages(true);
    setMessages([]);
    setChatId(null);
    let unsub = () => { };

    (async () => {
      const q = query(collection(db, 'chats'), where('users', 'array-contains', myAppUserId));
      const snap = await getDocs(q);
      let found = null;
      snap.forEach((d) => {
        const users = d.data().users || [];
        if (users.includes(selectedEmployee.id)) found = d.id;
      });

      if (found) {
        setChatId(found);
        unsub = onSnapshot(
          query(collection(db, 'chats', found, 'messages'), orderBy('timestamp', 'asc')),
          (s) => {
            setMessages(s.docs.map((d) => d.data()));
            setLoadingMessages(false);
          },
          (err) => {
            console.error('[CHAT] snapshot error', err);
            setLoadingMessages(false);
          },
        );
      } else {
        setLoadingMessages(false);
      }
    })();

    return () => unsub();
  }, [selectedEmployee?.id, myAppUserId]);

  /* -------- autoscroll on new msgs -------- */
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  /* -------- send message -------- */
  const handleSend = async () => {
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

        onSnapshot(query(collection(db, 'chats', id, 'messages'), orderBy('timestamp', 'asc')), (s) =>
          setMessages(s.docs.map((d) => d.data())),
        );
      }

      await addDoc(collection(db, 'chats', id, 'messages'), {
        id: doc(collection(db, '_')).id,
        senderId: myAppUserId,
        receiverId: selectedEmployee.id,
        content: text,
        type: 'text',
        timestamp: serverTimestamp(),
      });
      setMsgInput('');
    } catch (e) {
      console.error('[SEND] failed:', e);
    }
  };

  /* -------- delete -------- */
  const handleDelete = async (msgId) => {
    if (!chatId) return;
    try {
      await deleteDoc(doc(db, 'chats', chatId, 'messages', msgId));
    } catch (e) {
      console.error('[DEL] failed:', e);
    }
  };
  const filteredEmployees = useMemo(
    () =>
      employees.filter((e) =>
        e.username.toLowerCase().includes(search.toLowerCase())
      ),
    [employees, search]
  );


  /* ----------------- Render ----------------- */
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
        // boxShadow: '0 4px 32px 0 rgba(0,0,0,0.07)',
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
            // boxShadow: '0 2px 8px 0 rgba(0,0,0,0.02)',
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
          {filteredEmployees.map((e) => (


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
              <ListItemText
                primary={e.username}
                secondary={e.email || ''}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          ))}
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
            boxShadow: `0 2px 8px 0 ${theme.palette.grey[400]}33`, // subtle shadow with transparency
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
           {messages.map((m) => (
  <Box
    key={m.id}
    sx={{
      position: 'relative',
      display: 'flex',
      alignSelf:
        m.senderId === myAppUserId ? 'flex-end' : 'flex-start',
      maxWidth: '75%',
      animation: 'fadeIn 0.7s ease',
      '@keyframes fadeIn': {
        from: { opacity: 0, transform: 'translateY(16px)' },
        to: { opacity: 1, transform: 'none' },
      },
    }}
    onContextMenu={(e) => {
      e.preventDefault();
      if (m.senderId === myAppUserId) setShowDeleteFor(m.id);
    }}
  >
    <Paper
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: 4,
        background: m.senderId === myAppUserId
          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
          : `linear-gradient(135deg, ${theme.palette.grey[200]} 0%, ${theme.palette.grey[100]} 100%)`,
        color: m.senderId === myAppUserId
          ? theme.palette.primary.contrastText
          : theme.palette.text.primary,
        boxShadow: theme.shadows[1],
        fontSize: '1.07rem',
        fontWeight: 500,
        border: `1px solid ${
          m.senderId === myAppUserId
            ? theme.palette.primary.dark
            : theme.palette.divider
        }`,
        transition: 'background 0.3s',
        wordBreak: 'break-word',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {m.content}
      </Typography>
    </Paper>

    {showDeleteFor === m.id && m.senderId === myAppUserId && (
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
          handleDelete(m.id);
          setShowDeleteFor(null);
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    )}
  </Box>
))}

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
              onChange={(e) => setMsgInput(e.target.value)}
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
                backgroundColor: theme.palette.success.main,   // WhatsApp green
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
