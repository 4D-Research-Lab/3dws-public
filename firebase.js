
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
const app = firebase.initializeApp({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
});


export const auth = app.auth();
export { firebase }

export default app;


