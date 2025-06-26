import { useEffect, useState } from "react"
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Avatar, Typography, TextField, InputAdornment, Button, IconButton, Grid, Menu, MenuItem, Chip, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TablePagination, Divider, CircularProgress, useTheme, alpha, } from "@mui/material"
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconEye, IconPencil, IconTrash, IconDots, IconSearch, IconPlus, IconAlertCircleFilled, IconSend, IconClock } from '@tabler/icons-react';
import axios from "axios";
import { url } from '../../../mainurl';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FirstPage, LastPage, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { hasPermission } from "../../../hasPermission";
import PermissionDenied from "../PermissionDenied";

const Tickets = () => {

    // AuthTokens

    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    const mode = JSON.parse(localStorage.getItem('mode'));
    let tokenStr = String(authTokens.access);
    const theme = useTheme();

    // Navigate

    const navigate = useNavigate();

    // Function to toggle the modal state

    const [modal, setModal] = useState({ add: false, view: false, edit: false, delete: false });

    const toggleModal = (type) => {
        setModal((prev) => ({ ...prev, [type]: !prev[type] }));
        setAnchorEl(null)
    };

    // Menu Toggle

    const [anchorEl, setAnchorEl] = useState(null)

    const handleMenuClick = (event, id) => {
        setAnchorEl(event.currentTarget)
        setSelectedId(id)
    }

    // Get Tickets

    const [Tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [onsearchText, setonsearchText] = useState("")
    const [selectedId, setSelectedId] = useState(null)

    const fetchTickets = () => {
        setLoading(true);
        axios
            .get(`${url}/auth/tickets/?search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
            })
            .then((res) => {
                setTickets(res.data.results);
                setNextPageUrl(res.data.next);
                setPrevPageUrl(res.data.previous);
                setTotalPages(Math.ceil(res.data.count / rowsPerPage));
                setLoading(false);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.clear();
                    navigate("/auth/login");
                } else {
                    const refresh = String(authTokens.refresh);
                    axios.post(`${url}/api/token/refresh/`, { refresh }).then((res) => {
                        localStorage.setItem("authTokens", JSON.stringify(res.data));
                        axios
                            .get(`${url}/auth/tickets/?search=${onsearchText}&page=${currentPage + 1}&page_size=${rowsPerPage}`, {
                                headers: {
                                    Authorization: `Bearer ${res.data.access}`,
                                },
                            })
                            .then((res) => {
                                setTickets(res.data.results);
                                setNextPageUrl(res.data.next);
                                setPrevPageUrl(res.data.previous);
                                setTotalPages(Math.ceil(res.data.count / rowsPerPage));
                                setLoading(false);
                            });
                    });
                }
            });
    };

    useEffect(() => {
        fetchTickets();
    }, [currentPage, rowsPerPage, onsearchText]);


    const handlePageChange = (page) => {
        setCurrentPage(page);
    };


    const resetForm = () => {
        setFormData([]);
        setEditData([]);
        setDeleteData([]);
        setsendData([])
        setselectedFile("");
        setPreview(null);
        setAnchorEl(null)
    };


    // File Upload

    const [selectedFile, setselectedFile] = useState("");
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setselectedFile(file);
            const imageUrl = URL.createObjectURL(file);
            setPreview(imageUrl);
        }
    };

    // Send Message

    const handleNavigateToTicketChat = (id) => {
        navigate(`/ticket_chat/${id}`);
    }

    const [tickedId, settickedId] = useState([])
    const [ticketData, setticketData] = useState([])

    const fetchTicketData = (id) => {
        axios
            .get(`${url}/auth/tickets/${id}/messages/`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            })
            .then((res) => {

                setticketData(res.data.messages);
            })
            .catch((error) => {
                toast.error(`${error.response.data.error || error.response.data.detail}`, {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                let refresh = String(authTokens.refresh);
                axios.post(`${url}/api/token/refresh/`, { refresh: refresh }).then((res) => {

                    localStorage.setItem("authTokens", JSON.stringify(res.data));

                    const new_headers = {
                        Authorization: `Bearer ${res.data.access}`,
                    };
                    axios
                        .get(`${url}/auth/tickets/${id}/messages/`, { headers: new_headers })
                        .then((res) => {

                            setticketData(res.data.messages);
                        });
                });
            });
    };

    const [sendData, setsendData] = useState([])

    const handleMessageSubmit = async (event) => {

        event.preventDefault();

        let submitData = {

            message: sendData.message,
            is_staff_reply: true

        }

        try {
            const response = await axios.post(`${url}/auth/tickets/${tickedId}/messages/`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            });
            toast.success(response.data.message, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });

            toggleModal('send')
            resetForm()
            fetchTickets()
        } catch (error) {
            toast.error(`${error.response.data.error || error.response.data.detail}`, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
        }
    };

    // Send Message

    const MenuProps = { PaperProps: { style: { maxHeight: 200, overflowY: 'auto' } } };

    const handleStatusChangeSubmit = async (event) => {

        event.preventDefault();

        let submitData = {

            status: editData.status,

        }

        try {
            const response = await axios.post(`${url}/auth/support/tickets/${tickedId}/status/`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            });
            toast.success(response.data.message, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });

            toggleModal('changestatus')
            resetForm()
            fetchTickets()
        } catch (error) {
            toast.error(`${error.response.data.error}`, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
        }
    };


    // Add Tickets

    const [formData, setFormData] = useState([])

    const handleSubmit = async (event) => {

        event.preventDefault();

        let submitData = {
            name: formData.menu,
            image: selectedFile
        }

        try {
            const response = await axios.post(`${url}/auth/tickets/`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: false,
            });
            toast.success("Tickets Added Successfully", {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });

            toggleModal('add')
            resetForm()
            fetchTickets()
        } catch (error) {
            toast.error(`${error.response.data.error}`, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
        }
    };

    //  Edit Tickets

    const [editData, setEditData] = useState([])


    const handleEdit = async (event) => {

        event.preventDefault();

        let submitData = {
            name: editData.menu,
            image: selectedFile || preview
        };

        try {
            const response = await axios.put(`${url}/auth/tickets/${selectedId}/`, submitData, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: false,
            });
            toast.success("Tickets Edited Successfully", {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
            toggleModal('edit');
            resetForm()
            fetchTickets()
        } catch (error) {
            toast.error(`${error.response.data.error}`, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
        }
    };


    // Delete Tickets

    const [deleteData, setDeleteData] = useState([])

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`${url}/auth/tickets/${selectedId}/`, {
                headers: {
                    Authorization: `Bearer ${tokenStr}`,
                    "Content-Type": "application/json",
                },
                withCredentials: false,
            });
            toast.success("Tickets Deleted Successfully", {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
            toggleModal('delete')
            if (Tickets.length === 1 && currentPage > 0) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchTickets();
            }
        } catch (error) {
            toast.error(`${error.response.data.error}`, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,

            });
        }
    };

    const hasAccess = hasPermission("View_Service_Main");

    if (!hasAccess) {
        return <PermissionDenied />;
    }

    return (
        <PageContainer title="Tickets" description="Tickets"  >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: "25px" }}>
                Tickets
            </Typography>
            <DashboardCard>
                <Grid container>
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                p: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: `1px solid ${theme.palette.divider}`, // only here
                            }}
                        >
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: "#364a63" }}>

                            </Typography>
                            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                <TextField
                                    placeholder="Search by Name"
                                    size="small"
                                    value={onsearchText}
                                    onChange={(e) => { setonsearchText(e.target.value), setCurrentPage(0) }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconSearch fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 1 },
                                    }}
                                />
                                {/* <Button
                                    variant="contained"
                                    startIcon={<IconPlus />}
                                    onClick={() => toggleModal("add")}
                                    sx={{ bgcolor: "#519380", "&:hover": { bgcolor: "#7DAA8D" }, borderRadius: 1, boxShadow: "none" }}
                                >
                                    Add
                                </Button> */}
                            </Box>
                        </Box>

                        <TableContainer sx={{ minHeight: '700px' }}>
                            <Table size="medium"
                                sx={{
                                    minWidth: { xs: 650, sm: 750 },
                                    borderCollapse: 'collapse',
                                    '& thead th': {
                                        backgroundColor: '#f5f5f5',
                                        border: "1",
                                        fontSize: "14px",
                                        fontWeight: 700,
                                    },
                                    '& td': {
                                        fontSize: "13px",
                                        fontWeight: 500,
                                    },
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">
                                            SN
                                        </TableCell>
                                        <TableCell align="center">
                                            Subject
                                        </TableCell>
                                        <TableCell align="center">
                                            Description
                                        </TableCell>
                                        <TableCell align="center">
                                            Related
                                        </TableCell>
                                        <TableCell align="center">
                                            Priority
                                        </TableCell>
                                        <TableCell align="center">
                                            Attachment
                                        </TableCell>
                                        <TableCell align="center">
                                            Status
                                        </TableCell>
                                        <TableCell align="center">
                                            Created At
                                        </TableCell>
                                        <TableCell align="center">
                                            Chat
                                        </TableCell>
                                        <TableCell align="right">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Box
                                                    display="flex"
                                                    justifyContent="center"
                                                    alignItems="center"
                                                    sx={{ height: "540px", fontWeight: "bolder", fontSize: "15px" }}
                                                >
                                                    <CircularProgress className="me-2" color="primary" size={25} /> Loading Details
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : Tickets && Tickets.length > 0 ? (
                                        Tickets.map((item, index) => (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                tabIndex={-1}
                                                key={item.id}
                                                sx={{
                                                    "& td, & th": { borderBottom: mode == 0 ? "1px solid #e0e0e0" : "1px solid rgb(85, 83, 83)" },
                                                    backgroundColor: mode === 0 ? (index % 2 ? "#f9f9f9" : "white") : (index % 2 ? "#2a2a2a" : "#1e1e1e"),
                                                }}
                                            >
                                                <TableCell align="center">
                                                    {currentPage * rowsPerPage + index + 1}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.subject}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.description}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.realated || "N/A"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.priority}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.attachment ? (
                                                        <Box
                                                            component="img"
                                                            src={item.attachment}
                                                            alt="Attachment Preview"
                                                            sx={{
                                                                width: 60,
                                                                height: 60,
                                                                objectFit: 'cover',
                                                                border: '1px solid #ddd',
                                                                borderRadius: 1,
                                                            }}
                                                        />
                                                    ) : (
                                                        "N/A"
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "N/A"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {new Date(item.updated_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => { handleNavigateToTicketChat(item.id) }}
                                                        sx={{
                                                            bgcolor: "#519380",
                                                            color: "#fff",
                                                            "&:hover": {
                                                                bgcolor: "#7DAA8D",
                                                            }
                                                        }}
                                                    ><IconSend /></Button>

                                                </TableCell>

                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuClick(e, item.id)}
                                                        sx={{
                                                            color: 'text.secondary', // or 'text.primary' if you want white
                                                            '&:hover': {
                                                                color: 'text.primary',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.08)', // subtle hover
                                                            },
                                                        }}
                                                    >
                                                        <IconDots fontSize="small" />
                                                    </IconButton>
                                                    {selectedId === item.id && (
                                                        <Menu
                                                            anchorEl={anchorEl}
                                                            open={Boolean(anchorEl)}
                                                            onClose={() => setSelectedId(null)}
                                                            anchorOrigin={{
                                                                vertical: 'bottom',
                                                                horizontal: 'right',
                                                            }}
                                                            transformOrigin={{
                                                                vertical: 'top',
                                                                horizontal: 'right',
                                                            }}
                                                            PaperProps={{ sx: { px: 1, } }}
                                                        >
                                                            {/* <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { setViewData(item); toggleModal("view") }}>
                                                                <IconEye fontSize="small" className="me-2" /> View
                                                            </MenuItem> */}
                                                            {/* <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { setEditData(item); toggleModal("edit") }}>
                                                                <IconPencil fontSize="small" className="me-2" /> Edit
                                                            </MenuItem> */}
                                                            {/* <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { setDeleteData(item); toggleModal("delete") }}>
                                                                <IconTrash fontSize="small" className="me-2" /> Delete
                                                            </MenuItem> */}
                                                            <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { settickedId(item.id); toggleModal("send") }}>
                                                                <IconSend fontSize="small" className="me-2" /> Send Message
                                                            </MenuItem>
                                                            <MenuItem sx={{ py: 1.7, px: 2 }} onClick={() => { settickedId(item.id); toggleModal("changestatus") }}>
                                                                <IconClock fontSize="small" className="me-2" /> Change Status
                                                            </MenuItem>
                                                        </Menu>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    No Data to Display
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                border: "1px solid #e0e0e0",
                                maxWidth: "220px",
                                borderRadius: 2,
                                marginTop: "20px",
                                marginLeft: "auto",
                                p: 0.5,
                                gap: 0.5,
                            }}
                        >
                            {currentPage > 1 && (
                                <IconButton onClick={() => handlePageChange(1)} aria-label="first page">
                                    <FirstPage />
                                </IconButton>
                            )}

                            {prevPageUrl && (
                                <IconButton
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    aria-label="previous page"
                                >
                                    <ChevronLeft />
                                </IconButton>
                            )}

                            <Typography
                                variant="body2"
                                sx={{
                                    minWidth: 30,
                                    textAlign: "center",
                                    fontWeight: "500",
                                    fontSize: "14px",
                                    padding: "8px",
                                    px: 1,
                                    color: theme.palette.text.primary,
                                }}
                            >
                                {currentPage + 1}
                            </Typography>

                            {nextPageUrl && (
                                <IconButton
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    aria-label="next page"
                                >
                                    <ChevronRight />
                                </IconButton>
                            )}

                            {currentPage !== totalPages - 1 && (
                                <IconButton
                                    onClick={() => handlePageChange(totalPages - 1)}
                                    aria-label="last page"
                                >
                                    <LastPage />
                                </IconButton>
                            )}
                        </Box>
                        {/* <Box sx={{ flexShrink: 0, ml: 2.5, mt: 3, display: "flex", alignItems: "center", gap: 1 }}>

                            {currentPage > 1 && (
                                <IconButton onClick={() => handlePageChange(1)} aria-label="first page">
                                    <Typography variant="paginationLabel" >First</Typography>
                                </IconButton>
                            )}

                            {prevPageUrl && (
                                <IconButton onClick={() => handlePageChange(currentPage - 1)} aria-label="previous page">
                                    <Typography variant="paginationLabel" >Prev</Typography>
                                </IconButton>
                            )}

                            <Typography
                                variant="paginationLabel"
                                sx={{ minWidth: 60, textAlign: "center", color: "black", fontWeight: "500", fontSize: "13px" }}>
                                {currentPage + 1}
                            </Typography>

                            {nextPageUrl && (
                                <IconButton onClick={() => handlePageChange(currentPage + 1)} aria-label="next page">
                                    <Typography variant="paginationLabel" >Next</Typography>
                                </IconButton>
                            )}

                            {currentPage !== totalPages - 1 && (
                                <IconButton onClick={() => handlePageChange(totalPages - 1)} aria-label="last page">
                                    <Typography variant="paginationLabel" >Last</Typography>
                                </IconButton>
                            )}
                        </Box> */}
                    </Grid>
                </Grid>
            </DashboardCard>

            {/* Send Message Modal */}

            <Dialog
                open={modal.send}
                onClose={() => toggleModal("send")}
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 0,
                        width: "600px",
                        maxHeight: "80vh",
                        display: "flex",
                        flexDirection: "column",
                    }
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: 'blur(4px)',
                        bgcolor: alpha(theme.palette.background.default, 0.8),
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: "1px solid #e5e9f2",
                        p: 2,
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                    }}
                >
                    Conversation
                </DialogTitle>

                {/* ✅ Chat Messages Scrollable Area */}

                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        px: 3,
                        py: 2,
                        backgroundColor: theme.palette.background.default,
                    }}
                >
                    {ticketData.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No messages yet.</Typography>
                    ) : (
                        ticketData.map((msg, index) => (
                            <Box
                                key={msg.id}
                                sx={{
                                    mb: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: msg.is_staff_reply ? "flex-start" : "flex-end",
                                }}
                            >
                                {/* ✅ Sender Name */}

                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: msg.is_staff_reply ? "#047857" : "#1e293b",
                                        fontWeight: 600,
                                        mb: 0.5,
                                    }}
                                >
                                    {msg.sender}
                                </Typography>

                                {/* ✅ Message Bubble */}

                                <Box
                                    sx={{
                                        maxWidth: "70%",
                                        bgcolor: msg.is_staff_reply ? "#d1fae5" : "#f1f5f9",
                                        color: "#333",
                                        px: 2,
                                        py: 1,
                                        borderRadius: 2,
                                        boxShadow: 1,
                                    }}
                                >
                                    <Typography variant="body2">{msg.message}</Typography>
                                </Box>

                                {/* ✅ Timestamp */}

                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {new Date(msg.created_at).toLocaleString()}
                                </Typography>
                            </Box>
                        ))
                    )}
                </Box>

                {/* ✅ Message Input & Actions */}

                <form onSubmit={handleMessageSubmit}>
                    <DialogContent sx={{ p: 2, borderTop: "1px solid #e5e9f2" }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={10}>
                                <TextField
                                    fullWidth
                                    name="message"
                                    value={sendData.message || ""}
                                    placeholder="Type your message..."
                                    onChange={(e) => setsendData({ ...sendData, message: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ bgcolor: "#519380", "&:hover": { bgcolor: "#7DAA8D" } }}
                                >
                                    <IconSend fontSize="medium" />
                                </Button>
                            </Grid>
                        </Grid>
                    </DialogContent>
                </form>
            </Dialog>


            {/* Change Status Modal */}

            <Dialog
                open={modal.changestatus}
                onClose={() => toggleModal("changestatus")}
                maxWidth="xl"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 0,
                        width: "50%",
                        maxWidth: "50%",
                        backdropFilter: 'blur(8px)',
                        boxShadow: 24
                    }
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: 'blur(4px)',
                        bgcolor: alpha(theme.palette.background.default, 0.8)
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600, color: theme.palette.text.primary, }}>
                    Status Change
                </DialogTitle>
                <form onSubmit={handleStatusChangeSubmit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>

                            <Grid item xs={12} md={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        onChange={(e) => setEditData((prev) => ({ ...prev, status: e.target.value }))}
                                        label="Type"
                                        MenuProps={MenuProps}
                                    >
                                        <MenuItem value="in_progress">In Progress </MenuItem>
                                        <MenuItem value="resolved ">Resolved </MenuItem>
                                        <MenuItem value="closed">Closed </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2", gap: 1 }}>
                        <Button
                            onClick={() => toggleModal("changestatus")}
                            variant="outlined"
                            sx={{
                                borderColor: "#e5e9f2",
                                color: "#364a63",
                                "&:hover": { borderColor: "#6e82a5", backgroundColor: "#f5f6fa" },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" sx={{ bgcolor: "#519380", "&:hover": { bgcolor: "#7DAA8D" } }}>
                            Submit
                        </Button>

                    </DialogActions>
                </form>
            </Dialog>

            {/* Add Modal */}

            <Dialog
                open={modal.add}
                onClose={() => toggleModal("add")}
                maxWidth="xl"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 0,
                        backdropFilter: 'blur(8px)',
                        boxShadow: 24
                    }
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: 'blur(4px)',
                        bgcolor: alpha(theme.palette.background.default, 0.8)
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600, color: theme.palette.text.primary, }}>
                    Setup Tickets
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12}>
                                <Box sx={{ p: 2, textAlign: "center" }}>
                                    <Avatar
                                        src={preview ? preview : ""}
                                        alt=""
                                        sx={{ width: 100, height: 100, margin: "0 auto" }}
                                    />
                                </Box>
                                <Box sx={{ p: 2, textAlign: "center" }}>
                                    <input
                                        accept="image/*"
                                        id="file-upload"
                                        type="file"
                                        style={{ display: "none" }}
                                        onChange={(e) => { handleFileChange(e) }}
                                    />
                                    <label htmlFor="file-upload">
                                        <Button variant="contained" component="span">
                                            Choose File
                                        </Button>
                                    </label>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="menu"
                                    label="Menu Name"
                                    type="text"
                                    placeholder="Enter Menu Name"
                                    onChange={(e) => { setFormData({ ...formData, menu: e.target.value }) }}
                                    sx={{ mt: 5 }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2", gap: 1 }}>
                        <Button
                            onClick={() => toggleModal("add")}
                            variant="outlined"
                            sx={{
                                borderColor: "#e5e9f2",
                                color: "#364a63",
                                "&:hover": { borderColor: "#6e82a5", backgroundColor: "#f5f6fa" },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" sx={{ bgcolor: "#519380", "&:hover": { bgcolor: "#7DAA8D" } }}>
                            Submit
                        </Button>

                    </DialogActions>
                </form>
            </Dialog>

            {/* Edit Modal */}

            <Dialog
                open={modal.edit}
                onClose={() => toggleModal("edit")}
                maxWidth="xl"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 0,
                        backdropFilter: 'blur(8px)',
                        boxShadow: 24
                    }
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: 'blur(4px)',
                        bgcolor: alpha(theme.palette.background.default, 0.8)
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: "#364a63", fontWeight: 600, color: theme.palette.text.primary, }}>
                    Edit Tickets
                </DialogTitle>
                <form onSubmit={handleEdit}>
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12}>
                                <Box sx={{ p: 2, textAlign: "center" }}>
                                    <Avatar
                                        src={preview ? preview : editData.image}
                                        alt=""
                                        sx={{ width: 100, height: 100, margin: "0 auto" }}
                                    />
                                </Box>
                                <Box sx={{ p: 2, textAlign: "center" }}>
                                    <input
                                        accept="image/*"
                                        id="file-upload"
                                        type="file"
                                        style={{ display: "none" }}
                                        onChange={(e) => { handleFileChange(e) }}
                                    />
                                    <label htmlFor="file-upload">
                                        <Button variant="contained" component="span">
                                            Choose File
                                        </Button>
                                    </label>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="menu"
                                    label="Menu Name"
                                    type="text"
                                    placeholder="Enter Menu Name"
                                    defaultValue={editData.name}
                                    onChange={(e) => { setEditData({ ...editData, menu: e.target.value }) }}
                                    sx={{ mt: 5 }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2", gap: 1 }}>
                        <Button
                            onClick={() => toggleModal("edit")}
                            variant="outlined"
                            sx={{
                                borderColor: "#e5e9f2",
                                color: "#364a63",
                                "&:hover": { borderColor: "#6e82a5", backgroundColor: "#f5f6fa" },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" sx={{ bgcolor: "#519380", "&:hover": { bgcolor: "#7DAA8D" } }}>
                            Submit
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* View Modal */}

            <Dialog
                open={modal.view}
                onClose={() => toggleModal("view")}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 0,
                        backdropFilter: 'blur(8px)',
                        boxShadow: 24
                    }
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: 'blur(4px)',
                        bgcolor: alpha(theme.palette.background.default, 0.8)
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, display: "flex", alignItems: "center", gap: 2, color: theme.palette.text.primary, }}>
                </DialogTitle>
                <DialogContent sx={{ p: 3, mt: 2 }}>
                    <Grid container spacing={3}>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2" }}>
                    <Button
                        onClick={() => toggleModal("view")}
                        variant="contained"
                        sx={{ bgcolor: "#7f54fb", "&:hover": { bgcolor: "#6a3ee8" } }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Modal */}

            <Dialog
                open={modal.delete}
                onClose={() => toggleModal("delete")}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 0,
                        backdropFilter: 'blur(8px)',
                        boxShadow: 24
                    }
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: 'blur(4px)',
                        bgcolor: alpha(theme.palette.background.default, 0.8)
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid #e5e9f2", p: 3, color: theme.palette.text.primary, }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Delete Tickets
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, p: 2, borderRadius: 1, mt: 2, color: theme.palette.text.primary, }}>
                        <IconAlertCircleFilled size={50} style={{ color: "red" }} />
                        <Typography variant="h6" sx={{ textAlign: "center", color: theme.palette.text.primary }}>
                            Are you sure you want to Delete the Tickets:{" "}
                            <Box component="span" sx={{ color: "red", fontWeight: 600 }}>
                                {deleteData.name}&nbsp;
                            </Box>
                            ?
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e9f2", gap: 1 }}>
                    <Button
                        onClick={() => toggleModal("delete")}
                        variant="outlined"
                        sx={{ borderColor: "#e5e9f2", color: "#ffff", bgcolor: "#3f7b69", "&:hover": { borderColor: "#6e82a5", bgcolor: "#369e7f" } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDelete()}
                        variant="contained"
                        sx={{ bgcolor: "#c33b3b", "&:hover": { bgcolor: "#ff0707" } }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer >
    );
};

export default Tickets;
