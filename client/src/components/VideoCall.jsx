import PropTypes from "prop-types";

function VideoCall({ myStream, remoteStream, remoteEmail }) {

  return (
    <div className={`w-full flex flex-row justify-center py-8 `}>
      {remoteStream ? (
        <div className=" relative">
          <video
            ref={(ref) => {
              if (ref) ref.srcObject = remoteStream;
            }}
            autoPlay
            muted
            className={`rounded-3xl max-h-[500px] border-gray-300 border-2`}
          />

          {myStream && (
            <div className=" md:absolute flex flex-col items-center text-center md:w-[30%]  bottom-0 right-0 ">
              <video
                ref={(ref) => {
                  if (ref) ref.srcObject = myStream;
                  
                }}
                autoPlay
                muted
                className="rounded-lg shadow-lg border-black border-2"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col w-full items-center relative px-4 ">
          <div
            className={`w-full  rounded-2xl shadow-lg border-gray-300 h-[60vh] border-2 m-4  flex flex-col items-center justify-center `}
          >
           
            {myStream && (
            <div className="flex flex-col items-center text-center absolute bottom-0 right-0 ">
              <video
                ref={(ref) => {
                  if (ref) ref.srcObject = myStream;
                }}
                autoPlay
                muted
                className="rounded-lg shadow-lg border-gray-300 border-[2px] m-4 lg:h-[200px] max-lg:w-[50%]"
              />
            </div>
            
          )}

            Calling {remoteEmail}
          </div>
        </div>
      )}
    </div>
  );
}

// Props validation
VideoCall.propTypes = {
  myStream: PropTypes.instanceOf(MediaStream), // `MediaStream` instance
  remoteStream: PropTypes.instanceOf(MediaStream), // `MediaStream` instance
  remoteEmail: PropTypes.string.isRequired, // Required string
  className: PropTypes.string, // Optional string
};

export default VideoCall;
