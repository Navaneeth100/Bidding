"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
  Menu,
  MenuItem,
  Badge,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Container,
  Grid,
  useTheme,
} from "@mui/material"
import { alpha, styled, ThemeProvider } from "@mui/material/styles"
import SendRoundedIcon from "@mui/icons-material/SendRounded"
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined"
import DoneOutlinedIcon from "@mui/icons-material/DoneOutlined"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import DeleteIcon from "@mui/icons-material/Delete"
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline"
import SearchIcon from "@mui/icons-material/Search"
import PersonIcon from "@mui/icons-material/Person"
import MenuIcon from "@mui/icons-material/Menu"
import SettingsIcon from "@mui/icons-material/Settings"
import NotificationsIcon from "@mui/icons-material/Notifications"
import OnlineIcon from "@mui/icons-material/FiberManualRecord"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import EmojiPicker from "emoji-picker-react"

// -----------------------------------------------------------------------------
// Theme helpers
// -----------------------------------------------------------------------------
const mode = JSON.parse(localStorage.getItem("mode") || '"light"')

// -----------------------------------------------------------------------------
// Styled components
// -----------------------------------------------------------------------------
const MessageCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "mine",
})(({ theme, mine }) => ({
  maxWidth: "75%",
  alignSelf: mine ? "flex-end" : "flex-start",
  background: mine
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(
        theme.palette.primary.main,
        0.25,
      )} 100%)`
    : theme.palette.background.paper,
  boxShadow: mine ? theme.shadows[3] : theme.shadows[1],
  marginBottom: theme.spacing(1),
  position: "relative",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[4],
  },
}))

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": { transform: "scale(.8)", opacity: 1 },
    "100%": { transform: "scale(2.4)", opacity: 0 },
  },
}))

const AdminHeader = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: theme.shadows[4],
}))

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export default function ChatPanelWithUserList({ adminFcmToken }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // ---------------------------------------------------------------------------
  // Chat state ----------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const [rooms, setRooms] = useState([])
  const [chatId, setChatId] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState("")
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRooms, setFilteredRooms] = useState([])

  // ---------------------------------------------------------------------------
  // UI state ------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [lastMsgCount, setLastMsgCount] = useState(0)

  // ---------------------------------------------------------------------------
  // Refs ----------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const bottomRef = useRef(null)
  const feedRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const scrollTimer = useRef(null)
  const textareaRef = useRef(null) // NEW: for auto‑focus

  // ---------------------------------------------------------------------------
  // Mock data for demo --------------------------------------------------------
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setTimeout(() => {
      const mockRooms = [
        {
          id: "john-doe",
          name: "John Doe",
          lastMessage: {
            text: "Hello, I need help with my order",
            senderId: "john-doe",
            timestamp: new Date(),
          },
          unreadCount: 2,
          isOnline: true,
        },
        {
          id: "jane-smith",
          name: "Jane Smith",
          lastMessage: {
            text: "Thank you for your assistance",
            senderId: "admin",
            timestamp: new Date(),
          },
          unreadCount: 0,
          isOnline: false,
        },
         {
          id: "jane-smith",
          name: "Jane Smith",
          lastMessage: {
            text: "Thank you for your assistance",
            senderId: "admin",
            timestamp: new Date(),
          },
          unreadCount: 0,
          isOnline: false,
        },
         {
          id: "jane-smith",
          name: "Jane Smith",
          lastMessage: {
            text: "Thank you for your assistance",
            senderId: "admin",
            timestamp: new Date(),
          },
          unreadCount: 0,
          isOnline: false,
        },
         {
          id: "jane-smith",
          name: "Jane Smith",
          lastMessage: {
            text: "Thank you for your assistance",
            senderId: "admin",
            timestamp: new Date(),
          },
          unreadCount: 0,
          isOnline: false,
        },
         {
          id: "jane-smith",
          name: "Jane Smith",
          lastMessage: {
            text: "Thank you for your assistance",
            senderId: "admin",
            timestamp: new Date(),
          },
          unreadCount: 0,
          isOnline: false,
        },
         {
          id: "jane-smith",
          name: "Jane Smith",
          lastMessage: {
            text: "Thank you for your assistance",
            senderId: "admin",
            timestamp: new Date(),
          },
          unreadCount: 0,
          isOnline: false,
        },
         {
          id: "jane-smith",
          name: "Jane Smith",
          lastMessage: {
            text: "Thank you for your assistance",
            senderId: "admin",
            timestamp: new Date(),
          },
          unreadCount: 0,
          isOnline: false,
        }, {
          id: "jane-smith",
          name: "Jane Smith",
          lastMessage: {
            text: "Thank you for your assistance",
            senderId: "admin",
            timestamp: new Date(),
          },
          unreadCount: 0,
          isOnline: false,
        },
         {
          id: "jane-smith",
          name: "Jane Smith",
          lastMessage: {
            text: "Thank you for your assistance",
            senderId: "admin",
            timestamp: new Date(),
          },
          unreadCount: 0,
          isOnline: false,
        },
        {
          id: "mike-johnson",
          name: "Mike Johnson",
          lastMessage: {
            text: "Is there any update on my request?",
            senderId: "mike-johnson",
            timestamp: new Date(),
          },
          unreadCount: 1,
          isOnline: true,
        },
        {
          id: "sarah-wilson",
          name: "Sarah Wilson",
          lastMessage: {
            text: "Can you help me with billing?",
            senderId: "sarah-wilson",
            timestamp: new Date(),
          },
          unreadCount: 3,
          isOnline: true,
        },
        {
          id: "david-brown",
          name: "David Brown",
          lastMessage: {
            text: "Product delivery status?",
            senderId: "david-brown",
            timestamp: new Date(),
          },
          unreadCount: 0,
          isOnline: false,
        },
      ]
      setRooms(mockRooms)
      setFilteredRooms(mockRooms)
      setLoadingRooms(false)
    }, 1000)
  }, [])

  useEffect(() => {
    if (chatId) {
      const mockMessages = [
        {
          id: "1",
          text: "Hello! How can I help you today?",
          senderId: "admin",
          receiverId: chatId,
          timestamp: new Date(Date.now() - 3600000),
          status: "read",
        },
        {
          id: "2",
          text: "I have a question about my recent order",
          senderId: chatId,
          receiverId: "admin",
          timestamp: new Date(Date.now() - 3000000),
          status: "read",
        },
        {
          id: "3",
          text: "What would you like to know? I'm here to assist you with any concerns.",
          senderId: "admin",
          receiverId: chatId,
          timestamp: new Date(Date.now() - 2400000),
          status: "delivered",
        },
        {
          id: "4",
          text: "My order was supposed to arrive yesterday but I haven't received it yet.",
          senderId: chatId,
          receiverId: "admin",
          timestamp: new Date(Date.now() - 1800000),
          status: "read",
        },
        {
          id: "5",
          text: "Let me check your order status for you. Can you please provide your order number?",
          senderId: "admin",
          receiverId: chatId,
          timestamp: new Date(Date.now() - 1200000),
          status: "read",
        },
      ]
      setMsgs(mockMessages)
      setLastMsgCount(mockMessages.length)
    }
  }, [chatId])

  // ---------------------------------------------------------------------------
  // Filtering & search --------------------------------------------------------
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredRooms(
        rooms.filter(
          (room) =>
            room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.lastMessage?.text.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } else {
      setFilteredRooms(rooms)
    }
  }, [searchQuery, rooms])

  // ---------------------------------------------------------------------------
  // Scroll helpers ------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const scrollToBottom = useCallback(
    (smooth = true) => {
      bottomRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      })
    },
    [bottomRef],
  )

  const handleScroll = useCallback(() => {
    const el = feedRef.current
    if (!el) return

    const { scrollTop, scrollHeight, clientHeight } = el
    const atBottom = scrollHeight - scrollTop - clientHeight < 48
    const atTop = scrollTop < 120

    setShowScrollToBottom(!atBottom && msgs.length > 0)

    // Debounce "user is scrolling"
    setIsUserScrolling(true)
    if (scrollTimer.current) clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => setIsUserScrolling(false), 150)

    // Load more when near top
    if (atTop && !loadingMore && hasMore) {
      handleLoadMore()
    }
  }, [msgs.length, loadingMore, hasMore])

  useEffect(() => {
    if (msgs.length <= lastMsgCount) return
    const last = msgs[msgs.length - 1]
    const isMine = last?.senderId === "admin"

    if (isMine || !isUserScrolling) {
      requestAnimationFrame(() => scrollToBottom(true))
    }
    setLastMsgCount(msgs.length)
  }, [msgs, lastMsgCount, isUserScrolling, scrollToBottom])

  // Jump to bottom when chat changes
  useEffect(() => {
    if (msgs.length) scrollToBottom(false)
  }, [chatId])

  useEffect(() => () => scrollTimer.current && clearTimeout(scrollTimer.current), [])

  // ---------------------------------------------------------------------------
  // Load more messages --------------------------------------------------------
  // ---------------------------------------------------------------------------
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)

    setTimeout(() => {
      const olderMessages = [
        {
          id: `old-${Date.now()}`,
          text: "This is an older message loaded from history",
          senderId: chatId,
          receiverId: "admin",
          timestamp: new Date(Date.now() - 7200000),
          status: "read",
        },
        {
          id: `old-${Date.now() + 1}`,
          text: "Another older message for context",
          senderId: "admin",
          receiverId: chatId,
          timestamp: new Date(Date.now() - 7800000),
          status: "read",
        },
      ]
      setMsgs((prev) => [...olderMessages, ...prev])
      setLoadingMore(false)
      if (msgs.length > 15) setHasMore(false)
    }, 1000)
  }, [loadingMore, hasMore, chatId, msgs.length])

  // ---------------------------------------------------------------------------
  // Emoji handling ------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  // ---------------------------------------------------------------------------
  // Message context menu / delete --------------------------------------------
  // ---------------------------------------------------------------------------
  const handleMessageMenu = (event, message) => {
    if (message.senderId === "admin") {
      setMessageMenuAnchor(event.currentTarget)
      setSelectedMessage(message)
    }
  }
  const handleCloseMessageMenu = () => {
    setMessageMenuAnchor(null)
    setSelectedMessage(null)
  }
  const handleDeleteMessage = () => {
    setDeleteDialogOpen(true)
    handleCloseMessageMenu()
  }
  const confirmDeleteMessage = () => {
    if (selectedMessage) {
      setMsgs((prev) => prev.filter((msg) => msg.id !== selectedMessage.id))
      setDeleteDialogOpen(false)
      setSelectedMessage(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Send message --------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const send = useCallback(() => {
    if (!text.trim() || !chatId) return

    const newMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      senderId: "admin",
      receiverId: chatId,
      timestamp: new Date(),
      status: "sent",
    }
    setMsgs((prev) => [...prev, newMessage])
    setText("")

    // Simulate status updates
    setTimeout(() => {
      setMsgs((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)
    setTimeout(() => {
      setMsgs((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "read" } : msg)))
    }, 3000)
  }, [chatId, text])

  // ---------------------------------------------------------------------------
  // Helpers -------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  const currentUser = rooms.find((room) => room.id === chatId)

  // Auto‑focus composer when chat changes
  useEffect(() => {
    if (chatId) textareaRef.current?.focus()
  }, [chatId])

  // ---------------------------------------------------------------------------
  // Render --------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: theme.palette.background.default }}>
        {/* ------------------------------------------------------------------- */}
        {/* Header                                                              */}
        {/* ------------------------------------------------------------------- */}
        <AdminHeader position="static" elevation={0}>
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
              <ChatBubbleOutlineIcon sx={{ mr: 2, fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Admin Chat Panel
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton color="inherit">
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AdminHeader>

        {/* ------------------------------------------------------------------- */}
        {/* Main grid                                                           */}
        {/* ------------------------------------------------------------------- */}
        <Container maxWidth={false} sx={{ flex: 1, p: { xs: 1, md: 2 }, display: "flex", gap: 2 }}>
          <Grid container spacing={2} sx={{ height: "100%" }}>
            {/* --------------------------------------------------------------- */}
            {/* Sidebar                                                        */}
            {/* --------------------------------------------------------------- */}
<Grid item xs={12} md={4} lg={3} sx={{ height: "60%" }}>

              <Paper
                elevation={3}
                sx={{
                  height: "100%",
                  display: { xs: chatId && isMobile ? "none" : "flex", md: "flex" },
                  flexDirection: "column",
                  borderRadius: 2,
                }}
              >
                {/* Sidebar header */}
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Conversations
                    </Typography>
                    <Chip label={`${filteredRooms.length} active`} size="small" color="primary" variant="outlined" />
                  </Box>
                  {/* Search */}
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Box>

                {/* Chat list */}
                {loadingRooms ? (
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List dense disablePadding sx={{ flex: 1, overflowY: "auto" }}>
                    {filteredRooms.map((room) => (
                      <ListItemButton
                        key={room.id}
                        selected={room.id === chatId}
                        onClick={() => {
                          setChatId(room.id)
                          if (isMobile) setSidebarOpen(false)
                        }}
                        sx={{
                          py: 2,
                          px: 2,
                          borderRadius: 2,
                          mx: 1,
                          my: 0.5,
                          "&.Mui-selected": {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <StyledBadge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            variant="dot"
                            invisible={!room.isOnline}
                          >
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                              {room.name.charAt(0).toUpperCase()}
                            </Avatar>
                          </StyledBadge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="subtitle2" noWrap sx={{ flexGrow: 1 }}>
                                {room.name}
                              </Typography>
                              {!!room.unreadCount && (
                                <Badge
                                  badgeContent={room.unreadCount}
                                  color="error"
                                  sx={{ "& .MuiBadge-badge": { fontSize: "0.7rem" } }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {room.lastMessage?.text || "No messages yet"}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            {/* --------------------------------------------------------------- */}
            {/* Chat area                                                       */}
            {/* --------------------------------------------------------------- */}
           <Grid item xs={12} md={8} lg={9} sx={{ height: "60%" }}>

              {chatId ? (
                <Paper
                  elevation={3}
                  sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 2, overflow: "hidden" }}
                >
                  {/* Chat header */}
                  <AppBar position="static" color="primary" elevation={0} sx={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                    <Toolbar>
                      {isMobile && (
                        <IconButton color="inherit" onClick={() => setChatId(null)} sx={{ mr: 1 }}>
                          <MenuIcon />
                        </IconButton>
                      )}
                      <Avatar sx={{ mr: 2, bgcolor: alpha(theme.palette.common.white, 0.2) }}>
                        {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" noWrap>
                          {currentUser?.name || chatId}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <OnlineIcon
                            sx={{ fontSize: 12, color: currentUser?.isOnline ? "#44b700" : "rgba(255,255,255,0.5)" }}
                          />
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {currentUser?.isOnline ? "Online" : "Offline"}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton color="inherit">
                        <MoreVertIcon />
                      </IconButton>
                    </Toolbar>
                  </AppBar>

                  {/* issuesss feed */}
                  <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
                    <Box
                      ref={feedRef}
                      onScroll={handleScroll}
                      sx={{
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        p: 2,
                        height: "100%",
                        minHeight: 0,
                        bgcolor: alpha(theme.palette.background.default, 0.3),
                        scrollBehavior: "smooth",
                        "&::-webkit-scrollbar": { width: 6 },
                        "&::-webkit-scrollbar-thumb": {
                          background: alpha(theme.palette.text.primary, 0.25),
                          borderRadius: 3,
                        },
                      }}
                    >
                      {loadingMore && (
                        <Box
                          sx={{
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                            display: "flex",
                            justifyContent: "center",
                            py: 2,
                            bgcolor: alpha(theme.palette.background.default, 0.8),
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          <CircularProgress size={24} />
                        </Box>
                      )}

                      {msgs.map((msg) => (
                        <MessageCard
                          key={msg.id}
                          mine={msg.senderId === "admin"}
                          onClick={(e) => handleMessageMenu(e, msg)}
                          sx={{ cursor: msg.senderId === "admin" ? "pointer" : "default" }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                              {msg.text}
                            </Typography>
                            <Box sx={{ mt: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </Typography>
                              {msg.senderId === "admin" && (
                                <>
                                  {msg.status === "read" ? (
                                    <DoneAllOutlinedIcon fontSize="inherit" sx={{ color: theme.palette.primary.main }} />
                                  ) : msg.status === "delivered" ? (
                                    <DoneAllOutlinedIcon fontSize="inherit" sx={{ opacity: 0.5 }} />
                                  ) : (
                                    <DoneOutlinedIcon fontSize="inherit" sx={{ opacity: 0.6 }} />
                                  )}
                                </>
                              )}
                            </Box>
                          </Box>
                        </MessageCard>
                      ))}

                      <div ref={bottomRef} />
                    </Box>

                    {/* Scroll‑to‑bottom FAB */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 16,
                        right: 16,
                        zIndex: 2,
                        pointerEvents: showScrollToBottom ? "auto" : "none",
                        opacity: showScrollToBottom ? 1 : 0,
                        transition: "opacity 0.25s ease",
                      }}
                    >
                      <IconButton
                        onClick={() => scrollToBottom(true)}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          boxShadow: 3,
                          "&:hover": { bgcolor: theme.palette.primary.dark },
                        }}
                        size="small"
                      >
                        <KeyboardArrowDownIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* ---------------------------------------------------------------- */}
                  {/* Composer                                                         */}
                  {/* ---------------------------------------------------------------- */}
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      position: "relative",
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                    }}
                  >
                    {showEmojiPicker && (
                      <Box ref={emojiPickerRef} sx={{ position: "absolute", bottom: "100%", left: 16, zIndex: 1000, mb: 1 }}>
                        <EmojiPicker onEmojiClick={handleEmojiClick} theme={mode} height={350} width={300} />
                      </Box>
                    )}

                    <TextField
                      fullWidth
                      multiline
                      inputRef={textareaRef}
                      minRows={1}
                      maxRows={6} // WhatsApp‑style cap
                      placeholder="Type your message..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        // Send on Enter, keep newline with Shift+Enter
                        if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
                          e.preventDefault()
                          send()
                        }
                        // Ctrl+Enter alternate send
                        if (e.key === "Enter" && e.ctrlKey) {
                          e.preventDefault()
                          send()
                        }
                        // Escape closes emoji picker
                        if (e.key === "Escape") setShowEmojiPicker(false)
                      }}
                      disabled={!chatId}
                      InputProps={{
                        inputProps: {
                          style: {
                            overflowY: "auto", // scrollbar inside textarea when needed
                            resize: "none",
                          },
                        },
                        startAdornment: (
                          <InputAdornment position="start">
                            <Tooltip title="Add emoji">
                              <IconButton
                                size="small"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                color={showEmojiPicker ? "primary" : "default"}
                              >
                                <InsertEmoticonIcon />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Attach file">
                              <IconButton size="small">
                                <AttachFileIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Send message">
                              <IconButton color="primary" onClick={send} disabled={!text.trim() || !chatId} sx={{ ml: 1 }}>
                                <SendRoundedIcon />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          alignItems: "flex-start",
                        },
                        "& .MuiInputAdornment-positionStart": { alignSelf: "flex-start", mt: 1 },
                        "& .MuiInputAdornment-positionEnd": { alignSelf: "flex-start", mt: 1 },
                      }}
                    />
                  </Paper>
                </Paper>
              ) : (
                // -------------------------------------------------------------
                // Empty state
                // -------------------------------------------------------------
                <Paper
                  elevation={2}
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    borderRadius: 2,
                    color: "text.secondary",
                    p: 4,
                  }}
                >
                  <ChatBubbleOutlineIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    Welcome to Admin Chat
                  </Typography>
                  <Typography variant="h6" align="center" sx={{ maxWidth: 500, mb: 3, opacity: 0.8 }}>
                    Select a conversation from the sidebar to start chatting with your users. Manage all your customer
                    communications in one place.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                    <Chip icon={<PersonIcon />} label={`${rooms.length} Active Users`} color="primary" />
                    <Chip icon={<ChatBubbleOutlineIcon />} label="Real‑time Messaging" color="secondary" />
                    <Chip icon={<NotificationsIcon />} label="Instant Notifications" color="success" />
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Container>

        {/* --------------------------------------------------------------------- */}
        {/* Mobile drawer                                                        */}
        {/* --------------------------------------------------------------------- */}
        {isMobile && (
          <Drawer
            anchor="left"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            PaperProps={{ sx: { width: "85%", maxWidth: 360 } }}
          >
            {/* You can place the same sidebar content here if desired */}
            <Box sx={{ height: "100%" }} />
          </Drawer>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* Message context menu                                                 */}
        {/* --------------------------------------------------------------------- */}
        <Menu
          anchorEl={messageMenuAnchor}
          open={Boolean(messageMenuAnchor)}
          onClose={handleCloseMessageMenu}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleDeleteMessage}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete Message
          </MenuItem>
        </Menu>

        {/* --------------------------------------------------------------------- */}
        {/* Delete confirmation                                                  */}
        {/* --------------------------------------------------------------------- */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Delete Message</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this message? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDeleteMessage} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Click‑outside overlay for emoji picker */}
        {showEmojiPicker && (
          <Box
            sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
            onClick={() => setShowEmojiPicker(false)}
          />
        )}
      </Box>
    </ThemeProvider>
  )
}
