import { Application } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import { DatabaseService } from './services/database.service';

// Initialize database
const databaseService = new DatabaseService();
databaseService.init()
  .then(() => console.log('Database initialized successfully'))
  .catch(error => console.error('Database initialization error:', error));

// Initialize Firebase
firebase.initializeApp()
  .then(() => console.log('Firebase initialized successfully'))
  .catch(error => console.error('Firebase initialization error:', error));

Application.run({ moduleName: 'app-root' });