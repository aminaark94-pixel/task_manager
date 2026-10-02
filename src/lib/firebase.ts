/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCIQQdOfHsx8-PbA43Z_JtCKfer-luPuhU',
  authDomain: 'task-manager-33038.firebaseapp.com',
  projectId: 'task-manager-33038',
  storageBucket: 'task-manager-33038.firebasestorage.app',
  messagingSenderId: '412671624515',
  appId: '1:412671624515:web:74c40d3dcb8997fad45bf6'
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);
