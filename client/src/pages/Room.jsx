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
import { useSelector } from "react-redux";
function Room() {
  const CHUNK_SIZE = 16 * 1024;

  const socket = useContext(SocketContext);

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [remoteEmail, setRemoteEmail] = useState();
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const [incomingCall, setIncomingCall] = useState(false);
  const [inCall, setInCall] = useState(false);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState();

  const [fileProgress, setFileProgress] = useState(0);
  const [receivingFile, setReceivingFile] = useState(null);
  const [sendStatus, setSendStatus] = useState("Send");
  const [downloadStatus, setDownloadStatus] = useState("Download");
  const [link, setLink] = useState(null)

  const dataChannel = useRef();
  const fileChannel = useRef();

  const roomData = useSelector((state)=> state.room.roomData);

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
             
              fileChannel.current.send(chunkData);
              setFileProgress((chunkIndex+1/totalChunks) * 100)
              fileChannel.current.onbufferedamountlow = null;
              proceedToNextChunk();
            };
          } else {
            
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
          setSendStatus("Send")
          setFiles(null);
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

  // Separate function to handle file assembly and download
const assembleAndDownloadFile =useCallback(async (receivingFile) => {

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
      const link1 = document.createElement("a");
      link1.href = downloadUrl;
      link1.download = receivingFile.name;
      setLink(link1)
      console.log("Original size:", receivingFile.size, "Assembled size:", totalSize);

  } catch (error) {
      console.error("Error assembling file:", error);
      alert("Error assembling file: " + error.message);
      setReceivingFile(null);
      setFileProgress(0);
      setDownloadStatus("Download");

  }
},[]);

const handleIncomingFile = useCallback(
  async (event) => {
    const fileData = JSON.parse(event.data);

    if (fileData.type === "file-start") {
      
      setReceivingFile({
        name: fileData.fileName,
        size: fileData.fileSize,
        type: fileData.fileType,
        chunks: new Array(Math.ceil(fileData.fileSize / CHUNK_SIZE)),
        receivedChunks: 0,
        totalChunks: Math.ceil(fileData.fileSize / CHUNK_SIZE),
        isComplete: false
      });
    } 
    else if (fileData.type == "start-download") {
      console.log("Sending file now  ",Date.now());
      setSendStatus("Sending...");
      await sendFile();
    }
    else if (fileData.type === "file-chunk") {
      setReceivingFile((prev) => {
        if (!prev) return prev;

        const chunkArray = new Uint8Array(decode(fileData.chunk));
        const newChunks = [...prev.chunks];
        newChunks[fileData.chunkIndex] = chunkArray;

        const newReceivedChunks = prev.receivedChunks + 1;
        const isComplete = newReceivedChunks === prev.totalChunks;
        setFileProgress((newReceivedChunks / prev.totalChunks) * 100);

        return {
          ...prev,
          chunks: newChunks,
          receivedChunks: newReceivedChunks,
          isComplete
        };
      });
    }
    else if (fileData.type === "file-end") {
      setReceivingFile((prev) => {
        if (!prev) return prev;

        if (prev.isComplete) {
          assembleAndDownloadFile(prev);
          return null; // Reset receiving file state
        }

        return prev;
      });
    }
  },
  [sendFile, CHUNK_SIZE, assembleAndDownloadFile]
);


