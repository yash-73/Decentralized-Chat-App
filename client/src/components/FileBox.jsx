import {useEffect, useState} from "react";
import { MdOutlineAttachFile } from "react-icons/md";
import PropTypes from "prop-types";
import { FaAngleDown } from "react-icons/fa";
import { FaAngleUp } from "react-icons/fa";

function FileBox({
  className,
  files,
  handleSendFileButton,
  receivingFile,
  fileProgress,
  sendDownloadRequest,
  sendStatus,
  downloadStatus,
  remoteEmail,
  stopUpload,
  stopDownload,
  removeUploadingFile,
  removeReceivingFile
}) {
  const displayName = (name) => {
    if (name.length > 50) {
      return name.slice(0, 50) + "...";
    }
    return name;
  };

  const displaySize = (size) => {
    const sizeInKB = size / 1024;
    if (sizeInKB > 1000) {
      const sizeInMB = sizeInKB / 1024;
      if (sizeInMB > 1000) {
        const sizeInGB = sizeInMB / 1024;
        return sizeInGB.toFixed(2) + " GB";
      }
      return sizeInMB.toFixed(2) + " MB";
    }
    return sizeInKB.toFixed(2) + " KB";
  };

  const [closed, setClosed]  = useState(true);


  useEffect(()=>{
    if(files || receivingFile){
      setClosed(false);
    }
  },[files, receivingFile])


  return (
    <div
      className={`${className} flex flex-col items-center justify-center px-4 relative `}
    >  <FaAngleDown 
    onClick={()=>{setClosed(false)}}
     className={`${closed ? "" : 'hidden'}  ${(downloadStatus==="Download" && sendStatus==="Send" ? "hidden" : "")}  absolute top-0 right-0 m-2 z-20 text-[20px] cursor-pointer text-white`}/>
    <FaAngleUp 
    onClick={()=>{setClosed(true)}}
    className={`${closed  ? "hidden" : ''}  ${(downloadStatus==="Download" && sendStatus==="Send" ? "hidden" : "")} absolute top-0 right-0 m-2 z-20 text-[20px] cursor-pointer text-white`}/>
    
      {files && (
        <div className={`${closed ? "scale-y-[0]" : "scale-100" } duration-200 absolute top-0 w-[calc(100%-2rem)] left-4 flex flex-col border border-gray-700/50 bg-black/60 backdrop-blur-xl z-10 justify-between items-center overflow-y-hidden rounded-2xl shadow-2xl py-4 mt-2`}>

        
            <div className="border border-gray-600/50 bg-white/5 rounded-2xl flex flex-col justify-center items-center p-6 m-4 shadow-inner">
              <MdOutlineAttachFile className="text-5xl text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] mb-2" />
            </div>
            <p className="font-semibold text-gray-200 text-center px-4">{displayName(files.name)}</p>
            <p className="text-sm text-gray-400 mt-1">{displaySize(files.size)}</p>
            {fileProgress > 0 && <div className="w-[80%] mt-4 bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
               <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${fileProgress}%` }}></div>
            </div>}
  

<div className="flex flex-row mt-4 gap-4">
          <button
            onClick={handleSendFileButton}
            disabled={sendStatus != "Send"}
            className="bg-teal-600/90 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed border border-teal-500/50 rounded-xl px-5 py-2 text-white font-medium shadow-[0_0_15px_rgba(13,148,136,0.4)] transition-all"
          >
            {sendStatus}
          </button>

          <button onClick={()=>{
            stopUpload();
            removeReceivingFile();
          }} className= "bg-red-500/80 hover:bg-red-500 border border-red-500/50 text-white px-5 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]">Cancel</button></div>
        </div>
      )}

{receivingFile && downloadStatus == "Download" && (
        <div className={`${closed ? "scale-y-[0]" : "scale-y-100" } duration-200 absolute top-0 w-[calc(100%-2rem)] left-4 flex flex-col border border-gray-700/50 bg-black/60 backdrop-blur-xl z-10 justify-between items-center overflow-y-hidden rounded-2xl shadow-2xl py-4 mt-2`}>
          
          <p className="text-sm font-medium text-teal-400 mb-2">Incoming from {remoteEmail}</p>
          
            <div className="border border-gray-600/50 bg-white/5 rounded-2xl flex flex-col justify-center items-center p-6 m-2 shadow-inner">
              <MdOutlineAttachFile className="text-5xl text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] mb-2" />
            </div>
            <p className="font-semibold text-gray-200 text-center px-4">{displayName(receivingFile.name.toString())}</p>
            <p className="text-sm text-gray-400 mt-1">{displaySize(receivingFile.size)}</p>
            
            {fileProgress > 0 && <div className="w-[80%] mt-4 bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
               <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${fileProgress}%` }}></div>
            </div>}
          
<div className="flex flex-row mt-4 gap-4">
          <button
            onClick={sendDownloadRequest}
            disabled={downloadStatus != "Download"}
            className="bg-blue-600/90 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/50 rounded-xl px-5 py-2 text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all"
          >
            {downloadStatus}
          </button>

          <button
          onClick={()=>{
            removeUploadingFile();
            stopDownload()
          }}
           className= "bg-red-500/80 hover:bg-red-500 border border-red-500/50 text-white px-5 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]">Cancel</button></div>
        </div>
      )}

      {
        receivingFile && downloadStatus == "Downloading..." && 
          <div className= "bg-black/60 backdrop-blur-xl border border-gray-700/50 shadow-lg rounded-2xl absolute top-4 w-[calc(100%-2rem)] left-4 py-6 items-center flex flex-col justify-center z-20">
             <p className="text-blue-400 font-medium mb-3">Downloading file...</p>
             {fileProgress > 0 && <div className="w-[80%] bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
               <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-2.5 rounded-full transition-all duration-100" style={{ width: `${fileProgress}%` }}></div>
            </div>}
          </div>
      }
      </div>
    
    
  );
  
}

FileBox.propTypes = {
  className: PropTypes.string,
  files: PropTypes.shape({
    size: PropTypes.number,
    name: PropTypes.string,
  }),
  handleSendFileButton: PropTypes.func.isRequired,
  receivingFile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
  }),
  fileProgress: PropTypes.number,
  sendDownloadRequest: PropTypes.func.isRequired,
  sendStatus: PropTypes.string,
  downloadStatus: PropTypes.string,
  remoteEmail: PropTypes.string,
  stopUpload: PropTypes.func,
  stopDownload: PropTypes.func,
  removeReceivingFile: PropTypes.func,
  removeUploadingFile: PropTypes.func,
};

export default FileBox;
