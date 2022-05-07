import firebase from 'firebase/compat/app';
export interface IClip {
  uid: string;
  displayName: string;
  title: string;
  url: string;
  fileName: string;
  timestamp: firebase.firestore.FieldValue;
}
