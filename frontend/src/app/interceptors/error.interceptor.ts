import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred. Please try again later.';

      if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network.';
      } else if (error.status === 0) {
        errorMessage = 'The server is currently unavailable. Please try again later.';
      } else if (error.status === 500) {
        errorMessage = 'An error occurred on the server. Please try again later.';
      }

        // Display the error message using MatSnackBar
        snackBar.open(errorMessage, 'Close', {
          duration: 5000, // Auto-dismiss after 5 seconds
          panelClass: ['error-snackbar'] 
        });

      return throwError(() => error);
    })
  );
};
