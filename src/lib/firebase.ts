/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDso2Dp_BWFfOi2nm3lbfE3GuK50uU8wDk',
  authDomain: 'family-task-manager-ab5eb.firebaseapp.com',
  projectId: 'family-task-manager-ab5eb',
  storageBucket: 'family-task-manager-ab5eb.firebasestorage.app',
  messagingSenderId: '610979676329',
  appId: '1:610979676329:web:5639a5683e20d741eba9b8'
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);
