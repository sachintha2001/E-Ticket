import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // We are now using Firebase SDK for database calls which handles auth internally.
  // If you add a custom REST API later, you can get the token from Firebase Auth here.
  return next(req);
};
