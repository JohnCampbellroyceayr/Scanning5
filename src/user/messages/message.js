export default function newMessage(message, success = true, error = false, args = null) {
    const sendMessage = {
        message: message,
        success: success,
        error: error,
    }
    if(args !== null) {
        sendMessage.args = args;
    }
    return sendMessage;
}