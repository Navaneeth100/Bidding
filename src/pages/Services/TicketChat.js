import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    Typography,
    Paper,
    useTheme,
    Avatar,
    Chip,
    ButtonGroup,
    alpha
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import axios from 'axios';
import { url } from '../../../mainurl';
import { useParams } from 'react-router-dom';
import { IconSend, IconUpload, IconMessageCircle2 } from '@tabler/icons-react';
import { toast } from 'react-toastify';


const TicketChat = () => {

    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    let tokenStr = String(authTokens.access);
    const theme = useTheme();
    const { id } = useParams();

    const [ticketList, setticketList] = useState([]);
    const [selectedticket, setSelectedticket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchTicketList();
    }, []);

    useEffect(() => {
        if (selectedticket) fetchMessages(selectedticket.id);
    }, [selectedticket]);

    const fetchTicketList = async () => {
        try {
            const res = await axios.get(`${url}/auth/tickets/`, {
                headers: { Authorization: `Bearer ${tokenStr}` },
            });
            setticketList(res.data.results || []);
        } catch (error) {
            console.error('Fetch ticket list error', error);
        }
    };

    const fetchMessages = async (ticketId) => {
        try {
            const res = await axios.get(`${url}/auth/tickets/${ticketId}/messages/`, {
                headers: { Authorization: `Bearer ${tokenStr}` },
            });
            setMessages(res.data.messages || []);
        } catch (error) {
            console.error('Fetch messages error', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const formData = new FormData();
            formData.append('message', newMessage);
            formData.append('is_staff_reply', true);
            if (selectedFile) formData.append('attachment', selectedFile);

            await axios.post(`${url}/auth/tickets/${selectedticket.id}/messages/`, formData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setNewMessage('');
            setSelectedFile(null);
            fetchMessages(selectedticket.id);
        } catch (error) {
            toast.error(error?.response?.data?.error || error?.response?.data?.detail);
        }
    };

    //  Filter 

    const [priorityFilter, setPriorityFilter] = useState('');

    const filteredTickets = priorityFilter ? ticketList.filter(item => item.priority?.toLowerCase() === priorityFilter.toLowerCase()) : ticketList;


    return (
        <PageContainer title="Tickets Conversations" description="Tickets Conversations">
            <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: "25px" }}
            >
                Tickets Conversations
            </Typography>

            <DashboardCard sx={{
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
            }}>
                <Grid container sx={{ height: '80vh', border: `1px solid ${theme.palette.divider}`, borderRadius: 1, overflow: 'hidden' }}>

                    {/* Left Sidebar - ticket List */}

                    <Grid item xs={3} sx={{ borderRight: `1px solid ${theme.palette.divider}`, overflowY: 'auto', p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" color={theme.palette.text.primary}>Tickets</Typography>

                            <ButtonGroup size="small" variant="outlined">
                                <Button
                                    onClick={() => setPriorityFilter('')}
                                    sx={{
                                        minWidth: 32,
                                        bgcolor: priorityFilter === '' ? theme.palette.text.primary : theme.palette.background.paper,
                                        color: priorityFilter === '' ? theme.palette.background.paper : theme.palette.text.secondary,
                                        '&:hover': { bgcolor: theme.palette.action.hover, color: theme.palette.text.primary },
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        p: 0.5,
                                        borderColor: 'divider',
                                    }}
                                >
                                    All
                                </Button>
                                <Button
                                    onClick={() => setPriorityFilter('urgent')}
                                    sx={{
                                        minWidth: 32,
                                        bgcolor: priorityFilter === 'urgent' ? theme.palette.error.main : theme.palette.background.paper,
                                        color: priorityFilter === 'urgent' ? theme.palette.error.contrastText : theme.palette.error.main,
                                        '&:hover': { bgcolor: theme.palette.error.dark, color: theme.palette.error.contrastText },
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        p: 0.5,
                                        borderColor: 'divider',
                                    }}
                                >
                                    U
                                </Button>
                                <Button
                                    onClick={() => setPriorityFilter('high')}
                                    sx={{
                                        minWidth: 32,
                                        bgcolor: priorityFilter === 'high' ? theme.palette.warning.main : theme.palette.background.paper,
                                        color: priorityFilter === 'high' ? theme.palette.warning.contrastText : theme.palette.warning.main,
                                        '&:hover': { bgcolor: theme.palette.warning.dark, color: theme.palette.warning.contrastText },
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        p: 0.5,
                                        borderColor: 'divider',
                                    }}
                                >
                                    H
                                </Button>
                                <Button
                                    onClick={() => setPriorityFilter('medium')}
                                    sx={{
                                        minWidth: 32,
                                        bgcolor: priorityFilter === 'medium' ? theme.palette.info.main : theme.palette.background.paper,
                                        color: priorityFilter === 'medium' ? theme.palette.info.contrastText : theme.palette.info.main,
                                        '&:hover': { bgcolor: theme.palette.info.dark, color: theme.palette.info.contrastText },
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        p: 0.5,
                                        borderColor: 'divider',
                                    }}
                                >
                                    M
                                </Button>
                                <Button
                                    onClick={() => setPriorityFilter('low')}
                                    sx={{
                                        minWidth: 32,
                                        bgcolor: priorityFilter === 'low' ? theme.palette.success.main : theme.palette.background.paper,
                                        color: priorityFilter === 'low' ? theme.palette.success.contrastText : theme.palette.success.main,
                                        '&:hover': { bgcolor: theme.palette.success.dark, color: theme.palette.success.contrastText },
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        p: 0.5
                                    }}
                                >
                                    L
                                </Button>
                            </ButtonGroup>
                        </Box>
                        {filteredTickets.length > 0 ? (
                            filteredTickets.map((item) => (
                                <Box
                                    key={item.id}
                                    onClick={() => setSelectedticket(item)}
                                    sx={{
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: selectedticket?.id === item.id ? alpha(theme.palette.primary.light, 0.1) : 'transparent',
                                        cursor: 'pointer',
                                        mb: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        '&:hover': { bgcolor: theme.palette.action.hover },
                                    }}
                                >
                                    {/* Left Side: Avatar + Text */}

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 30, height: 30, fontSize: 14 }}>
                                            {item.subject?.charAt(0).toUpperCase() || 'U'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                                {item.subject}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {item.description || 'No messages'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Right Side: Date + Priority (stacked vertically) */}

                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: theme.palette.text.secondary,
                                                whiteSpace: 'nowrap',
                                                fontSize: '11px',
                                            }}
                                        >
                                            {new Date(item.updated_at).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </Typography>

                                        {item.priority && (
                                            <Chip
                                                label={item.priority}
                                                size="small"
                                                sx={{
                                                    height: 16,
                                                    fontSize: '10px',
                                                    textTransform: 'capitalize',
                                                    bgcolor: item.priority === 'urgent' ? '#dc2626' : item.priority === 'high' ? '#f97316' : item.priority === 'medium' ? '#eab308' : item.priority === 'low' ? '#22c55e' : '#6b7280',
                                                    color: item.priority === 'medium' ? 'black' : 'white',
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            ))
                        ) : (

                            <Box sx={{ mt: 5, p: 2, textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    No tickets found for selected priority.
                                </Typography>
                            </Box>
                        )}
                    </Grid>


                    {/* Right Chat Section */}

                    <Grid item xs={9} sx={{ display: 'flex', flexDirection: 'column' }}>
                        {selectedticket ? (
                            <>
                                {/* Messages */}
                                <Box
                                    sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        p: 2,
                                        bgcolor: theme.palette.background.default,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: '450px',
                                        maxHeight: 'calc(100vh - 200px)',
                                        '&::-webkit-scrollbar': {
                                            display: 'none',
                                        },
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                    }}
                                >
                                    {messages.length === 0 ? (
                                        <Box sx={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            color: theme.palette.text.secondary
                                        }}>
                                            <Typography variant="h3" sx={{ mb: 1 }}>Welcome</Typography>
                                            <Typography variant="body1">No messages yet. Start the conversation now.</Typography>
                                        </Box>
                                    ) : (messages.map((msg) => (
                                        <Box
                                            key={msg.id}
                                            sx={{
                                                mb: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: msg.is_staff_reply ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            <Paper
                                                elevation={1}
                                                sx={{
                                                    maxWidth: '50%',
                                                    px: 2,
                                                    py: 1,
                                                    bgcolor: msg.is_staff_reply ? alpha(theme.palette.success.light, 0.2) : alpha(theme.palette.info.light, 0.2),
                                                    color: theme.palette.text.primary,
                                                }}
                                            >
                                                {msg.attachment && (
                                                    <Box sx={{ mb: 1 }}>
                                                        <img
                                                            src={msg.attachment}
                                                            alt="Attachment"
                                                            style={{ maxWidth: '100%', borderRadius: 6 }}
                                                        />
                                                    </Box>
                                                )}
                                                <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.message}</Typography>
                                            </Paper>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {new Date(msg.created_at).toLocaleString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                }).replace(',', '')}
                                            </Typography>
                                        </Box>
                                    ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </Box>

                                {/* File Preview */}

                                {selectedFile && (
                                    <Box sx={{ p: 1, pl: 2, bgcolor: theme.palette.background.paper }}>
                                        <Box sx={{ position: 'relative', width: 60, height: 60 }}>
                                            <img
                                                src={URL.createObjectURL(selectedFile)}
                                                alt="Preview"
                                                style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }}
                                            />
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: -6,
                                                    right: -6,
                                                    bgcolor: theme.palette.background.paper,
                                                    borderRadius: '50%',
                                                    boxShadow: 1,
                                                    cursor: 'pointer',
                                                    width: 20,
                                                    height: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 12,
                                                    color: theme.palette.text.primary,
                                                }}
                                                onClick={() => setSelectedFile(null)}
                                            >
                                                x
                                            </Box>
                                        </Box>
                                    </Box>
                                )}

                                {/* Message Input */}

                                <Box
                                    component="form"
                                    onSubmit={handleSubmit}
                                    sx={{
                                        p: 2,
                                        borderTop: `1px solid ${theme.palette.divider}`,
                                        bgcolor: theme.palette.background.paper,
                                        display: 'flex',
                                        gap: 1,
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        size="medium"
                                        sx={{
                                            bgcolor: theme.palette.action.hover,
                                            borderRadius: 2,
                                            "& .MuiOutlinedInput-root": {
                                                backgroundColor: theme.palette.action.hover,
                                                color: theme.palette.text.primary,
                                            },
                                            "& .MuiInputLabel-root": {
                                                color: theme.palette.text.secondary,
                                            },
                                        }}
                                    />

                                    <Button
                                        component="label"
                                        type="button"
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            bgcolor: theme.palette.primary.main,
                                            "&:hover": { bgcolor: theme.palette.primary.dark },
                                            borderRadius: 2,
                                        }}
                                    >
                                        <IconUpload fontSize="small" />
                                        <input type="file" hidden onChange={handleFileChange} />
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            bgcolor: theme.palette.success.main,
                                            "&:hover": { bgcolor: theme.palette.success.dark },
                                            borderRadius: 2,
                                        }}
                                    >
                                        <IconSend fontSize="small" />
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: theme.palette.text.secondary }}>
                                <IconMessageCircle2 size={50} stroke={1.5} color={theme.palette.primary.main} />
                                <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                                    Welcome to Ticket Chat
                                </Typography>

                                <Typography variant="body2" sx={{ maxWidth: 300, mt: 1 }}>
                                    Select a ticket to start a Chat
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                </Grid>
            </DashboardCard>
        </PageContainer >
    );
};

export default TicketChat;
