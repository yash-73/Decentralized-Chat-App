import { useState, useCallback, useEffect, useContext, useRef } from "react";
import { SocketContext } from "../provider/Socket";
import peer from "../service/PeerService";
import { FcVideoCall } from "react-icons/fc";
import { IoCall } from "react-icons/io5";
import VideoCall from "../components/VideoCall";
import VideoCallButtons from "../components/VideoCallButtons";
import ChatBox from "../components/ChatBox";
import "./Room.css";
import FileBox from "../components/FileBox";
import {encode, decode} from 'base64-arraybuffer'
function Room() {
  const CHUNK_SIZE = 16 * 1024;

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
  const [fileProgress, setFileProgress] = useState(0);
  const [receivingFile, setReceivingFile] = useState(null);

  const [sendStatus, setSendStatus] = useState("Send");
  const [downloadStatus, setDownloadStatus] = useState("Download");
  const [fileDownloaded, setFileDownloaded] = useState(false);

  const dataChannel = useRef();
  const fileChannel = useRef();

  const handleIncomingMessage = useCallback((e) => {
    console.log("Message received at: ", Date.now());
    const msg = JSON.parse(e.data);
    setMessages((messages) => [
      ...messages,
      { type: msg.type, yours: false, value: msg.value },
    ]);
  }, []);

  const sendFile = useCallback(async () => {
    if (!fileChannel.current || !files) return;
    try {
      const totalChunks = Math.ceil(files.size / CHUNK_SIZE);
      let chunkIndex = 0;
      const reader = new FileReader();
      const readAndSendChunk = () => {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, files.size);
        const chunk = files.slice(start, end);

        reader.onload = () => {
          const arrayBuffer = reader.result;
          // const chunkArray = Array.from(new Uint8Array(arrayBuffer));
          const chunkArray = encode(arrayBuffer);

          const chunkData = JSON.stringify({
            type: "file-chunk",
            chunk: chunkArray,
            chunkIndex: chunkIndex,
            totalChunks: totalChunks,
          });

          // Check if channel is ready to send
          if (
            fileChannel.current.bufferedAmount >
            fileChannel.current.bufferedAmountLowThreshold
          ) {
            fileChannel.current.onbufferedamountlow = () => {
              console.log("Sending chunk", chunkIndex, chunk.byteLength);
              fileChannel.current.send(chunkData);
              setFileProgress((chunkIndex+1/totalChunks) * 100)
              fileChannel.current.onbufferedamountlow = null;
              proceedToNextChunk();
            };
          } else {
            console.log("Sending chunk", chunkIndex, chunk.byteLength);
            fileChannel.current.send(chunkData);
            proceedToNextChunk();
          }
        };

        reader.readAsArrayBuffer(chunk);
      };

      const proceedToNextChunk = () => {
        chunkIndex++;
        if (chunkIndex < totalChunks) {
          readAndSendChunk();
        } else {
          setSendStatus("Sent")
          setFiles(null);
          setFileName(null)
          setFileProgress(0);
          fileChannel.current.send(JSON.stringify({ type: "file-end" }));
        }
      };

      // Start the process
      readAndSendChunk();
    } catch (error) {
      console.error("Error sending file:", error);
    }
  }, [files, CHUNK_SIZE]);

  // Receiver code
  const handleIncomingFile = useCallback(
    async (event) => {
      const fileData = JSON.parse(event.data);

      if (fileData.type == "file-start") {
        setFileDownloaded(false);
        setReceivingFile({
          name: fileData.fileName,
          size: fileData.fileSize,
          type: fileData.fileType,
          chunks: new Array(Math.ceil(fileData.fileSize / CHUNK_SIZE)),
          receivedChunks: 0,
          totalChunks: Math.ceil(fileData.fileSize / CHUNK_SIZE), // Add totalChunks to state
          isComplete: false // Add flag to track completion
        });
      } else if (fileData.type == "start-download") {
        console.log("Sending file now");
        setSendStatus("Sending...");
        await sendFile();
      } else if (fileData.type == "file-chunk") {
        setReceivingFile((prev) => {
          if (!prev) return prev;

          // Convert chunk data
          const chunkArray = new Uint8Array(decode(fileData.chunk));
          console.log("Received chunk", fileData.chunkIndex, chunkArray.length);

          // Create new chunks array to avoid mutation
          const newChunks = [...prev.chunks];
          newChunks[fileData.chunkIndex] = chunkArray;
          
          const newReceivedChunks = prev.receivedChunks + 1;
          setFileProgress((newReceivedChunks / fileData.totalChunks) * 100);

          // Check if this was the last chunk we were waiting for
          const isComplete = newReceivedChunks === prev.totalChunks;
          
          // If this is the last chunk and we already got the file-end message,
          // trigger the file assembly
          if (isComplete && prev.receivedEndSignal) {
            setTimeout(() => assembleAndDownloadFile(prev), 100);
          }

          return {
            ...prev,
            chunks: newChunks,
            receivedChunks: newReceivedChunks,
            isComplete
          };
        });
      } else if (fileData.type === "file-end") {
        setReceivingFile((prev) => {
          if (!prev) return prev;

          // If we already have all chunks, assemble the file
          if (prev.isComplete) {
            setTimeout(() => assembleAndDownloadFile(prev), 100);
            return prev;
          }
          // Otherwise, mark that we received the end signal and wait
          // for the remaining chunks
          return {
            ...prev,
            receivedEndSignal: true
          };
        });
      }
    },
    [sendFile, CHUNK_SIZE,assembleAndDownloadFile]
);

