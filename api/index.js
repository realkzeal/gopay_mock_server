// api/index.js - Main Vercel serverless function
export default function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, url, query, body } = req;
  const path = url.replace('/api', '');

  // Default delay (can be overridden with ?delay=ms query param)
  const delay = parseInt(query.delay) || 0;

  // Mock data store
  const mockData = {
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
    ],
    posts: [
      { id: 1, title: 'First Post', content: 'This is the first post', userId: 1, createdAt: '2024-01-01' },
      { id: 2, title: 'Second Post', content: 'This is the second post', userId: 2, createdAt: '2024-01-02' }
    ],
    products: [
      { id: 1, name: 'Laptop', price: 999.99, category: 'electronics', inStock: true },
      { id: 2, name: 'Phone', price: 599.99, category: 'electronics', inStock: false },
      { id: 3, name: 'Book', price: 19.99, category: 'books', inStock: true }
    ]
  };

  // Helper function to simulate delay
  const simulateDelay = (callback) => {
    if (delay > 0) {
      setTimeout(callback, delay);
    } else {
      callback();
    }
  };

  // Helper function to handle responses
  const sendResponse = (data, status = 200) => {
    simulateDelay(() => {
      res.status(status).json({
        success: status < 400,
        data,
        timestamp: new Date().toISOString(),
        method,
        path
      });
    });
  };

  // Helper function to send error
  const sendError = (message, status = 400) => {
    simulateDelay(() => {
      res.status(status).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
        method,
        path
      });
    });
  };

  // Route handlers
  try {
    // Health check
    if (path === '/health' || path === '/') {
      return sendResponse({ message: 'Mock server is running!' });
    }

    // Users endpoints
    if (path === '/users') {
      if (method === 'GET') {
        const { page = 1, limit = 10, role } = query;
        let users = mockData.users;
        
        if (role) {
          users = users.filter(user => user.role === role);
        }
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedUsers = users.slice(startIndex, endIndex);
        
        return sendResponse({
          users: paginatedUsers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: users.length,
            totalPages: Math.ceil(users.length / limit)
          }
        });
      }
      
      if (method === 'POST') {
        const newUser = {
          id: mockData.users.length + 1,
          ...body,
          createdAt: new Date().toISOString()
        };
        return sendResponse(newUser, 201);
      }
    }

    // Single user endpoint
    const userMatch = path.match(/^\/users\/(\d+)$/);
    if (userMatch) {
      const userId = parseInt(userMatch[1]);
      const user = mockData.users.find(u => u.id === userId);
      
      if (!user) {
        return sendError('User not found', 404);
      }
      
      if (method === 'GET') {
        return sendResponse(user);
      }
      
      if (method === 'PUT') {
        const updatedUser = { ...user, ...body, updatedAt: new Date().toISOString() };
        return sendResponse(updatedUser);
      }
      
      if (method === 'DELETE') {
        return sendResponse({ message: 'User deleted successfully' });
      }
    }

    // Posts endpoints
    if (path === '/posts') {
      if (method === 'GET') {
        const { userId } = query;
        let posts = mockData.posts;
        
        if (userId) {
          posts = posts.filter(post => post.userId === parseInt(userId));
        }
        
        return sendResponse(posts);
      }
      
      if (method === 'POST') {
        const newPost = {
          id: mockData.posts.length + 1,
          ...body,
          createdAt: new Date().toISOString()
        };
        return sendResponse(newPost, 201);
      }
    }

    // Products endpoints
    if (path === '/products') {
      if (method === 'GET') {
        const { category, inStock } = query;
        let products = mockData.products;
        
        if (category) {
          products = products.filter(p => p.category === category);
        }
        
        if (inStock !== undefined) {
          products = products.filter(p => p.inStock === (inStock === 'true'));
        }
        
        return sendResponse(products);
      }
    }

    // Auth endpoints
    if (path === '/auth/login') {
      if (method === 'POST') {
        const { email, password } = body;
        
        if (!email || !password) {
          return sendError('Email and password are required', 400);
        }
        
        // Mock authentication
        if (email === 'admin@example.com' && password === 'password') {
          return sendResponse({
            token: 'mock-jwt-token-12345',
            user: { id: 1, email, role: 'admin' },
            expiresIn: '24h'
          });
        }
        
        return sendError('Invalid credentials', 401);
      }
    }

    // Error simulation endpoints
    if (path === '/error/400') return sendError('Bad Request', 400);
    if (path === '/error/401') return sendError('Unauthorized', 401);
    if (path === '/error/403') return sendError('Forbidden', 403);
    if (path === '/error/404') return sendError('Not Found', 404);
    if (path === '/error/500') return sendError('Internal Server Error', 500);

    // Random data endpoint
    if (path === '/random') {
      const randomData = {
        id: Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        randomNumber: Math.random(),
        randomString: Math.random().toString(36).substring(7)
      };
      return sendResponse(randomData);
    }

    // File upload simulation
    if (path === '/upload' && method === 'POST') {
      return sendResponse({
        message: 'File uploaded successfully',
        filename: 'mock-file.jpg',
        size: '1.2MB',
        url: 'https://example.com/uploads/mock-file.jpg'
      });
    }

    // Default 404 for unmatched routes
    return sendError('Endpoint not found', 404);
    
  } catch (error) {
    console.error('Server error:', error);
    return sendError('Internal server error', 500);
  }
}