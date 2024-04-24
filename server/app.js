const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();


//check 
const checkAuthorization = async ( req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) {
    res.status(401).send("Unauthorized");
    return;
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken) {
      req.uid = decodedToken.uid;
      const userClaims = await admin.auth().getUser(decodedToken.uid);
      if (userClaims.customClaims && userClaims.customClaims.admin) {
        req.isAdmin = true;
      } else {
        req.isAdmin = false;
      }
      next();
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (e) {
    console.error('Error while verifying Firebase ID token:');
    res.status(401).send("Unauthorized");
  }
};

//admin config
const makeUserAdmin = async (uid) => {
  try {
    const user = await admin.auth().getUser(uid);
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`User with UID ${uid} and email ${user.email} has been granted admin privileges.`);
  } catch (error) {
    console.error('Error setting custom claim:', error);
  }
};

app.post('/verify-admin', checkAuthorization, (req, res) => {
  if (req.isAdmin) {
    res.json({ isAdmin: true });
  } else {
    res.json({ isAdmin: false });
  }
});


const moviesRouter = require("./routers/moviesRouter")(firestore,checkAuthorization);
const usersRouter = require("./routers/usersRouter")(firestore, checkAuthorization, admin);
const fakerRouter = require("./routers/fakerRouter")(firestore,checkAuthorization);

app.use(moviesRouter); 
app.use(usersRouter); 
app.use(fakerRouter);


const targetUid = 'qZIJ3ZdhOsWMl2YDuJtaHRv5fmc2';
makeUserAdmin(targetUid);

app.listen(4000, () => console.log("Up & Running on port 4000"));