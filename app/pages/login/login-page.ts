import { NavigatedData, Page } from '@nativescript/core';
import { LoginViewModel } from './login-view-model';
import { AuthService } from '../../services/auth.service';

export function onNavigatingTo(args: NavigatedData) {
  const page = <Page>args.object;
  const authService = new AuthService();
  page.bindingContext = new LoginViewModel(authService);
}