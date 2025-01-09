import { useState, useCallback, useEffect, useContext, useRef } from "react";
import { SocketContext } from "../provider/Socket";
import peer from "../service/PeerService";
import VideoCall from "../components/VideoCall";
import "./Room.css";
import { FcVideoCall } from "react-icons/fc";
import { IoCall } from "react-icons/io5";

import VideoCallButtons from "../components/VideoCallButtons";
import ChatBox from "../components/ChatBox";

function Room() {
  const socket = useContext(SocketContext);

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [remoteEmail, setRemoteEmail] = useState();
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [incomingCall, setIncomingCall] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [negotiated, setNegotiated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [files, setFiles] = useState();

  const dataChannel = useRef();
  const fileChannel = useRef();

  const handleIncomingMessage = useCallback((e) => {
    setMessages((messages) => [...messages, { yours: false, value: e.data }]);
  }, []);

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { email, socketId } = data;
      setRemoteEmail(email);
      console.log(email, " joined the room");
      setRemoteSocketId(socketId);

      const offer = await peer.getOffer();
      socket.emit("connect-user", { to: socketId, offer });
    },
    [socket]
  );

  const handleIncomingCall = useCallback(
    async ({ from, email, offer }) => {
      console.log("Got offer from ", from, " : ", offer);
      setRemoteSocketId(from);
      setRemoteEmail(email);

      const ans = await peer.createAnswer(offer);

      socket.emit("call-accepted", { to: from, ans });
    },
    [socket]
  );

  const handleCallAccept = useCallback(
    async ({ from, ans }) => {
      console.log("Got the answer from ", from, " : ", ans);
      await peer.setAnswer(ans);
      console.log("Successful connection");

      dataChannel.current = peer.peer.createDataChannel("myDataChannel");
      // fileChannel.current = peer.peer.createDataChannel("fileChannel")
      console.log("created dataChannel", dataChannel.current.readyState);
      // Receiving messages
      dataChannel.current.onmessage = handleIncomingMessage;
      //changes to be me here to receive files
    },
    [handleIncomingMessage]
  );

  const handleNegoNeeded = useCallback(async () => {
    // Ensure this peer is the one initiating the negotiation
    if (negotiated) {
      console.log("Already negotiated");
      return;
    }
    console.log("Now negotiating");
    try {
      const offer = await peer.getOffer();
      socket.emit("nego-needed", { to: remoteSocketId, offer });
    } catch (error) {
      console.error("Error during negotiation:", error);
    }
  }, [remoteSocketId, socket, negotiated]);

  const handleNegoInquire = useCallback(
    async ({ from, offer }) => {
      console.log("Negotiation inquiry received from", from);
      try {
        const answer = await peer.createAnswer(offer);
        socket.emit("nego-answer", { to: from, ans: answer });
      } catch (error) {
        console.error("Error responding to negotiation inquiry:", error);
      }
    },
    [socket]
  );

  const handleNegoDone = useCallback(
    async ({ from, ans }) => {
      console.log("Accepting answer of negotiation from ", from);
      await peer.setAnswer(ans);
      setNegotiated(true);
      socket.emit("second-nego", { to: remoteSocketId });
    },
    [socket, remoteSocketId]
  );

  const sendStreams = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    stream.getTracks().forEach((track) => {
      peer.peer.addTrack(track, stream);
    });
  }, []);

  const callUser = useCallback(async () => {
    setNegotiated(false);
    setInCall(true);
    await sendStreams();
    socket.emit("video-call", { to: remoteSocketId });
  }, [socket, remoteSocketId, sendStreams]);

  const handleVideoCall = useCallback(async () => {
    setNegotiated(false);
    setIncomingCall(false);
    setInCall(true);
    await sendStreams();
    socket.emit("accepting-video-call", { to: remoteSocketId });
  }, [socket, remoteSocketId, sendStreams]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!remoteSocketId) return;
    if (text.length == 0) return;
    dataChannel.current.send(text);
    setMessages((messages) => [...messages, { yours: true, value: text }]);
    setText("");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFiles(file);

    if (file) {
      console.dir(file);
      setFileName(file.name);
    } else setFileName("");
  };

  const endCall = useCallback(() => {
    // Stop all tracks in my stream
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
    }

    // Reset the remote stream
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    // Reset call-related states
    setInCall(false);
    setIncomingCall(false);
    setNegotiated(false);
  }, [myStream, remoteStream]);

  useEffect(() => {
    if (dataChannel.current != null)
      dataChannel.current.onmessage = handleIncomingMessage;
  }, [handleIncomingMessage]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    peer.peer.ondatachannel = (event) => {

      dataChannel.current = event.channel;
      console.log(
        "Data channel on other side : ",
        dataChannel.current.readyState
      );
      dataChannel.current.onmessage = handleIncomingMessage;
    };

    peer.peer.addEventListener("track", async (event) => {
      const rStream = event.streams;
      setRemoteStream(rStream[0]);
    });

    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded, handleIncomingMessage]);

  useEffect(() => {
    if (dataChannel != null) dataChannel.onmessage = handleIncomingMessage;
  }, [dataChannel, handleIncomingMessage]);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("ans-of-call", handleCallAccept);
    socket.on("nego-inquire", handleNegoInquire);
    socket.on("nego-done", handleNegoDone);
    socket.on("second-nego", handleNegoNeeded);
    socket.on("end-call", () => {
      console.log("call ended by ", remoteSocketId);
      endCall();
    });

    socket.on("video-call", ({ from }) => {
      console.log("Incoming video call from ", from);
      setIncomingCall(true);
    });

    socket.on("video-call-accepted", ({ from }) => {
      console.log("Accepted call from ", from);
      setInCall(true);
    });

    return () => {
      socket.off("user-joined");
      socket.off("incoming-call");
      socket.off("ans-of-call");
      socket.off("nego-inquire");
      socket.off("nego-done");
      socket.off("second-nego");
      socket.off("video-call");
      socket.off("video-call-accepted");
      socket.off("end-call");
    };
  }, [
    socket,
    handleNewUserJoined,
    handleIncomingCall,
    handleCallAccept,
    handleNegoNeeded,
    handleNegoInquire,
    handleNegoDone,
    sendStreams,
    remoteSocketId,
    endCall,
  ]);

  return (
    <div className="flex justify-center items-center bg-[#181818] text-white min-h-[100vh] ">
      <div className="flex flex-col my-8 md:w-[80%] min-w-[300px] border-2 rounded-2xl border-gray-400">
        <div className="flex flex-row justify-between items-center px-4 py-2">
          <div>
            {remoteSocketId ? `Connected to ${remoteEmail}` : `Empty Room`}
          </div>
          <div>
            {remoteSocketId && (
              <button
                onClick={callUser}
                disabled={remoteStream}
                className="bg-[#181818] hover:bg-gray-800 transition-all delay-75 px-2 py-1 rounded-md  text-white  shadow-md"
              >
                <FcVideoCall className="text-4xl " />
              </button>
            )}
          </div>
        </div>

        {incomingCall && (
          <div className="flex flex-row justify-between px-4 py-2">
            <p>Call from {remoteEmail}</p>
            <button
              className="bg-blue-500 px-2 py-1 rounded-md hover:bg-blue-600 text-white shadow-md"
              onClick={handleVideoCall}
            >
              <IoCall className="text-3xl" />
            </button>
          </div>
        )}
        {inCall && (
          <div className="flex flex-col">
            <VideoCall
              myStream={myStream}
              remoteStream={remoteStream}
              remoteEmail={remoteEmail}
              className="flex lg:flex-row  flex-col justify-evenly items-end border-gray-400 border-[1px]"
            />

            <VideoCallButtons
              myStream={myStream}
              remoteSocketId={remoteSocketId}
              endCall={endCall}
            />
          </div>
        )}

        {!inCall && (
          <div>
            <ChatBox
              messages={messages}
              text={text}
              setText={setText}
              sendMessage={sendMessage}
              handleFileChange={handleFileChange}
              fileName={fileName}
              sendFile={() => {
                if (files && remoteSocketId) {
                  dataChannel.current.send(files.name);
                  setMessages((messages) => [
                    ...messages,
                    { yours: true, value: `Sent file: ${files.name}` },
                  ]);
                  setFileName("");
                  setFiles(null);
                }
              }}
            />

          </div>
        )}
      </div>
    </div>
  );
}

export default Room;
