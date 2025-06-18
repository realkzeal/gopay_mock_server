// api/index.js - Complete Mock Server for Vercel
const { parse } = require('url');

// Mock Database - In production, replace with real database
let mockDB = {
  users: [
    {
      id: 1,
      full_name: "John Doe",
      email: "john@example.com",
      password: "password123",
      phone: "+1234567890",
      home_address: "123 Main St, New York, NY",
      createdAt: "2024-01-01T00:00:00.000Z",
      business_profiles: [
        {
          id: 1,
          business_name: "John's Restaurant",
          business_type: "restaurant",
          address: "456 Food St, New York, NY"
        }
      ]
    },
    {
      id: 2,
      full_name: "Jane Smith",
      email: "jane@example.com",
      password: "password456",
      phone: "+1987654321",
      home_address: "789 Oak Ave, Los Angeles, CA",
      createdAt: "2024-01-02T00:00:00.000Z",
      business_profiles: []
    }
  ],
  
  partners: [
    {
      id: 1,
      name: "Pizza Palace",
      email: "pizza@palace.com",
      phone: "+1555123456",
      address: "123 Pizza St, Chicago, IL",
      business_type: "restaurant",
      status: "active",
      rating: 4.5,
      createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
      id: 2,
      name: "Burger King",
      email: "info@burgerking.com",
      phone: "+1555987654",
      address: "456 Burger Ave, Miami, FL",
      business_type: "restaurant",
      status: "active",
      rating: 4.2,
      createdAt: "2024-01-02T00:00:00.000Z"
    }
  ],

  products: [
    {
      id: 1,
      name: "Margherita Pizza",
      description: "Fresh tomatoes, mozzarella, and basil",
      price: 18.99,
      category: "pizza",
      partnerId: 1,
      image: "https://via.placeholder.com/300x200",
      available: true,
      createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
      id: 2,
      name: "Pepperoni Pizza",
      description: "Classic pepperoni with mozzarella cheese",
      price: 21.99,
      category: "pizza",
      partnerId: 1,
      image: "https://via.placeholder.com/300x200",
      available: true,
      createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
      id: 3,
      name: "Whopper Burger",
      description: "Flame-grilled beef patty with fresh toppings",
      price: 12.99,
      category: "burger",
      partnerId: 2,
      image: "https://via.placeholder.com/300x200",
      available: true,
      createdAt: "2024-01-02T00:00:00.000Z"
    }
  ],

  orders: [
    {
      id: 1,
      userId: 1,
      partnerId: 1,
      status: "delivered",
      items: [
        {
          productId: 1,
          name: "Margherita Pizza",
          quantity: 2,
          price: 18.99,
          total: 37.98
        }
      ],
      subtotal: 37.98,
      tax: 3.04,
      deliveryFee: 2.99,
      total: 44.01,
      deliveryAddress: "123 Main St, New York, NY",
      createdAt: "2024-01-01T12:00:00.000Z",
      updatedAt: "2024-01-01T13:30:00.000Z"
    },
    {
      id: 2,
      userId: 2,
      partnerId: 2,
      status: "pending",
      items: [
        {
          productId: 3,
          name: "Whopper Burger",
          quantity: 1,
          price: 12.99,
          total: 12.99
        }
      ],
      subtotal: 12.99,
      tax: 1.04,
      deliveryFee: 2.99,
      total: 17.02,
      deliveryAddress: "789 Oak Ave, Los Angeles, CA",
      createdAt: "2024-01-02T14:00:00.000Z",
      updatedAt: "2024-01-02T14:00:00.000Z"
    }
  ],

  categories: [
    { id: 1, name: "Pizza", icon: "🍕" },
    { id: 2, name: "Burger", icon: "🍔" },
    { id: 3, name: "Asian", icon: "🍜" },
    { id: 4, name: "Dessert", icon: "🍰" }
  ]
};

