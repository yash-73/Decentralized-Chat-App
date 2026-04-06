import { useRef, useEffect } from "react";
import Messages from "../components/Messages";
import PropTypes from "prop-types";
import { MdOutlineAttachFile } from "react-icons/md";

function ChatBox({ messages, text, setText, sendMessage, handleFileChange }) {
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col justify-end h-full">
      {/* Message History */}
      <div
        id="message-history"
        className="flex flex-col w-full max-md:h-[50vh] h-[55vh] overflow-y-scroll scroll-smooth bg-black/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 mb-4"
      >
        {messages.map((message, index) => (
          <Messages
            key={index}
            message={message}
            className="mx-4 px-4 my-2 py-2 rounded text-white font-semibold"
          />
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* Input Section */}
      <form
        id="message-box"
        className="w-full flex flex-col justify-between bg-black/30 backdrop-blur-md rounded-2xl border border-gray-700/50 p-2"
        onSubmit={sendMessage}
      >
          <div className="flex flex-row items-center bg-black/20 rounded-xl border border-gray-700/50 pr-2 overflow-hidden focus-within:border-teal-500/50 focus-within:ring-1 focus-within:ring-teal-500/20 transition-all">
          <textarea
            id="type-message"
            placeholder="Type a message..."
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); 
                sendMessage(e);
              } else if (e.key === "Enter" && e.shiftKey) {
                setText((prev) => prev + "\n");
              }
            }}
            className="w-full p-4 h-[60px] text-start overflow-y-auto resize-none bg-transparent text-white outline-none placeholder-gray-500"
          ></textarea>

          <div className="flex items-center gap-2">
            <div className="text-center items-center flex flex-col justify-center rounded-full hover:bg-gray-700/50 transition-all delay-75 p-2">
              <input
                className="hidden"
                id="file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file" title="Attach file">
                <MdOutlineAttachFile className="text-gray-400 hover:text-white cursor-pointer text-2xl transition-colors" />
              </label>
            </div>

            <button
              id="send-message"
              type="submit"
              disabled={text.trim().length === 0}
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_20px_rgba(20,184,166,0.5)]"
            >
              Send
            </button>
          </div>
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
};

export default ChatBox;