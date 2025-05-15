import React, { useState } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  InputBase, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useMediaQuery,
  useTheme,
  Divider
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Define the lime green color used in AppBar
const limeGreenColor = '#8bc34a';

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(255, 255, 255, 0.15)',  // Always use light mode style
  "&:hover": {
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Always use light mode style
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white", // Force white color
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "white", // Always white text
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    backgroundColor: "transparent !important", // Force transparent background
    color: "white !important", // Force white text
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

function Header({ onSearch, onChangeTab, activeTab, darkMode, onToggleDarkMode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuItemClick = (index) => {
    onChangeTab(index);
    setDrawerOpen(false);
  };

  const drawer = (
    <List sx={{ width: 240 }}>
      <ListItem sx={{ py: 2 }}>
        <LightbulbOutlinedIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="h6" component="div">
          SimpleNotes
        </Typography>
      </ListItem>
      <Divider />
      <ListItem disablePadding>
        <ListItemButton onClick={() => handleMenuItemClick(0)} selected={activeTab === 0}>
          <ListItemIcon>
            <LightbulbOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Notes" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton onClick={() => handleMenuItemClick(1)} selected={activeTab === 1}>
          <ListItemIcon>
            <ArchiveOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Archive" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemIcon>
            <LabelOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Labels" />
        </ListItemButton>
      </ListItem>
      <Divider sx={{ my: 1 }} />
      <ListItem disablePadding>
        <ListItemButton onClick={onToggleDarkMode}>
          <ListItemIcon>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </ListItemIcon>
          <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
        </ListItemButton>
      </ListItem>
    </List>
  );

  return (
    <>
      <AppBar 
        position="static" 
        elevation={4}
        sx={{ 
          backgroundColor: limeGreenColor, // Always use light theme color
          color: "#ffffff" // Keep text white
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <IconButton edge="start" color="inherit" aria-label="logo" sx={{ mr: 2, display: { xs: isMobile ? 'none' : 'flex', sm: 'flex' } }}>
            <LightbulbOutlinedIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ display: { xs: "none", sm: "block" } }}>
            SimpleNotes
          </Typography>
          <Search sx={{ 
            flexGrow: 1, 
            maxWidth: { xs: '100%', sm: 400 },
            backgroundColor: alpha("#ffffff", 0.15), // Always use light theme style
            "&:hover": {
              backgroundColor: alpha("#ffffff", 0.25), // Always use light theme style
            },
          }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              sx={{ color: "#ffffff" }} // Always keep text white
            />
          </Search>
          <IconButton color="inherit" onClick={onToggleDarkMode} sx={{ ml: 2 }}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Header; 