const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Server Variable Structure to store user data
const users = [
  {
    username: 'alice',
    password: '$2b$10$g3H3NBOQOk6CO6TKKbPpru5V/T92OeW0a5cI/EEyM3EM.6Ro3i77R6', // hashed 'password'
  },
  // Add more user objects as needed
];

// Initialize sessions
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Middleware to check if a user is authenticated
const authenticateUser = (req, res, next) => {
  if (req.session && req.session.userId) {
    // User is authenticated
    next();
  } else {
    res.redirect('/login');
  }
};

// Route for the registration form
app.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration form submission
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if the username already exists
  const userExists = users.some(user => user.username === username);

  if (userExists) {
    res.send('Username already exists. Please choose a different username.');
  } else {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store the user in the server variable
    users.push({ username, password: hashedPassword });
    res.redirect('/login');
  }
});

// Route for the login form
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user by username
  const user = users.find(user => user.username === username);

  if (user && await bcrypt.compare(password, user.password)) {
    // Successful login
    req.session.userId = user.username; // Store the unique identifier in the session
    res.cookie('sessionId', req.session.id); // Set a session cookie
    res.redirect('/protected');
  } else {
    res.send('Invalid username or password');
  }
});

// Protected route
app.get('/protected', authenticateUser, (req, res) => {
  res.send(`Welcome, ${req.session.userId}! This is a protected route.`);
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    }
    res.clearCookie('sessionId');
    res.redirect('/login');
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
