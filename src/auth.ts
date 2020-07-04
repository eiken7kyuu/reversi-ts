import firebase, { initializeApp } from 'firebase/app';
import 'firebase/auth';

function fireBaseInit() {
  const firebaseConfig = {
    apiKey: "AIzaSyADdBYFkeb8WMd3SjciIaNMxTPWZLpY1AU",
    authDomain: "reversi-8ed06.firebaseapp.com",
    databaseURL: "https://reversi-8ed06.firebaseio.com",
    projectId: "reversi-8ed06",
    storageBucket: "reversi-8ed06.appspot.com",
    messagingSenderId: "1087555257346",
    appId: "1:1087555257346:web:cafa609335bf7c6607d31b",
    measurementId: "G-4D7VXBS2CV"
  };

  initializeApp(firebaseConfig);
}


export function getUid(): Promise<string> {
  return new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) { 
        reject('error');
        return;
       }

      resolve(user.uid);
    });
  });
}

export async function firebaseAuth() {
  await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(async () => {
    return await firebase.auth().signInAnonymously();
  })
  .catch(error => {
    console.log(`errorcode: ${error.code}`);
    console.log(error.message);
  });
}

fireBaseInit();