// Separate function to handle file assembly and download
const assembleAndDownloadFile =useCallback( (receivingFile) => {

  if(fileDownloaded) return;
  try {
      // Verify all chunks are present
      const missingChunks = receivingFile.chunks.findIndex(chunk => !chunk);
      if (missingChunks !== -1) {
          throw new Error(`Missing chunk at index ${missingChunks}`);
      }

      // Calculate total size
      let totalSize = 0;
      receivingFile.chunks.forEach((chunk) => {
          if (chunk) totalSize += chunk.length;
      });

      // Create final array and combine chunks
      const finalArray = new Uint8Array(totalSize);
      let offset = 0;

      receivingFile.chunks.forEach((chunk) => {
          if (chunk) {
              finalArray.set(chunk, offset);
              offset += chunk.length;
          }
      });

      const fileBlob = new Blob([finalArray], { type: receivingFile.type });
      const downloadUrl = URL.createObjectURL(fileBlob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = receivingFile.name;
      link.click();

      URL.revokeObjectURL(downloadUrl);
      setReceivingFile(null);
      setFileProgress(0);
      setDownloadStatus("Send");
      console.log("Original size:", receivingFile.size, "Assembled size:", totalSize);
      setFileDownloaded(true);
  } catch (error) {
      console.error("Error assembling file:", error);
      alert("Error assembling file: " + error.message);
  }
},[fileDownloaded]);

  const handleSendFileButton = (e) => {
    e.preventDefault();
    if (fileChannel && files) {
      fileChannel.current.send(
        JSON.stringify({
          type: "file-start",
          fileName: files.name,
          fileSize: files.size,
          fileType: files.type,
        })
      );
    }
    console.log("Button clicked");
    setSendStatus("Waiting for acceptance");
  };

  const sendDownloadRequest = (e) => {
    e.preventDefault();
    if (fileChannel) {
      fileChannel.current.send(JSON.stringify({ type: "start-download" }));
      setDownloadStatus("Downloading...");
    }
  };

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
      fileChannel.current = peer.peer.createDataChannel("fileChannel");

      console.log("created dataChannel", dataChannel.current.readyState);
      // Receiving messages
      fileChannel.current.onmessage = handleIncomingFile;
      dataChannel.current.onmessage = handleIncomingMessage;

      //changes to be me here to receive files
    },
    [handleIncomingMessage, handleIncomingFile]
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
    console.log("Message sent at: ", Date.now());
    dataChannel.current.send(JSON.stringify({ type: "text", value: text }));
    setMessages((messages) => [
      ...messages,
      { type: "text", yours: true, value: text },
    ]);
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
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    peer.peer.ondatachannel = (event) => {
      if (event.channel.label == "myDataChannel") {
        dataChannel.current = event.channel;
        console.log(
          "Text Data channel on other side : ",
          dataChannel.current.readyState
        );
        dataChannel.current.onmessage = handleIncomingMessage;
      } else if (event.channel.label == "fileChannel") {
        fileChannel.current = event.channel;
        console.log(
          "file data channel on other side: ",
          fileChannel.current.readyState
        );
        fileChannel.current.onmessage = handleIncomingFile;
      }
    };

    peer.peer.addEventListener("track", async (event) => {
      const rStream = event.streams;
      setRemoteStream(rStream[0]);
    });

    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded, handleIncomingMessage, handleIncomingFile]);

  useEffect(() => {
    if (dataChannel.current != null)
      dataChannel.current.onmessage = handleIncomingMessage;
  }, [handleIncomingMessage]);

  useEffect(() => {
    if (fileChannel.current != null)
      fileChannel.current.onmessage = handleIncomingFile;
  }, [handleIncomingFile]);

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
    <div className="flex justify-center flex-row px-4 items-center bg-[#181818] text-white min-h-[100vh] ">

      <FileBox
        className="w-[25%]"
        fileName={fileName}
        files={files}
        handleSendFileButton={handleSendFileButton}
        receivingFile={receivingFile}
        fileProgress={fileProgress}
        sendDownloadRequest={sendDownloadRequest}
        sendStatus={sendStatus}
        downloadStatus={downloadStatus}
      />

      <div className="flex flex-col my-8 w-[50%] min-w-[300px] border-2 rounded-2xl border-gray-400 mx-4">
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
              className="flex lg:flex-row  flex-col justify-evenly  max-lg:items-center lg:items-end border-gray-400 border-[1px]"
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
              sendFile={sendFile}
            />
          </div>
        )}

      </div>
      <div className="w-[25%]"></div>
    </div>
  );
}

export default Room;
