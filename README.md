# whisperNet - A Decentralized Chat Application

**WhisperNet** is a **fully decentralized, peer-to-peer chat application** that enables real-time communication, video calling, messaging, and file sharing — all while maintaining **privacy and anonymity**. Built using **WebRTC** and **Socket.IO**, this application removes reliance on centralized servers after the initial connection.

---

##  Privacy First

- **No authentication** — chat freely without sign-in or identification.
- **No data stored on servers** — everything is peer-to-peer.
- **Rooms are temporary** — deleted automatically when both users leave.

---

##  Features

-  **Room-based Communication**:
  - Users create and join chat rooms using a unique **room number** and **password**.
  
-  **Peer-to-Peer Video & Voice Call**:
  - Uses **WebRTC MediaStream API** for real-time audio/video communication.

-  **Secure Messaging**:
  - Messages are sent over **WebRTC Data Channels**, ensuring they never touch a server.

-  **Unlimited File Sharing**:
  - Share files of **any format or size** directly between peers.

-  **Self-destructing Rooms**:
  - Room session is **terminated** automatically once both users exit — ensuring privacy.

---

## ⚙ Tech Stack

| Layer        | Technology                      |
|--------------|----------------------------------|
| Frontend     | React.js, WebRTC, Socket.IO-client |
| Backend      | Node.js Signaling Server         |
| Realtime     | Socket.IO                        |
| Communication| WebRTC (MediaStream & DataChannels) |
| Auth         | _None (for anonymity)_           |

---

##  How It Works

1. **User A creates a room** using a custom room number and password.
2. **User B joins the room** using the same credentials.
3. A **Signaling Server** (Node.js + Socket.IO) facilitates initial connection by exchanging:
   - Session Description Protocol (SDP)
   - ICE candidates
4. Once signaling is complete:
   - **WebRTC peer-to-peer connection** is established.
   - **MediaStream API** is used for video and voice.
   - **Data Channels** are opened for messaging and file transfer.
5. **When both users leave**, the room is removed, and no trace remains.

---

