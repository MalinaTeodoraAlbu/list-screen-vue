import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyBgZZ8MzAtAT07nMA5AVWt-blYwt9xQNYs",
    authDomain: "listscreen-145cd.firebaseapp.com",
    projectId: "listscreen-145cd",
    storageBucket: "listscreen-145cd.appspot.com",
    messagingSenderId: "381618831088",
    appId: "1:381618831088:web:234e79172a44c803d38c35"
  };


firebase.initializeApp(firebaseConfig)

const projectAuth = firebase.auth()
const projectFirestore = firebase.firestore()
const projectStorage = firebase.storage()

const timestamp = firebase.firestore.FieldValue.serverTimestamp

export { projectAuth, projectFirestore,projectStorage, timestamp }