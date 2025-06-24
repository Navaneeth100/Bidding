import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, createTheme, styled, ThemeProvider } from '@mui/material/styles';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';

import {
  addDoc,
  collection,
  doc,
  endBefore,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../../firebase';

// Utility to get and apply theme mode
const getMode = () =>
  window.localStorage.getItem('themeMode') === 'dark' ? 'dark' : 'light';
const makeTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      secondary: { main: '#9c27b0' },
      background: {
        default: mode === 'dark' ? '#111' : '#f5f6fa',
        paper: mode === 'dark' ? '#1d1d1d' : '#fff',
      },
    },
    shape: { borderRadius: 12 },
  });

// Styled message bubble
const MessageCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'mine',
})(({ theme, mine }) => ({
  maxWidth: '75%',
  alignSelf: mine ? 'flex-end' : 'flex-start',
  background: mine
    ? alpha(theme.palette.primary.main, 0.15)
    : theme.palette.background.paper,
  boxShadow: mine ? theme.shadows[3] : theme.shadows[1],
  marginBottom: theme.spacing(1),
}));

export default function ChatPanelWithUserList({ adminFcmToken }) {
  // Theme
  const [mode, setMode] = useState(getMode);
  const theme = useMemo(() => makeTheme(mode), [mode]);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Chat state
  const [rooms, setRooms] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Refs for auto-scroll and pagination
  const bottomRef = useRef(null);
  const feedRef = useRef(null);

  // Listen for theme changes & anonymous auth
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const onStorage = () => setMode(getMode());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Load chat rooms
  useEffect(() => {
    const init = async () => {
      try {
        const snap = await getDocs(collection(db, 'Admin_chat'));
        const roomsList = snap.docs.map((d) => ({ id: d.id }));
        setRooms(roomsList);
        if (roomsList.length) setChatId(roomsList[0].id);
      } finally {
        setLoadingRooms(false);
      }
    };
    init();
  }, []);

  // Load messages & subscribe
  useEffect(() => {
    if (!chatId) return;
    let unsubscribe;
    (async () => {
      // Initial load
      const initQ = query(
        collection(db, 'Admin_chat', chatId, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      const initSnap = await getDocs(initQ);
      setMsgs(initSnap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse());

      // Real-time updates
      const realTimeQ = query(
        collection(db, 'Admin_chat', chatId, 'messages'),
        orderBy('timestamp')
      );
      unsubscribe = onSnapshot(realTimeQ, (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMsgs((prev) => {
          const existing = new Set(prev.map((m) => m.id));
          return [...prev, ...data.filter((m) => !existing.has(m.id))];
        });
        // Mark read
        data.forEach(async (m) => {
          if (m.receiverId === adminFcmToken && m.status === 'delivered') {
            await updateDoc(
              doc(db, 'Admin_chat', chatId, 'messages', m.id),
              { status: 'read' }
            );
          }
        });
      });
    })();
    return () => unsubscribe && unsubscribe();
  }, [chatId, adminFcmToken]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Pagination on scroll top
  const loadMore = useCallback(async () => {
    if (!chatId || !hasMore || loadingMore || !msgs.length) return;
    setLoadingMore(true);
    const oldest = msgs[0].timestamp;
    const olderQ = query(
      collection(db, 'Admin_chat', chatId, 'messages'),
      orderBy('timestamp', 'desc'),
      endBefore(oldest),
      limit(20)
    );
    const olderSnap = await getDocs(olderQ);
    const olderMsgs = olderSnap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
    if (olderMsgs.length < 20) setHasMore(false);
    setMsgs((prev) => [...olderMsgs, ...prev]);
    // Maintain scroll position
    if (feedRef.current && olderMsgs.length) {
      feedRef.current.scrollTop = olderMsgs.length * 60;
    }
    setLoadingMore(false);
  }, [chatId, hasMore, loadingMore, msgs]);

  const handleScroll = (e) => {
    if (e.currentTarget.scrollTop === 0) loadMore();
  };

  // Send message
  const send = useCallback(async () => {
    if (!text.trim() || !chatId) return;
    const msg = {
      text: text.trim(),
      senderId: 'customer',
      receiverId: 'admin',
      timestamp: serverTimestamp(),
      status: 'sent',
    };
    const docRef = await addDoc(
      collection(db, 'Admin_chat', chatId, 'messages'),
      msg
    );
    await updateDoc(doc(db, 'Admin_chat', chatId), {
      lastMessage: { text: msg.text, senderId: msg.senderId, timestamp: serverTimestamp() },
      updatedAt: serverTimestamp(),
    });
    setText('');
    setTimeout(() => updateDoc(docRef, { status: 'delivered' }), 400);
  }, [chatId, text]);

  // UI Components
  const Sidebar = (
<Paper
  elevation={2}
  sx={{
    width: { xs: 240, sm: 280 },
    height: '92%',
    display: { xs: chatId && isMobile ? 'none' : 'flex', sm: 'flex' },
    flexDirection: 'column',
  }}
>
  <AppBar position="static" color="primary" sx={{ borderTopLeftRadius: 12 }}>
    <Toolbar variant="dense">
      <Typography variant="h6">Chats</Typography>
    </Toolbar>
  </AppBar>
  {loadingRooms ? (
    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  ) : (
    <List dense disablePadding sx={{ flex: 1, overflowY: 'auto' }}>
      {rooms.map((r) => (
        <ListItemButton
          key={r.id}
          selected={r.id === chatId}
          onClick={() => setChatId(r.id)}
          sx={{ py: 1.5, px: 2, marginTop:"0px" }}
        >
          <ListItemAvatar>
            <Avatar>{r.id.charAt(0).toUpperCase()}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={r.id}
            primaryTypographyProps={{ noWrap: true }}
          />
        </ListItemButton>
      ))}
    </List>
  )}
</Paper>


  );

  const Header = (
    <AppBar position="static" color="primary" elevation={0} sx={{ borderTopRightRadius: 12, borderTopLeftRadius: { xs: 0, sm: 12 }, pl: { xs: 1, sm: 2 } }}>
      <Toolbar variant="dense">
        {isMobile && <Button color="inherit" size="small" onClick={() => setChatId(null)} sx={{ minWidth: 0, mr: 1 }}>←</Button>}
        <Typography variant="subtitle1" noWrap>{chatId || '—'}</Typography>
      </Toolbar>
    </AppBar>
  );

  const MessageFeed = (
    <Box ref={feedRef} onScroll={handleScroll} sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', p: 2 }}>
      {loadingMore && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>}
      {msgs.map((m) => (
        <MessageCard key={m.id} mine={m.senderId === 'customer'}>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2">{m.text}</Typography>
            <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
              <Typography variant="caption">{new Date(m.timestamp?.seconds * 1000 || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
              {m.senderId === 'customer' && (m.status === 'read' ? <DoneAllOutlinedIcon fontSize="inherit" /> : m.status === 'delivered' ? <DoneAllOutlinedIcon fontSize="inherit" sx={{ opacity: 0.5 }} /> : <DoneOutlinedIcon fontSize="inherit" sx={{ opacity: 0.6 }} />)}
            </Box>
          </Box>
        </MessageCard>
      ))}
      <div ref={bottomRef} />
    </Box>
  );

  const Composer = (
    <Paper elevation={3} sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 1.5 }, borderBottomRightRadius: 12, borderBottomLeftRadius: { xs: 0, sm: 12 } }}>
      <TextField
        fullWidth
        placeholder="Message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Tooltip title="Emoji picker coming soon"><IconButton size="small"><InsertEmoticonIcon /></IconButton></Tooltip>
            </InputAdornment>
          ),
          endAdornment: <>
            <InputAdornment position="end"><Tooltip title="Attach file"><IconButton size="small"><AttachFileIcon /></IconButton></Tooltip></InputAdornment>
            <InputAdornment position="end"><Tooltip title="Send"><IconButton color="primary" onClick={send}><SendRoundedIcon /></IconButton></Tooltip></InputAdornment>
          </>,
        }}
      />
    </Paper>
  );

  return (
 <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          bgcolor: theme.palette.background.default,
          p: { xs: 0, sm: 1 },
          gap: 1,
        }}
      >
        {Sidebar}

        {chatId ? (
          <Paper
            elevation={2}
            sx={{
              flexGrow: 1,
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              width: '100%',
              height: '92%',
              borderRadius: 2,
            }}
          >
            {Header}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1 }}>
                {MessageFeed}
              </Box>
              <Box
                sx={{
                  position: 'sticky',
                  bottom: 0,
                  bgcolor: 'background.paper',
                  borderTop: theme => `1px solid ${theme.palette.divider}`,
                  p: 1,
                }}
              >
                {Composer}
              </Box>
            </Box>
          </Paper>
        ) : (
          <Paper
            elevation={2}
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              width: '100%',
              height: '92%',
              borderRadius: 2,
              color: 'text.secondary',
            }}
          >
            {loadingRooms ? (
              <CircularProgress />
            ) : (
              <>
                <ChatBubbleOutlineIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6">
                  Bid app chat feature
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Select a chat on the left to get started.
                </Typography>
              </>
            )}
          </Paper>
        )}
      </Box>
    </ThemeProvider>

  );
}
