// Defines all route names and their params
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  CollectorAssignment: { eventId: string };
  GuestlistCollection: { collectorToken: string };
  ForgotPassword: undefined;
  ResetPassword: undefined;
};
