import { useContext, useState } from 'react';
import { FaVolumeMute, FaVideo, FaVideoSlash } from 'react-icons/fa';
import { MdCallEnd } from 'react-icons/md';
import { VscUnmute } from 'react-icons/vsc';
import { SocketContext } from '../provider/Socket';
import PropTypes from 'prop-types';

function VideoCallButtons({ 
    myStream,
    remoteSocketId,
    endCall,
    className,
}) {
    
  // Optional stringv
   const [isAudioEnabled, setIsAudioEnabled] = useState(true);
   const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const socket = useContext(SocketContext);

    const handleEndCall = (e) => {
        e.preventDefault();
        endCall();
        // Optionally notify the remote user
        if (socket && remoteSocketId) {
            socket.emit('end-call', { to: remoteSocketId });
        }
    };

    const toggleVideo = () => {
        if (myStream) {
            const videoTracks = myStream.getVideoTracks();
            videoTracks.forEach((track) => {
                track.enabled = !track.enabled; // Toggle the video track's enabled state
            });
            setIsVideoEnabled((prev) => !prev); // Update the state
        }
    };

    const toggleAudio = () => {
        if (myStream) {
            const audioTracks = myStream.getAudioTracks();
            audioTracks.forEach((track) => {
                track.enabled = !track.enabled; // Toggle the audio track's enabled state
            });
            setIsAudioEnabled((prev) => !prev); // Update the state
        }
    };

    return (
        <div className={`flex flex-row justify-center gap-4 sm:gap-8 items-center ${className} py-4 my-2`}>
            <button
                className={`rounded-full p-4 flex items-center justify-center transition-all duration-300 shadow-lg border ${isAudioEnabled ? 'bg-gray-800/80 hover:bg-gray-700 border-gray-700/50 text-white' : 'bg-red-500/90 hover:bg-red-500 border-red-500/50 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
                onClick={toggleAudio}
                title={isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}
            >
                {isAudioEnabled ? (
                    <VscUnmute className="text-2xl" />
                ) : (
                    <FaVolumeMute className="text-2xl" />
                )}
            </button>
            
            <button
                onClick={handleEndCall}
                className="rounded-full p-4 drop-shadow-2xl flex items-center justify-center bg-red-600/90 hover:bg-red-500 text-white transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:scale-110 active:scale-95 border border-red-500/50 z-10"
                title="End Call"
            >
                <MdCallEnd className="text-4xl" />
            </button>

            <button
                className={`rounded-full p-4 flex items-center justify-center transition-all duration-300 shadow-lg border ${isVideoEnabled ? 'bg-gray-800/80 hover:bg-gray-700 border-gray-700/50 text-white' : 'bg-red-500/90 hover:bg-red-500 border-red-500/50 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
                onClick={toggleVideo}
                title={isVideoEnabled ? "Disable Camera" : "Enable Camera"}
            >
                {isVideoEnabled ? (
                    <FaVideo className="text-2xl" />
                ) : (
                    <FaVideoSlash className="text-2xl" />
                )}
            </button>
        </div>
    );
}

// Props validation
VideoCallButtons.propTypes = {
    myStream: PropTypes.instanceOf(MediaStream), 
    remoteSocketId: PropTypes.string, 
    endCall: PropTypes.func.isRequired,
    className: PropTypes.string,
};



export default VideoCallButtons;
