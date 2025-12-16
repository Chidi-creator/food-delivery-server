export const MessagePatterns = {
    USER_SERVICE: {
        REGISTER_USER: { cmd: 'register_user' },
        VALIDATE_USER: { cmd: 'validate_user' },
        GET_PROFILE: { cmd: 'user_profile' },
        UPDATE_USER_ROLE: { cmd: 'update_user_role' },
    },
    NOTIFICATION_SERVICE: {
        SEND_NOTIFICATION: { cmd: 'send_notification' },
    },
    VENDOR_SERVICE: {
        CREATE_VENDOR: { cmd: 'create_vendor' },
        GET_VENDOR_BY_USER_ID: { cmd: 'get_vendor_by_user_id' },
        VALIDATE_VENDOR: { cmd: 'validate_vendor' },
    },
}