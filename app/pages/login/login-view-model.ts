import { Observable } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { AuthService } from '../../services/auth.service';
import { Validators } from '../../utils/validators';
import { APP_CONSTANTS } from '../../utils/constants';

export class LoginViewModel extends Observable {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService) {
    super();
  }

  async onLogin() {
    if (!this.validateInput()) {
      return;
    }

    this.set('isLoading', true);
    this.set('errorMessage', '');

    try {
      await this.authService.login(this.email, this.password);
      Frame.topmost().navigate({
        moduleName: APP_CONSTANTS.ROUTES.DASHBOARD,
        clearHistory: true
      });
    } catch (error) {
      this.set('errorMessage', 'Invalid email or password');
    } finally {
      this.set('isLoading', false);
    }
  }

  onSkipLogin() {
    Frame.topmost().navigate({
      moduleName: APP_CONSTANTS.ROUTES.DASHBOARD,
      clearHistory: true
    });
  }

  private validateInput(): boolean {
    if (!Validators.isValidEmail(this.email)) {
      this.set('errorMessage', 'Please enter a valid email address');
      return false;
    }

    if (!this.password || this.password.length < 6) {
      this.set('errorMessage', 'Password must be at least 6 characters long');
      return false;
    }

    return true;
  }
}