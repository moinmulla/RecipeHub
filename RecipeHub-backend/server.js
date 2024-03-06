const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider } = require('firebase/auth');
const { initializeApp } = require('firebase/app');

const firebaseConfig = {
  apiKey: "AIzaSyBmsTDH6-zlRAq5KWwLYwabVFzWJoDcaj4",
  authDomain: "recipehub-007.firebaseapp.com",
  projectId: "recipehub-007",
  storageBucket: "recipehub-007.appspot.com",
  messagingSenderId: "899551153084",
  appId: "1:899551153084:web:a9fd778f19e4313621f9b9",
  measurementId: "G-NTVKB08LGH"
};

const app = express();
app.use(cors({
  origin: ['http://localhost:3000','https://api.spoonacular.com'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type, Custom-Header',
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Custom-Header, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

const app1 = initializeApp(firebaseConfig);

const PORT = process.env.PORT || 3001;
const apiKey="c2557369f6f24c7a8b6aff9e1c655476";

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const auth = getAuth();
  await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      res.status(200).json({success:true});
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Error signing in:', errorCode, errorMessage);
      res.redirect('/?error=' + encodeURIComponent(errorMessage));
    });

});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const auth = getAuth();
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      res.json({success:true});
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Error signing in:', errorCode, errorMessage);
      res.redirect('/?error=' + encodeURIComponent(errorMessage));
    });

});


app.get('/logout',(req,res) => {
  const auth = getAuth();
  signOut(auth).then(() => {
    res.redirect('http://localhost:3000/login');
  }).catch((error) => {
    res.status(401).json({message:"error logging out"})
    console.log("Error in Log out:"+err);
  });
})

app.post('/protected-route', async(req, res) => {
    const auth = getAuth();
    const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        res.status(200).json({ success: true, message: 'You are authenticated!', user: req.user });
      } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      }
});

app.post("/recipe",(req,res) => {
  let data1='';
  const ingredient = req.body.item;
  const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&addRecipeInformation=true&number=4&query=${ingredient}`;
  const request = https.request(url, response =>{
    response.setEncoding('utf8');
    response.on("data", data => { 
      data1+=data;
    });
    response.on('end', () => {
      res.send(data1);
    });
    })
    request.on('error', (error) => {
      console.error(error);
    });
    request.end();
})

app.post("/recipe-ingredient",(req,res) => {
  let data1='';
  const ingredient = req.body.item;
  const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&number=4&ingredients=${ingredient}`;
  const request = https.request(url, response =>{
      response.setEncoding('utf8');
      response.on("data", data => { 
        data1+=data;
      });
      response.on('end', () => {
        res.send(data1);
      });
    })
    request.on('error', (error) => {
      console.error(error);
    });
    request.end();
})

app.get('/',(req,res)=>{
  res.redirect('http://localhost:3000/');
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


module.exports = { app };