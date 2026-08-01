import app, { db, auth, storage } from "./lib/firebase";
import { Analytics, getAnalytics, isSupported } from "firebase/analytics";

export { app, db, auth, storage };

export let analytics: Analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

