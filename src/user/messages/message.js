export default function newMessage(message, success = true, error = false) {
    return {
        message: message,
        success: success,
        error: error
    }
}