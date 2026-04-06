import PropTypes from "prop-types";

function VideoCall({ 
  myStream,
  remoteStream,
  remoteEmail,
  }) {

  return (
    <div className={`w-full flex flex-row justify-center py-4`}>
      {remoteStream ? (
        <div className="relative w-full max-w-4xl max-h-[650px] rounded-3xl overflow-hidden bg-black/50 border border-gray-700/50 shadow-[0_0_30px_rgba(20,184,166,0.15)] flex justify-center items-center">
          <video
            ref={(ref) => {
              if (ref) ref.srcObject = remoteStream;
            }}
            autoPlay
            muted
            className={`w-full max-h-[650px] object-contain`}
          />

          {myStream && (
            <div className="absolute overflow-hidden shadow-2xl border border-gray-600/80 bg-black/80 w-[28%] max-w-[200px] bottom-4 right-4 rounded-2xl z-20">
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
            className={`w-full max-w-3xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-gray-700/50 bg-white/5 backdrop-blur-md h-[55vh] m-2 flex flex-col items-center justify-center relative overflow-hidden`}
          >
           
            {myStream && (
            <div className="absolute bottom-4 right-4 w-[28%] max-w-[180px] rounded-2xl overflow-hidden shadow-2xl border border-gray-600/50 bg-black/80 z-20">
              <video
                ref={(ref) => {
                  if (ref) ref.srcObject = myStream;
                }}
                autoPlay
                
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            </div>
            
          )}

            <div className="flex flex-col items-center z-10 p-8 bg-black/40 rounded-3xl backdrop-blur-md border border-gray-700/50 shadow-2xl">
                <span className="w-16 h-16 rounded-full border-4 border-t-teal-500 border-r-teal-500 border-b-transparent border-l-transparent animate-spin mb-6 drop-shadow-[0_0_10px_rgba(20,184,166,0.8)]"></span>
                <span className="text-xl font-medium text-gray-200 tracking-wide">Calling <span className="text-teal-400 font-bold">{remoteEmail}</span>...</span>
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
