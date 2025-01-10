import PropTypes from 'prop-types';

function VideoCall({ myStream, remoteStream, remoteEmail, className }) {
    return (
        <div className={className}>
            {remoteStream ? (
                <div className="flex flex-col items-center text-center">
                    <video
                        ref={(ref) => {
                            if (ref) ref.srcObject = remoteStream;
                        }}
                        autoPlay
                        muted
                        className="lg:w-[600px] max-lg:w-full rounded-2xl shadow-lg border-gray-300 border-[2px] m-4"
                    />
                    <p>Remote Stream</p>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <div
                        className={`lg:w-[600px] max-lg:w-full rounded-2xl shadow-lg border-gray-300 border-2 m-4 lg:h-[200px] flex flex-row items-center justify-center`}
                    >
                        Calling {remoteEmail}
                        
                    </div>
                    <p>Remote Stream</p>
                </div>
            )}
            {myStream && (
                <div className="flex flex-col items-center text-center ">
                    <video
                        ref={(ref) => {
                            if (ref) ref.srcObject = myStream;
                        }}
                        autoPlay
                        muted
                        className="rounded-lg shadow-lg border-gray-300 border-[2px] m-4 lg:h-[200px] max-lg:w-[50%]"
                    />
                    <p>My Stream</p>
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
