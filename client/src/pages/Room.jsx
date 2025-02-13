import { useState, useCallback, useEffect, useContext, useRef } from "react";
import { SocketContext } from "../provider/Socket";
import peer from "../service/PeerService";
import { FcVideoCall } from "react-icons/fc";
import { IoCall } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
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
  const [negotiated, setNegotiated] = useState(false);
  const [fileProgress, setFileProgress] = useState(0);
  const [receivingFile, setReceivingFile] = useState(null);
  const [sendStatus, setSendStatus] = useState("Send");
  const [downloadStatus, setDownloadStatus] = useState("Download");
  const [link, setLink] = useState(null)
  const[cancelDownload, setCancelDownload] = useState(false);
  
  const dataChannel = useRef();
  const fileChannel = useRef();

  const roomData = useSelector((state)=> state.room.roomData);
  const userData = useSelector((state)=>state.user.userData);

  useEffect(()=>{
    if (roomData){
          localStorage.setItem("roomData", JSON.stringify(roomData));
    }
    if(userData){
      localStorage.setItem("userData", JSON.stringify(userData))
    }
  },[roomData, userData])

  const handleIncomingMessage = useCallback((e) => {
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

          if(cancelDownload) {
            setSendStatus("Send");
            setFileProgress(0)
            return;
          }

          const arrayBuffer = reader.result;
          const chunkArray = encode(arrayBuffer);

          const chunkData = JSON.stringify({
            type: "file-chunk",
            chunk: chunkArray,
            chunkIndex: chunkIndex,
            totalChunks: totalChunks,
          });

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
      readAndSendChunk();
    } catch (error) {
      console.error("Error sending file:", error);

    }
  }, [files, CHUNK_SIZE, cancelDownload]);

