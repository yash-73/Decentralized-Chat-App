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
                className={`p-4 flex items-center justify-center transition-colors border ${isAudioEnabled ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white' : 'bg-red-500 hover:bg-red-400 border-red-500 text-zinc-950'}`}
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
                className="p-4 flex items-center justify-center bg-red-600 hover:bg-red-500 text-white transition-colors border border-red-500 z-10"
                title="End Call"
            >
                <MdCallEnd className="text-4xl" />
            </button>

            <button
                className={`p-4 flex items-center justify-center transition-colors border ${isVideoEnabled ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white' : 'bg-red-500 hover:bg-red-400 border-red-500 text-zinc-950'}`}
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
