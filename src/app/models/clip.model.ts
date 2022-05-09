import firebase from 'firebase/compat/app';
export interface IClip {
  docID?: string;
  uid: string;
  displayName: string;
  title: string;
  url: string;
  fileName: string;
  timestamp: firebase.firestore.FieldValue;
  screenshotUrl: string;
  screenshotFileName: string;
}
