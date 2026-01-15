export const MessagePatterns = {
    USER_SERVICE: {
        REGISTER_USER: { cmd: 'register_user' },
        VALIDATE_USER: { cmd: 'validate_user' },
        GET_PROFILE: { cmd: 'user_profile' },
        UPDATE_USER_ROLE: { cmd: 'update_user_role' },
    },
    NOTIFICATION_SERVICE: {
        SEND_NOTIFICATION: 'send_notification',
    },
    VENDOR_SERVICE: {
        CREATE_VENDOR: { cmd: 'create_vendor' },
        GET_VENDOR_BY_USER_ID: { cmd: 'get_vendor_by_user_id' },
        GET_VENDOR_BY_ID: { cmd: 'get_vendor_by_id' },
        VALIDATE_VENDOR: { cmd: 'validate_vendor' },
    },
    RIDER_SERVICE: {
        CREATE_RIDER: { cmd: 'create_rider' },
        VALIDATE_RIDER: { cmd: 'validate_rider' },
        GET_RIDER_BY_ID: { cmd: 'get_rider_by_id' },
        GET_RIDER_PROFILE: { cmd: 'get_rider_profile' },
        UPDATE_RIDER_STATUS: { cmd: 'update_rider_status' },
        UPDATE_RIDER_LOCATION: { cmd: 'update_rider_location' },
        UPDATE_RIDER_PROFILE: { cmd: 'update_rider_profile' },
        GET_AVAILABLE_RIDERS: { cmd: 'get_available_riders' },
        GET_NEARBY_RIDERS: { cmd: 'get_nearby_riders' },
    },
}