const downloadFile = useCallback(()=>{
      link.click();
      setReceivingFile(null);
      setFileProgress(0);
      setDownloadStatus("Download");
      console.log("Download complete ", Date.now())
      setLink(null);
},[link])


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
      console.log("Created filechannel", fileChannel.current.readyState);
      // Receiving messages
      fileChannel.current.onmessage = handleIncomingFile;
      dataChannel.current.onmessage = handleIncomingMessage;

      //changes to be me here to receive files
    },
    [handleIncomingMessage, handleIncomingFile]
  );

  const handleNegoNeeded = useCallback(async () => {
    // Ensure this peer is the one initiating the negotiation
    
    console.log("Now negotiating");
    try {
      const offer = await peer.getOffer();
      socket.emit("nego-needed", { to: remoteSocketId, offer });
    } catch (error) {
      console.error("Error during negotiation:", error);
    }
  }, [remoteSocketId, socket]);

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
   
      socket.emit("second-nego", { to: remoteSocketId });
    },
    [socket, remoteSocketId]
  );

  const sendStreams = useCallback(async () => {
    const videoConstraints =  {
      width: { ideal: 1280, min: 640, max: 1920 },  // Set preferred width
      height: { ideal: 720, min: 480, max: 1080 }, // Set preferred height
      frameRate: { ideal: 30, max: 60 }  // Increase frame rate for smoother video
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: videoConstraints,
    });
    setMyStream(stream);
    stream.getTracks().forEach((track) => {
      peer.peer.addTrack(track, stream);
    });
  }, []);

  const callUser = useCallback(async () => {

    setInCall(true);
    await sendStreams();
    socket.emit("video-call", { to: remoteSocketId });
  }, [socket, remoteSocketId, sendStreams]);

  const handleVideoCall = useCallback(async () => {
  
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
    try{
      dataChannel.current.send(JSON.stringify({ type: "text", value: text }));
      setMessages((messages) => [
        ...messages,
        { type: "text", yours: true, value: text },
      ]);
      setText("");
    }
    catch (err){
      alert("Could not send message");
      console.log("Error: ", err)
    }
    
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFiles(file);

    if (file) {
      console.dir(file);
    }
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

  useEffect(()=>{
    if (remoteStream != null){
      setInterval(()=>{
        remoteStream.getVideoTracks().forEach(track =>{
          const settings = track.getSettings();
          console.log(`Current resolution: ${settings.width}x${settings.height}`)
        })
      },2000)
    }
    return ()=>{
      
    }
  },[remoteStream])

  useEffect(()=>{
    if (myStream != null){
      setInterval(()=>{
        myStream.getVideoTracks().forEach(track =>{
          const settings = track.getSettings();
          console.log(`My resolution: ${settings.width}x${settings.height}`)
        })
      },2000)
    }

    return ()=>{

    }
  },[myStream])

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
    <div className="flex w-full justify-center max-md:items-stretch flex-row px-4 items-center bg-black text-white h-[100vh]">
      <div className="lg:w-[25%] max-md:hidden  flex flex-col items-center relative">{!inCall &&
      <FileBox
        className="w-full"
        files={files}
        handleSendFileButton={handleSendFileButton}
        receivingFile={receivingFile}
        fileProgress={fileProgress}
        sendDownloadRequest={sendDownloadRequest}
        sendStatus={sendStatus}
        downloadStatus={downloadStatus}
        remoteEmail={remoteEmail}
      />}
      {link && <div>
          <button className="px-2 border-[1px] py-2 hover:bg-gray-300 duration-100 transition-all hover:text-black cursor-pointer rounded-xl  border-white" onClick={downloadFile}>Download File</button>
         </div>}</div>
      

      <div className="flex flex-col  md:w-[50%] max-md:w-full border-2 rounded-2xl border-gray-400 ">
        
      <div className="flex flex-row items-center justify-between p-4 border-b-2 border-gray-400 text-center ">
         {roomData &&  <div className="mx-4">RoomId: {roomData.roomNum}</div>}
          {roomData && <div className="mx-4">Room Password: {roomData.roomPass}</div>}
          </div>
        {!incomingCall && !inCall && <div className="flex flex-row justify-between items-center px-4 py-2">
          <div>
            {remoteSocketId ? `Connected to ${remoteEmail}` : `Empty Room`}
          </div>
          <div>
            
            { remoteSocketId &&  (
              <button
                onClick={callUser}
                disabled={remoteStream}
                className="bg-[#181818] hover:bg-gray-800 transition-all delay-75 px-2 py-1 rounded-md  text-white  shadow-md"
              >
                <FcVideoCall className="text-4xl " />
              </button>
            )}

          </div>
        </div>}

        {incomingCall && (
          <div className="flex flex-row justify-between  bg-gray-400 px-4 py-2 animate-pulse shadow-md">
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
              className="flex lg:flex-row py-8  flex-col justify-evenly  max-lg:items-center lg:items-end border-gray-400 border-[1px]"
            />

            <VideoCallButtons
              myStream={myStream}
              remoteSocketId={remoteSocketId}
              endCall={endCall}
            />
          </div>
        )}

        {!inCall && (
          <div >
            <ChatBox
              messages={messages}
              text={text}
              setText={setText}
              sendMessage={sendMessage}
              handleFileChange={handleFileChange}
              sendFile={sendFile}
            />
          </div>
        )}

      </div>

      <div className=" flex flex-col items-center justify-start lg:w-[25%] h-full">
        
      </div>

    </div>
  );
}

export default Room;
