/**
 * Port assignments for all services and gateways
 */
export enum ServicePort {
  // Gateways
  GATEWAY = 3000,
  RIDER_GATEWAY = 3004,
  VENDOR_GATEWAY = 3005,

  // Microservices
  USER_SERVICE = 3001,
  NOTIFICATION_SERVICE = 3002,
  VENDOR_SERVICE = 3003,
  RIDER_SERVICE = 3101,
  ORDER_SERVICE = 3102,
  MENU_SERVICE = 3103,
  DELIVERY_SERVICE = 3104,
  LOCATION_SERVICE = 3105,
}
