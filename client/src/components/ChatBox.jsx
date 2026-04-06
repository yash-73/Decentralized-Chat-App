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
        className="flex flex-col w-full max-md:h-[50vh] h-[55vh] overflow-y-scroll scroll-smooth bg-zinc-950 border border-zinc-800 p-4 mb-4"
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
        className="w-full flex flex-col justify-between bg-zinc-950 border border-zinc-800 p-2"
        onSubmit={sendMessage}
      >
          <div className="flex flex-row items-center bg-zinc-900 border border-zinc-700 pr-2 overflow-hidden focus-within:border-teal-400 transition-colors">
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
            <div className="text-center items-center flex flex-col justify-center hover:bg-zinc-800 transition-colors p-2 cursor-pointer">
              <input
                className="hidden"
                id="file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file" title="Attach file">
                <MdOutlineAttachFile className="text-gray-400 hover:text-teal-400 cursor-pointer text-2xl transition-colors" />
              </label>
            </div>

            <button
              id="send-message"
              type="submit"
              disabled={text.trim().length === 0}
              className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold py-3 px-8 transition-colors uppercase tracking-wider"
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