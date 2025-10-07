// src/navigation/types.ts

/**  
 * RootStackParamList maps each screen name  
 * to its route parameters.  
 */
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  CollectorAssignment: { eventId: string };
  GuestlistCollection: { collectorToken: string };
};

