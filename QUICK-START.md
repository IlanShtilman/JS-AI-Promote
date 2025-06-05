# 🚀 Quick Start Guide

## For Code Review - One Command Setup

### Prerequisites Check
```bash
node --version  # Should be v18.20.4
npm --version   # Should be 8.0.0+
```

### Install & Verify
```bash
npm ci
```

**Optional - If you want to verify everything:**
```bash
npm run verify      # Check environment setup
npm run check-deps  # Check for dependency issues
```

### Start Application
```bash
npm run dev
```

### Access Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

### To Stop
Press `Ctrl+C` in terminal

## Troubleshooting
If something doesn't work:
```bash
npm run verify     # Checks Node.js, Java, dependencies
```

---

**That's it!** ✅ Both frontend and backend will start automatically with color-coded logs. 