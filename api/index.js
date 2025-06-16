const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Parse JSON bodies
server.use(jsonServer.bodyParser);

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp(req.query);
});

// Use default router
server.use('/api', router);

server.post('/mobile_app/login', (req, res) => {
    const {email, password} = req.body;
    const db = router.db;
    const users = db.get('users').value();

    const user = users.find(u => u.email === email && u.password === password);

    if(!user) {
      return res.status(401).jsonp({
        status: 'error', 
        responseCode: 401,
        message: 'Invalid email or password',
        data: null
      });
    }

    if(user.password !== password) {
        return res.status(401).jsonp({
          status: 'error', 
          responseCode: 401,
          message: 'Invalid email or password',
          data: null
        });
    }
 
    res.jsonp({status: 'success', user});
  
  });

  // Custom route for mobile app registration
server.post('/mobile_app/register', (req, res) => {
  const { full_name, email, password, phone, home_address } = req.body;
  
  const db = router.db;
  const users = db.get('users').value();
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      status: "error",
      responseCode: "400",
      message: "A user with this email already exists",
      data: null
    });
  }
  
  // Create new user with empty business profiles
  const newUser = {
    id: Date.now(),
    full_name,
    email,
    password, // In real app, hash this!
    phone,
    home_address,
    createdAt: new Date().toISOString(),
    business_profiles: [] // Start with empty profiles
  };
  
  // Add to database
  db.get('users').push(newUser).write();
  
  res.status(201).json({
    status: "success",
    responseCode: "201",
    message: "User registered successfully",
    data: {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email
    }
  });
});

module.exports = server;
module.exports.handler = serverless(app);