import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!navigator.onLine) {
        alert('No internet connection. Please check your network.');
      } else if (error.status === 0) {
        alert('The server is currently unavailable. Please try again later.');
      } else if (error.status === 500) {
        alert('An error occurred on the server. Please try again later.');
      }

      return throwError(() => error);
    })
  );
};
