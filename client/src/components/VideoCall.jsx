import PropTypes from "prop-types";

function VideoCall({ 
  myStream,
  remoteStream,
  remoteEmail,
  }) {

  return (
    <div className={`w-full flex flex-row justify-center py-4`}>
      {remoteStream ? (
        <div className="relative w-full max-w-4xl max-h-[650px] overflow-hidden bg-zinc-950 border border-zinc-800 flex justify-center items-center">
          <video
            ref={(ref) => {
              if (ref) ref.srcObject = remoteStream;
            }}
            autoPlay
            muted
            className={`w-full max-h-[650px] object-contain`}
          />

          {myStream && (
            <div className="absolute overflow-hidden border border-zinc-700 bg-zinc-950 w-[28%] max-w-[200px] bottom-4 right-4 z-20">
              <video
                ref={(ref) => {
                  if (ref) ref.srcObject = myStream;
                  
                }}
                autoPlay
               
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col w-full items-center relative px-2">
          <div
            className={`w-full max-w-3xl border border-zinc-800 bg-zinc-950 h-[55vh] m-2 flex flex-col items-center justify-center relative overflow-hidden`}
          >
           
            {myStream && (
            <div className="absolute bottom-4 right-4 w-[28%] max-w-[180px] overflow-hidden border border-zinc-700 bg-zinc-950 z-20">
              <video
                ref={(ref) => {
                  if (ref) ref.srcObject = myStream;
                }}
                autoPlay
                
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            </div>
            
          )}

            <div className="flex flex-col items-center z-10 p-8 bg-zinc-900 border border-zinc-700">
                <span className="w-16 h-16 border-4 border-t-teal-500 border-r-teal-500 border-b-transparent border-l-transparent animate-spin mb-6"></span>
                <span className="text-xl font-medium text-gray-200 tracking-wide uppercase">Calling <span className="text-teal-400 font-bold">{remoteEmail}</span>...</span>
            </div>
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
