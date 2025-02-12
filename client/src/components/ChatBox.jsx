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
        className="flex flex-col w-full max-md:h-[60vh] md:h-[60vh] overflow-y-scroll scroll-smooth bg-[#111111] p-2"
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
        className="w-full flex flex-col justify-between px-4  rounded-2xl border-b-0 border-x-0 border-[1px] border-gray-400"
        onSubmit={sendMessage}
      >
        <textarea
          id="type-message"
          placeholder="Message"
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
          className="w-full my-4 px-2 h-[100px] text-start overflow-y-auto rounded resize-none bg-[#111111] text-white"
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
};

export default ChatBox;