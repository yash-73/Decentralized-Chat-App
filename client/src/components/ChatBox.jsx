import { useRef, useEffect } from "react";
import Messages from "../components/Messages";
import PropTypes from "prop-types";
import { MdOutlineAttachFile } from "react-icons/md";

function ChatBox({ 
  messages, 
  text, 
  setText, 
  sendMessage, 
  handleFileChange, 
  fileName, 
  sendFile,
  fileProgress 
}) {
  const bottomRef = useRef();

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col justify-end">
      {/* Message History */}
      <div
        id="message-history"
        className="flex flex-col justify-end w-full min-h-[400px] overflow-scroll"
      >
        {messages.map((message, index) => (
          <Messages
            key={index}
            message={message}
            className="mx-4 my-2 px-4 py-2 w-fit rounded text-white font-semibold"
          />
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* File Preview */}
      {fileName && (
        <div className="w-fit flex flex-col p-4 top-0 border-2 border-gray-400 left-0 backdrop-blur-md z-10 justify-evenly items-center">
          <div className="border-2 border-gray-400 flex flex-row justify-center items-center p-4 m-4">
            <MdOutlineAttachFile className="text-4xl text-gray-300" />
          </div>
          <p>{fileName}</p>
          <button
            onClick={sendFile}
            className="border-[1px] border-gray-400 rounded-lg px-4 py-2 m-4 hover:bg-gray-300 hover:text-[#181818] transition-all delay-75"
          >
            Send File
          </button>
        </div>
      )}

      {/* Input Section */}
      <form
        id="message-box"
        className="w-full flex flex-col justify-between px-4 py-2 rounded-2xl border-b-0 border-x-0 border-[1px] border-gray-400"
        onSubmit={sendMessage}
      >
        <textarea
          id="type-message"
          placeholder="Message"
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full my-4 px-2 h-[100px] text-start overflow-y-auto rounded resize-none bg-[#111111]"
        ></textarea>

        <div className="flex flex-row justify-between rounded-xl">
          <div className="text-center items-center flex flex-col justify-center rounded-full hover:bg-gray-800 transition-all delay-75">
            <input
              className="hidden"
              id="file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="file">
              <MdOutlineAttachFile className="text-white mx-2 cursor-pointer text-3xl" />
            </label>
            {fileProgress > 0 && <progress value={fileProgress} max="100" />}
          </div>

          <button
            id="send-message"
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-gray-100 font-semibold h-fit self-center py-3 px-4 rounded-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

ChatBox.propTypes = {
  messages: PropTypes.array.isRequired,
  text: PropTypes.string.isRequired,
  setText: PropTypes.func.isRequired,
  sendMessage: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  fileName: PropTypes.string,
  sendFile: PropTypes.func.isRequired,
  fileProgress: PropTypes.number
};

export default ChatBox;
