import PropTypes from 'prop-types';

function Messages({ message, className }) {
    return (
        <div 
            
            className={`${message.yours ? 'bg-blue-500 self-end' : 'bg-green-600 self-start'} ${className} max-w-[50%]`}
        >
            {message.value}
        </div>
    );
}

// Props validation
Messages.propTypes = {
    message: PropTypes.shape({
        yours: PropTypes.bool.isRequired,
        value: PropTypes.string.isRequired,
    }).isRequired,
    className: PropTypes.string,
};



export default Messages;
