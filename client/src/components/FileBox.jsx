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
        <div className={`${closed ? "scale-y-[0]" : "scale-100" } duration-200 absolute top-0 w-full left-0 flex flex-col border-b border-zinc-700 bg-zinc-900 z-10 justify-between items-center overflow-y-hidden py-4 p-4 shadow-xl`}>

        
            <div className="border border-zinc-700 bg-zinc-950 flex flex-col justify-center items-center p-6 m-4 w-full max-w-[200px]">
              <MdOutlineAttachFile className="text-5xl text-teal-400 mb-2" />
            </div>
            <p className="font-semibold text-gray-200 text-center px-4">{displayName(files.name)}</p>
            <p className="text-sm text-gray-400 mt-1">{displaySize(files.size)}</p>
            {fileProgress > 0 && <div className="w-[80%] mt-4 bg-zinc-800 h-2 overflow-hidden border border-zinc-700 relative">
               <div className="bg-teal-400 h-full transition-all duration-300" style={{ width: `${fileProgress}%` }}></div>
            </div>}
  

<div className="flex flex-row mt-4 gap-4 w-[80%] justify-center">
          <button
            onClick={handleSendFileButton}
            disabled={sendStatus != "Send"}
            className="flex-1 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold uppercase tracking-wider py-3 transition-colors"
          >
            {sendStatus}
          </button>

          <button onClick={()=>{
            stopUpload();
            removeReceivingFile();
          }} className= "flex-1 bg-red-500 hover:bg-red-400 text-zinc-950 font-bold uppercase tracking-wider py-3 transition-colors">Cancel</button></div>
        </div>
      )}

{receivingFile && downloadStatus == "Download" && (
        <div className={`${closed ? "scale-y-[0]" : "scale-y-100" } duration-200 absolute top-0 w-full left-0 flex flex-col border-b border-zinc-700 bg-zinc-900 z-10 justify-between items-center overflow-y-hidden py-4 shadow-xl p-4`}>
          
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">Incoming from {remoteEmail}</p>
          
            <div className="border border-zinc-700 bg-zinc-950 flex flex-col justify-center items-center p-6 m-2 w-full max-w-[200px]">
              <MdOutlineAttachFile className="text-5xl text-blue-400 mb-2" />
            </div>
            <p className="font-semibold text-gray-200 text-center px-4">{displayName(receivingFile.name.toString())}</p>
            <p className="text-sm text-gray-400 mt-1">{displaySize(receivingFile.size)}</p>
            
            {fileProgress > 0 && <div className="w-[80%] mt-4 bg-zinc-800 h-2 overflow-hidden border border-zinc-700">
               <div className="bg-blue-400 h-full transition-all duration-300" style={{ width: `${fileProgress}%` }}></div>
            </div>}
          
<div className="flex flex-row mt-4 gap-4 w-[80%] justify-center">
          <button
            onClick={sendDownloadRequest}
            disabled={downloadStatus != "Download"}
            className="flex-1 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold uppercase tracking-wider py-3 transition-colors"
          >
            {downloadStatus}
          </button>

          <button
          onClick={()=>{
            removeUploadingFile();
            stopDownload()
          }}
           className= "flex-1 bg-red-500 hover:bg-red-400 text-zinc-950 font-bold uppercase tracking-wider py-3 transition-colors">Cancel</button></div>
        </div>
      )}

      {
        receivingFile && downloadStatus == "Downloading..." && 
          <div className= "bg-zinc-950 border-b border-zinc-700 shadow-xl absolute top-0 w-full left-0 py-6 items-center flex flex-col justify-center z-20">
             <p className="text-blue-400 font-bold uppercase tracking-widest text-sm mb-3">Downloading file...</p>
             {fileProgress > 0 && <div className="w-[80%] bg-zinc-800 h-2 overflow-hidden border border-zinc-700">
               <div className="bg-blue-400 h-full transition-all duration-100" style={{ width: `${fileProgress}%` }}></div>
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