// Helper function to get request body
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Helper function to generate unique ID
function generateId(collection) {
  const ids = collection.map(item => item.id);
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Main handler function
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname, query } = parse(req.url, true);
  const method = req.method;

  try {
    // ===================
    // CUSTOM AUTH ROUTES
    // ===================
    
    // Mobile app login
    if (pathname === '/mobile_app/login' && method === 'POST') {
      const { email, password } = await getRequestBody(req);
      
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          responseCode: 400,
          message: 'Email and password are required',
          data: null
        });
      }

      const user = mockDB.users.find(u => u.email === email && u.password === password);

      if (!user) {
        return res.status(401).json({
          status: 'error',
          responseCode: 401,
          message: 'Invalid email or password',
          data: null
        });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.json({
        status: 'success',
        responseCode: 200,
        message: 'Login successful',
        data: { user: userWithoutPassword }
      });
    }

    // Mobile app registration
    if (pathname === '/mobile_app/register' && method === 'POST') {
      const { full_name, email, password, phone, home_address } = await getRequestBody(req);
      
      // Validation
      if (!full_name || !email || !password) {
        return res.status(400).json({
          status: "error",
          responseCode: 400,
          message: "Full name, email, and password are required",
          data: null
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          status: "error",
          responseCode: 400,
          message: "Please provide a valid email address",
          data: null
        });
      }
      
      // Check if user already exists
      const existingUser = mockDB.users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          responseCode: 400,
          message: "A user with this email already exists",
          data: null
        });
      }
      
      // Create new user
      const newUser = {
        id: generateId(mockDB.users),
        full_name,
        email,
        password,
        phone: phone || '',
        home_address: home_address || '',
        createdAt: new Date().toISOString(),
        business_profiles: []
      };
      
      mockDB.users.push(newUser);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      
      return res.status(201).json({
        status: "success",
        responseCode: 201,
        message: "User registered successfully",
        data: { user: userWithoutPassword }
      });
    }

    // ===================
    // UTILITY ROUTES
    // ===================
    
    // Echo endpoint for testing
    if (pathname === '/echo' && method === 'GET') {
      return res.json({ 
        message: 'Echo endpoint working',
        query,
        timestamp: new Date().toISOString()
      });
    }

    // Health check
    if (pathname === '/health' && method === 'GET') {
      return res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    }

    // ===================
    // REST API ROUTES
    // ===================
    
    // Handle API routes
    if (pathname.startsWith('/api/')) {
      const pathParts = pathname.split('/').filter(Boolean);
      const resource = pathParts[1]; // Skip 'api'
      const id = pathParts[2] ? parseInt(pathParts[2]) : null;

      if (!mockDB[resource]) {
        return res.status(404).json({ 
          error: `Resource '${resource}' not found`,
          availableResources: Object.keys(mockDB)
        });
      }

      switch (method) {
        case 'GET':
          if (id) {
            // Get single item
            const item = mockDB[resource].find(item => item.id === id);
            if (item) {
              return res.json(item);
            } else {
              return res.status(404).json({ error: `${resource} with id ${id} not found` });
            }
          } else {
            // Get collection with filtering and pagination
            let data = [...mockDB[resource]];
            
            // Apply filters
            Object.entries(query).forEach(([key, value]) => {
              if (!['_limit', '_page', '_sort', '_order'].includes(key)) {
                data = data.filter(item => {
                  if (item[key] === undefined) return false;
                  return item[key].toString().toLowerCase().includes(value.toLowerCase());
                });
              }
            });

            // Apply sorting
            if (query._sort) {
              const sortField = query._sort;
              const sortOrder = query._order === 'desc' ? -1 : 1;
              data.sort((a, b) => {
                if (a[sortField] < b[sortField]) return -1 * sortOrder;
                if (a[sortField] > b[sortField]) return 1 * sortOrder;
                return 0;
              });
            }

            // Apply pagination
            const totalCount = data.length;
            if (query._page && query._limit) {
              const page = parseInt(query._page);
              const limit = parseInt(query._limit);
              const start = (page - 1) * limit;
              const end = start + limit;
              data = data.slice(start, end);
              
              res.setHeader('X-Total-Count', totalCount);
              res.setHeader('X-Page', page);
              res.setHeader('X-Per-Page', limit);
            } else if (query._limit) {
              const limit = parseInt(query._limit);
              data = data.slice(0, limit);
            }

            return res.json(data);
          }

        case 'POST':
          const newItem = await getRequestBody(req);
          newItem.id = generateId(mockDB[resource]);
          newItem.createdAt = new Date().toISOString();
          newItem.updatedAt = new Date().toISOString();
          
          mockDB[resource].push(newItem);
          return res.status(201).json(newItem);

        case 'PUT':
        case 'PATCH':
          if (!id) {
            return res.status(400).json({ error: 'ID required for update' });
          }
          
          const itemIndex = mockDB[resource].findIndex(item => item.id === id);
          if (itemIndex === -1) {
            return res.status(404).json({ error: `${resource} with id ${id} not found` });
          }
          
          const updates = await getRequestBody(req);
          updates.updatedAt = new Date().toISOString();
          
          if (method === 'PATCH') {
            mockDB[resource][itemIndex] = { ...mockDB[resource][itemIndex], ...updates };
          } else {
            mockDB[resource][itemIndex] = { id, createdAt: mockDB[resource][itemIndex].createdAt, ...updates };
          }
          
          return res.json(mockDB[resource][itemIndex]);

        case 'DELETE':
          if (!id) {
            return res.status(400).json({ error: 'ID required for deletion' });
          }
          
          const deleteIndex = mockDB[resource].findIndex(item => item.id === id);
          if (deleteIndex === -1) {
            return res.status(404).json({ error: `${resource} with id ${id} not found` });
          }
          
          const deletedItem = mockDB[resource].splice(deleteIndex, 1)[0];
          return res.json(deletedItem);

        default:
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    }

    // ===================
    // ROOT ROUTE
    // ===================
    
    if (pathname === '/' && method === 'GET') {
      return res.json({
        message: 'Mock Server API',
        version: '1.0.0',
        endpoints: {
          auth: [
            'POST /mobile_app/login',
            'POST /mobile_app/register'
          ],
          api: [
            'GET /api/users',
            'GET /api/partners', 
            'GET /api/products',
            'GET /api/orders',
            'GET /api/categories'
          ],
          utils: [
            'GET /echo',
            'GET /health'
          ]
        },
        totalRecords: {
          users: mockDB.users.length,
          partners: mockDB.partners.length,
          products: mockDB.products.length,
          orders: mockDB.orders.length,
          categories: mockDB.categories.length
        }
      });
    }

    // 404 for unmatched routes
    return res.status(404).json({ 
      error: 'Route not found',
      availableRoutes: ['/', '/health', '/echo', '/mobile_app/login', '/mobile_app/register', '/api/*']
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};