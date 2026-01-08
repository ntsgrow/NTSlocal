# NTSlocal

NTSlocal is a lightweight, fast, and clean local Wi-Fi file sharing server built with Node.js.  
It allows devices connected to the same network to upload and send files directly through a web browser without using the internet, cloud services, or third-party apps.

The project is designed to be simple, classic, and practical for real-world local file transfers.

---

## What is NTSlocal?

NTSlocal creates a local web server on your computer.  
Any device connected to the same Wi-Fi network can open the server in a browser and upload files directly to the host system.

No login, no account, no internet, no external services.

---

## Key Features

- Local Wi-Fi based file sharing
- Supports **all file types** (no restrictions)
- Drag & drop file upload
- Multiple file upload at once
- Real-time upload progress and speed display
- Classic dark UI (black, gray, minimal design)
- Clean and readable modern fonts
- Connected users list (IP based)
- Upload history page
- QR code auto generated for quick access
- Automatic duplicate file renaming
- Desktop activity logging (`data.txt`)
- Continuous connection tracking
- Mobile and desktop browser support
- Single file server (`run.js`)
- No frameworks, no databases
- Runs fully offline

---

## How It Works

1. The server runs on a computer connected to Wi-Fi
2. It opens a local web interface
3. Other devices on the same network access it via browser
4. Files are uploaded and saved locally
5. User connections and actions are logged continuously

---

## File Saving Behavior

- Uploaded files are saved directly to the **Downloads folder** of the server computer
- If a file with the same name already exists, a new name is generated automatically

---

## Activity Logging

NTSlocal automatically creates a file:

Desktop/data.txt


This file continuously logs:
- Device IP when connected
- Upload events with timestamps
- Connection activity
- Disconnection detection (timeout based)

The logging runs continuously while the server is active.

---

## Requirements

- Node.js (v16 or newer recommended)
- Windows / macOS / Linux
- Devices connected to the same Wi-Fi network
- A modern web browser

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/NTSlocal.git
cd NTSlocal
2. Run the server
node run.js
Access the Server
On the same computer
http://localhost:3000
On another device (same Wi-Fi)
http://YOUR_LOCAL_IP:3000
Example:

http://192.168.1.10:3000
A QR code is also shown on the web page for quick mobile access.

User Detection Logic
Due to browser and OS security limitations, router-level Wi-Fi detection is not possible.

NTSlocal uses:

IP-based tracking

Activity heartbeat

Timeout-based disconnect detection

This is a safe and standard approach for local web applications.

UI Design Philosophy
Dark classic theme

Black and gray color palette

No unnecessary animations

Desktop and mobile friendly layout

Focus on usability and clarity

Clean typography

Use Cases
Local file sharing without internet

Classroom or lab file submissions

Office internal file transfer

Home network sharing

Temporary LAN-based file exchange

Lightweight alternative to cloud services

Limitations
Cannot access router-level Wi-Fi user lists

Disconnect detection is timeout based

Auto-opening folders is restricted by OS security

Intended for trusted local networks only

Security Notice
This project is meant for local network usage only.
Do not expose it directly to the public internet without additional security layers.

Project Structure
NTSlocal/
│
├── run.js        # Main server file
├── data.txt      # Activity log (auto generated)
└── README.md
License
MIT License
You are free to use, modify, and distribute this project.

Author
NTSlocal
Built with Node.js for simple, fast, and offline local networking.

Final Notes
NTSlocal focuses on simplicity, reliability, and real usability.
It is intentionally kept minimal while solving a real everyday problem.

Contributions and improvements are always welcome.
