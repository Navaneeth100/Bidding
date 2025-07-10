import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "@mui/material";
import OngoingOrder from './OngoingOrder';
import Order from './Order';
import CompletedOrders from './CompletedOrder';
import CancelledOrders from './CancelledOrders';
import PendingOrders from "./PendingOrders";
function CompletedPage() {
  return <div>Completed Page Content</div>;
}
function CancelledPage() {
  return <div>Cancelled Page Content</div>;
}

// Color codes for each tab
const PAGES = [
  { label: "Ongoing", color: "#facc15", component: <OngoingOrder /> },      // Yellow-400
  { label: "Pending", color: "#f97316", component: <PendingOrders /> },     // Orange-500
  { label: "Active", color: "#22c55e", component: <Order /> },              // Green-500
  { label: "Cancelled", color: "#ef4444", component: <CancelledOrders /> }, // Red-500
  { label: "Completed", color: "#3b82f6", component: <CompletedOrders /> }, // Blue-500
];


const TAB_INDEX_KEY = "simpleTabsOnly.activeTabIndex";

export default function SimpleTabsOnly() {
  const [tabIndex, setTabIndex] = useState(() => {
    const saved = window.localStorage.getItem(TAB_INDEX_KEY);
    return saved !== null ? Number(saved) : 0;
  });

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
    window.localStorage.setItem(TAB_INDEX_KEY, newValue);
  };

  // If PAGES changes, avoid index overflow
  useEffect(() => {
    if (tabIndex >= PAGES.length) {
      setTabIndex(0);
      window.localStorage.setItem(TAB_INDEX_KEY, 0);
    }
  }, [tabIndex]);

  return (
    <>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons={false}
        TabIndicatorProps={{
          style: {
            height: 4,
            borderRadius: 4,
            background: PAGES[tabIndex].color, // Indicator matches selected tab
            transition: "background 0.2s"
          }
        }}
        sx={{
          mb: 2,
          ".MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: 16,
            minHeight: 44,
            letterSpacing: 0.4,
            px: 2,
            color: "#64748b", // Muted text
            "&.Mui-selected": {
              color: PAGES[tabIndex].color, // Selected tab color
            },
          },
        }}
      >
        {PAGES.map((tab, i) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>
      <div>
        {PAGES[tabIndex].component}
      </div>
    </>
  );
}
