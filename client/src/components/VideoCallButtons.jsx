import { useContext, useState } from 'react';
import { FaVolumeMute, FaVideo, FaVideoSlash } from 'react-icons/fa';
import { FcEndCall } from 'react-icons/fc';
import { VscUnmute } from 'react-icons/vsc';
import { SocketContext } from '../provider/Socket';
import PropTypes from 'prop-types';

function VideoCallButtons({ myStream, remoteSocketId, endCall, className }) {
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

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
        <div className={`w-full flex flex-row justify-evenly h-[15vh] items-center ${className}`}>
            <button
                className="rounded-full p-3 m-2 flex flex-row  justify-evenly hover:bg-gray-800 transition-all delay-50"
                onClick={toggleAudio}
            >
                {isAudioEnabled ? (
                    <FaVolumeMute className="text-3xl" />
                ) : (
                    <VscUnmute className="text-3xl" />
                )}
            </button>
            <button
                className="rounded-full p-3 m-2 flex flex-row justify-evenly hover:bg-gray-800 transition-all delay-50"
                onClick={toggleVideo}
            >
                {isVideoEnabled ? (
                    <FaVideoSlash className="text-3xl" />
                ) : (
                    <FaVideo className="text-3xl" />
                )}
            </button>
            <button
                onClick={handleEndCall}
                className="rounded-full p-2 m-2 flex flex-row justify-evenly hover:bg-gray-800 transition-all delay-50"
            >
                <FcEndCall className="text-4xl" />
            </button>
        </div>
    );
}

// Props validation
VideoCallButtons.propTypes = {
    myStream: PropTypes.instanceOf(MediaStream), // `MediaStream` instance
    remoteSocketId: PropTypes.string, // Optional string
    endCall: PropTypes.func.isRequired, // Required function
    className: PropTypes.string, // Optional string
};



export default VideoCallButtons;
