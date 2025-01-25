import {} from "react";
import { MdOutlineAttachFile } from "react-icons/md";
import PropTypes from "prop-types";

function FileBox({
  className,
  fileName,
  files,
  handleSendFileButton,
  receivingFile,
  fileProgress,
  sendDownloadRequest,
  sendStatus,
  downloadStatus,
  remoteEmail
}) {
  const displayName = (name) => {
    if (name.length > 16) {
      return name.slice(0, 16) + "...";
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

  return (
    <div
      className={`${className} flex flex-col items-center justify-center  bg-black`}
    > 
      {fileName && (
        <div className="w-full flex flex-col  p-4 top-0 border-2 border-gray-400 left-0 backdrop-blur-md z-10 justify-evenly items-center">
          <div className="flex flex-col items-center">
            <div className="border-2 border-gray-400 flex flex-row justify-center items-center p-4 m-4">
              <MdOutlineAttachFile className="text-4xl text-gray-300" />
            </div>
            <p>{displayName(fileName)}</p>
            <p>{displaySize(files.size)}</p>
            {fileProgress > 0 && <progress value={fileProgress} max="100" />}
          </div>

          <button
            onClick={handleSendFileButton}
            disabled={sendStatus != "Send"}
            className="border-[1px] border-gray-400 rounded-lg px-4 py-2 m-4 hover:bg-gray-300 hover:text-[#181818] transition-all delay-75"
          >
            {sendStatus}
          </button>
        </div>
      )}

      {receivingFile && (
        <div className="w-full flex flex-row p-4 top-0 border-2 border-gray-400 left-0 backdrop-blur-md z-10 justify-evenly items-center">
          <div className="flex flex-col items-center">
          <p className="self-center">Sent from {remoteEmail}</p>
          
            <div className="border-2 border-gray-400 flex flex-row justify-center items-center p-4 m-4">
            
              <MdOutlineAttachFile className="text-4xl text-gray-300" />
            </div>
            <p>{displayName(receivingFile.name.toString())}</p>
            <p>{displaySize(receivingFile.size)}</p>
            
            {fileProgress > 0 && <progress value={fileProgress} max="100" />}
          </div>

          <button
            onClick={sendDownloadRequest}
            disabled={downloadStatus != "Download"}
            className="border-[1px] border-gray-400 rounded-lg px-4 py-2 m-4 hover:bg-gray-300 hover:text-[#181818] transition-all delay-75"
          >
            {downloadStatus}
          </button>
        </div>
      )}
    </div>
  );
}

FileBox.propTypes = {
  className: PropTypes.string,
  fileName: PropTypes.string,
  files: PropTypes.shape({
    size: PropTypes.number,
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
  remoteEmail: PropTypes.string
};

export default FileBox;