const assembleAndDownloadFile =useCallback(async (receivingFile) => {

  try {
      const missingChunks = receivingFile.chunks.findIndex(chunk => !chunk);
      if (missingChunks !== -1) {
          throw new Error(`Missing chunk at index ${missingChunks}`);   
      }
      let totalSize = 0;
      receivingFile.chunks.forEach((chunk) => {
          if (chunk) totalSize += chunk.length;
      });
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
          return null;
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
      setTimeout(async ()=>{
        const { email, socketId } = data;
        setRemoteSocketId(socketId);
        setRemoteEmail(email);
        const offer = await peer.getOffer();
        socket.emit("connect-user", { to: socketId, offer });
      }, 500)
    },
    [socket]
  );

  const handleIncomingCall = useCallback(
    async ({ from, email, offer }) => {
      setRemoteSocketId(from);
      setRemoteEmail(email);

      const ans = await peer.createAnswer(offer);

      socket.emit("call-accepted", { to: from, ans });
    },
    [socket]
  );

  const handleCallAccept = useCallback(
    async ({ ans }) => {
      
      await peer.setAnswer(ans);
      dataChannel.current = peer.peer.createDataChannel("myDataChannel");
      fileChannel.current = peer.peer.createDataChannel("fileChannel");
      // Receiving messages
      fileChannel.current.onmessage = handleIncomingFile;
      dataChannel.current.onmessage = handleIncomingMessage;
      //changes to be me here to receive files
    },
    [handleIncomingMessage, handleIncomingFile]
  );

  const handleNegoNeeded = useCallback(async () => {
    // Ensure this peer is the one initiating the negotiation
    if(peer.peer.connectionState == "stable") return;
    if (negotiated) return;
    try {
      const offer = await peer.getOffer();
      socket.emit("nego-needed", { to: remoteSocketId, offer });
    } catch (error) {
      console.error("Error during negotiation:", error);
    }
  }, [remoteSocketId, socket, negotiated]);

  const handleNegoInquire = useCallback(
    async ({ from, offer }) => {
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
    async ({  ans }) => {
      await peer.setAnswer(ans);
      setNegotiated(true);
      if(peer.peer.connectionState == "stable") return;
      socket.emit("second-nego", { to: remoteSocketId });
      
    },
    [socket, remoteSocketId]
  );

  const sendStreams = useCallback(async () => {
    const screenWidth = document.documentElement.clientWidth;

    const videoConstraintsPC =  {
      width: { ideal: 1280, min: 640, max: 1920 }, 
      height: { ideal: 720, min: 480, max: 1080 }, 
      frameRate: { ideal: 30, max: 60 } 
    }

    const videoContraintsMobile = {
      width: { ideal: 720, min: 480, max: 1080},
      height: {ideal: 1280, min: 640, max: 1920 },
      frameRate : {ideal: 30, max: 60} 
    }

    let constraints = videoConstraintsPC;
    if (screenWidth < 600){
        constraints = videoContraintsMobile;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: constraints,
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


  const stopDownload = useCallback(()=>{
    setCancelDownload(true);
    socket.emit("stop-download", {to : remoteSocketId})
  },[socket, remoteSocketId])

  const stopUpload = useCallback(()=>{
    socket.emit("stop-upload", {to: remoteSocketId})
  },[socket, remoteSocketId])


  const removeReceivingFile = ()=>{
    setCancelDownload(false);
    setFiles(null);
    setSendStatus("Send");
    setFileProgress(0);
  }

  const removeUploadingFile = ()=>{
    setReceivingFile(null);
    setDownloadStatus("Download")
    setFileProgress(0);
  }

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
    setNegotiated(false);
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

        if(dataChannel.current.readyState != "open") handleNegoNeeded();
        dataChannel.current.onmessage = handleIncomingMessage;
      } else if (event.channel.label == "fileChannel") {
        fileChannel.current = event.channel;
        console.log(
          "file data channel on other side: ",
          fileChannel.current.readyState
        );
        if(fileChannel.current.readyState != "open") handleNegoNeeded();
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
      alert("Call ended by", remoteSocketId)
      endCall();
    });

    socket.on("video-call", () => {
      setIncomingCall(true);
    });

    socket.on("video-call-accepted", () => {
      setInCall(true);
    });

    socket.on('stop-download', ()=>{
      alert("User cancelled download");
      removeReceivingFile();
    })

    socket.on('stop-upload', ()=>{
      alert("User stopped sharing");
      removeUploadingFile();
    })

    socket.on('user-left', ({name, socketId})=>{
      alert("User: ", name , " : ", socketId, " left");
      setRemoteSocketId(null);
    })

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
      socket.off('stop-download')
      socket.off('stop-upload')
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
    <div className="bg-black w-full h-[100vh] overflow-y-scroll flex flex-row justify-center text-white ">
      <div className="relative md:w-[55%]  max-md:w-full p-4 flex flex-col md:border-2 my-1 rounded-2xl md:border-gray-400">
       
        <div className="w-full flex flex-row justify-between ">
        {roomData &&  <p className="">RoomId: {roomData.roomNum}</p>}
        {roomData && <p className="">Room Password: {roomData.roomPass}</p>}
        </div>

        {!incomingCall && !inCall &&
         <div className="my-1 flex flex-row justify-between items-center ">
            {remoteSocketId ? `Connected to ${remoteEmail}` : `Empty Room`}
          <div>
            { remoteSocketId ?  (
              <button
                onClick={callUser}
                disabled={remoteStream}
                className="bg-[#181818] hover:bg-gray-800 transition-all delay-75 px-2 py-1 rounded-md  text-white  shadow-md"
              >
                <FcVideoCall className="text-4xl " />
              </button>
            ) : <button
            className="bg-green-600 font-semibold hover:bg-green-700 transition-all delay-75 px-2 py-1 rounded-md  text-white  shadow-md"
            onClick={(e)=>{
              e.preventDefault()
              
                const from = JSON.parse(localStorage.getItem("userData"))
                const room = JSON.parse(localStorage.getItem("roomData"))
                const roomPass = JSON.parse(localStorage.getItem("roomData"))
                console.log(from , room)
                socket.emit('reconnect-user', ({from:from , room: room , roomPass: roomPass}));
            }}
            >Reconnect</button>}

            </div>
        </div>}


        {incomingCall && (
          <div className="flex flex-row justify-between  bg-gray-400 px-4 py-2 animate-pulse shadow-md">
            <p>Call from {remoteEmail}</p>

            <div>
            <button
              className="bg-blue-500 px-2 mx-2 py-1 rounded-md hover:bg-blue-600 text-white shadow-md"
              onClick={handleVideoCall}
            >
              <IoCall className="text-3xl" />
            </button>
            <button   className="bg-red-500 px-2 py-1 rounded-md hover:bg-blue-600 text-white shadow-md"
            onClick={()=>{
              socket.emit('end-call', {to: remoteSocketId});
              endCall();
            }}>
              <MdCallEnd className="text-3xl"/></button></div>
          </div>
        )}

        {inCall && (
          <div className="flex flex-col justify-between h-full">
            <VideoCall
              myStream={myStream}
              remoteStream={remoteStream}
              remoteEmail={remoteEmail}
            />

            <VideoCallButtons
              myStream={myStream}
              remoteSocketId={remoteSocketId}
              endCall={endCall}

              />
              </div>
            )}

      {!inCall &&
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
        stopUpload={stopUpload}
        stopDownload={stopDownload}
        removeReceivingFile={removeReceivingFile}
        removeUploadingFile={removeUploadingFile}
      />}
      {link && <div className="relative w-full ">
          <button className="absolute top-0 right-0 backdrop-blur-lg bg-black/55 px-2 my-2 border-[1px] py-2 hover:bg-gray-300 w-[150px] self-end duration-100 transition-all hover:text-black cursor-pointer rounded-xl  border-white" onClick={downloadFile}>Download File</button>
        </div>  }

        {!inCall && (
            <ChatBox
              messages={messages}
              text={text}
              setText={setText}
              sendMessage={sendMessage}
              handleFileChange={handleFileChange}
              sendFile={sendFile}
            />
        )}

      </div>
    </div>
  );
}

export default Room;
