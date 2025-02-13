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
        <div className={`${closed ? "scale-y-[0]" : "scale-100" } duration-150 absolute top-0 w-full flex flex-col border-2 border-gray-400 bg-black/35 backdrop-blur-lg z-10 justify-between items-center overflow-y-hidden`}>

        
            <div className="border-2 border-gray-400 flex flex-col justify-center items-center p-4 m-4">
              <MdOutlineAttachFile className="text-4xl text-gray-300" />
            </div>
            <p>{displayName(files.name)}</p>
            <p>{displaySize(files.size)}</p>
            {fileProgress > 0 && <progress value={fileProgress} max="100" />}
  

<div className="flex flex-row">
          <button
            onClick={handleSendFileButton}
            disabled={sendStatus != "Send"}
            className="border-[1px] border-gray-400 rounded-lg px-4 py-2 m-4 hover:bg-green-700 bg-green-600 cursor-pointer transition-all delay-75"
          >
            {sendStatus}
          </button>

          <button onClick={()=>{
            stopUpload();
            removeReceivingFile();
          }} className= "border-[1px] border-gray-400 px-4 py-2 m-4 bg-red-500  hover:bg-red-700 duration-100 p-2 rounded-lg">Cancel</button></div>
        </div>
      )}

{receivingFile && downloadStatus == "Download" && (
        <div className={`${closed ? "scale-y-[0]" : "scale-y-100" }  duration-150 absolute top-0 w-full flex flex-col border-2 border-gray-400 bg-black/35 backdrop-blur-lg z-10 justify-between items-center overflow-y-hidden`}>
          
          <p>Sent from {remoteEmail}</p>
          
            <div className="border-2 border-gray-400 flex flex-row justify-center items-center p-4 m-4">
            
              <MdOutlineAttachFile className="text-4xl text-gray-300" />
            </div>
            <p>{displayName(receivingFile.name.toString())}</p>
            <p>{displaySize(receivingFile.size)}</p>
            
            {fileProgress > 0 && <progress value={fileProgress} max="100" />}
          

          <button
            onClick={sendDownloadRequest}
            disabled={downloadStatus != "Download"}
            className="border-[1px] border-gray-400 rounded-lg px-4 py-2 my-4 hover:bg-green-700 bg-green-600 cursor-pointer transition-all delay-75"
          >
            {downloadStatus}
          </button>

          <button
          onClick={()=>{
            removeUploadingFile();
            stopDownload()
          }}
           className= "border-[1px] border-gray-400 px-4 py-2 m-4 bg-red-500  hover:bg-red-700 duration-100 p-2 rounded-lg">Cancel</button>
        </div>
      )}

      {
        receivingFile && downloadStatus == "Downloading..." && 
          <div className= " bg-black/55 backdrop-blur-lg absolute top-0 w-full py-4 items-center flex flex-col justify-center">
             {fileProgress > 0 && <progress className="text-blue-400 bg-white rounded-xl w-[50%] h-[10px]" value={fileProgress} max="100" />}
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
