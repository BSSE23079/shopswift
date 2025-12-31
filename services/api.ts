import { Product, User, Order, AuthData } from '../types';

// --- CONFIGURATION ---
// ⚠️ WARNING: In a production app, never expose Client Secrets in frontend code.
// These should be proxied through a secure backend.

const PROJECT_KEY = 'shopswift-project';
const AUTH_URL = 'https://auth.us-east-2.aws.commercetools.com';
const API_URL = 'https://api.us-east-2.aws.commercetools.com';

// ⚠️ REPLACE THIS WITH YOUR ACTUAL AWS API GATEWAY URL FROM TERMINAL STEPS ⚠️
const AWS_API_GATEWAY_URL = "https://xwv7twzhjf.execute-api.us-east-1.amazonaws.com"; 

const FRONTEND_CLIENT = {
  id: 'ThD68mbo1Rvcfws_VfdvK4ve',
  secret: 'XX6W2L21Dlh0Ne6S_cBLQ7D1HU9GfG1g',
  scope: 'view_categories:shopswift-project manage_my_payments:shopswift-project create_anonymous_token:shopswift-project manage_my_quotes:shopswift-project manage_my_business_units:shopswift-project view_published_products:shopswift-project manage_my_profile:shopswift-project manage_my_shopping_lists:shopswift-project manage_my_orders:shopswift-project manage_my_quote_requests:shopswift-project'
};

const ADMIN_CLIENT = {
  id: '98dESm8Fn8mzJaB_Q2iosttm',
  secret: '2bumPouiH73huqn35LyEAdjULXvI3NOW',
  scope: 'manage_project:shopswift-project'
};

// --- HELPERS ---

let cachedCustomerToken: string | null = null;
let cachedAdminToken: string | null = null;

// Helper to get OAuth Token
const getAccessToken = async (isAdmin: boolean = false): Promise<string> => {
  if (isAdmin && cachedAdminToken) return cachedAdminToken;
  if (!isAdmin && cachedCustomerToken) return cachedCustomerToken;

  const client = isAdmin ? ADMIN_CLIENT : FRONTEND_CLIENT;
  const authString = btoa(`${client.id}:${client.secret}`);

  try {
    const response = await fetch(`${AUTH_URL}/oauth/token?grant_type=client_credentials&scope=${encodeURIComponent(client.scope)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) throw new Error('Failed to authenticate with Commercetools');

    const data = await response.json();
    const token = data.access_token;

    if (isAdmin) cachedAdminToken = token;
    else cachedCustomerToken = token;

    return token;
  } catch (error) {
    console.error("Auth Error:", error);
    throw error;
  }
};

// Helper to make API Requests
const fetchApi = async (path: string, method: string = 'GET', body?: any, useAdmin: boolean = false) => {
  const token = await getAccessToken(useAdmin);
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(`${API_URL}/${PROJECT_KEY}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const err = await response.json();
    console.error("API Error:", err);
    throw new Error(err.message || 'API Request Failed');
  }

  return response.json();
};

// Helper to map Commercetools Product to our App Product
const mapProduct = (ctProduct: any): Product => {
  const variant = ctProduct.masterVariant || ctProduct.masterData?.current?.masterVariant || ctProduct.masterData?.staged?.masterVariant;
  const name = ctProduct.name?.en || ctProduct.name?.['en-US'] || "Unknown Product";
  
  // Find price - prefer USD, fallback to first available
  const prices = variant?.prices || [];
  const priceObj = prices.find((p: any) => p.value.currencyCode === 'USD')?.value || prices[0]?.value;
  
  const price = priceObj ? priceObj.centAmount / 100 : 0;
  const currency = priceObj ? priceObj.currencyCode : 'USD';

  return {
    id: ctProduct.id,
    name: name,
    price: price,
    currency: currency,
    imageUrl: variant?.images?.[0]?.url || 'https://via.placeholder.com/300',
    sku: variant?.sku || 'NO-SKU',
    description: ctProduct.description?.en || ''
  };
};

// --- SERVICE ---

export const ApiService = {
  login: async (data: AuthData): Promise<User> => {
    // --- 1. SPECIAL CEO ADMIN LOGIN ---
    if (data.email === 'numzum@ceo.pk' && data.password === '12345') {
      return {
        id: 'admin-ceo',
        email: 'numzum@ceo.pk',
        firstName: 'NumZum',
        lastName: 'CEO',
        isAdmin: true // <--- This grants access to the Admin Dashboard
      };
    }

    // --- 2. Generic Admin Login ---
    if (data.isAdmin) {
      return {
        id: 'admin-user',
        email: data.email,
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true
      };
    }

    // --- 3. Customer Login (Real Commercetools) ---
    try {
      const response = await fetchApi('/me/login', 'POST', {
        email: data.email,
        password: data.password
      });
      
      const customer = response.customer;
      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        isAdmin: false
      };
    } catch (e) {
      console.warn("CT Login failed, falling back to simulation for demo purposes");
      if (data.password === 'password') {
         return {
          id: 'simulated-user',
          email: data.email,
          firstName: data.firstName || 'User',
          lastName: 'Simulated',
          isAdmin: false
         }
      }
      throw new Error("Invalid credentials");
    }
  },

  signup: async (data: AuthData): Promise<User> => {
    try {
      if (data.isAdmin) {
          await new Promise(r => setTimeout(r, 800));
          return {
              id: `admin-${Date.now()}`,
              email: data.email,
              firstName: data.firstName || 'Admin',
              lastName: data.lastName || 'User',
              isAdmin: true
          };
      }

      const response = await fetchApi('/me/signup', 'POST', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });
      
      const customer = response.customer;
      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        isAdmin: false
      };
    } catch (e: any) {
      throw new Error(e.message || "Signup failed");
    }
  },

  getProducts: async (): Promise<Product[]> => {
    const data = await fetchApi('/product-projections?limit=20', 'GET', undefined, false);
    return data.results.map(mapProduct);
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      const data = await fetchApi('/orders?limit=20&sort=createdAt desc', 'GET', undefined, true);
      
      return data.results.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber || order.id.slice(0, 8),
        total: order.totalPrice.centAmount / 100,
        items: order.lineItems.length,
        status: order.orderState === 'Complete' ? 'Completed' : 'Pending',
        paymentStatus: order.paymentState || 'Pending',
        shipmentStatus: order.shipmentState || 'Pending',
        date: new Date(order.createdAt).toLocaleDateString()
      }));
    } catch (e) {
      console.warn("Could not fetch orders (Project might be empty)", e);
      return [];
    }
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    let productTypeId;
    const typeResponse = await fetchApi('/product-types?limit=1', 'GET', undefined, true);
    
    if (typeResponse.results.length > 0) {
      productTypeId = typeResponse.results[0].id;
    } else {
      console.log("No product type found, creating default...");
      try {
          const newType = await fetchApi('/product-types', 'POST', {
              name: "Generic Product",
              description: "Default product type created by ShopSwift",
              attributes: []
          }, true);
          productTypeId = newType.id;
      } catch (e: any) {
          throw new Error("Failed to create default Product Type: " + e.message);
      }
    }

    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const body = {
      name: { en: product.name },
      slug: { en: slug },
      productType: { id: productTypeId, typeId: 'product-type' },
      description: { en: product.description },
      masterVariant: {
        sku: product.sku,
        prices: [
          {
            value: {
              currencyCode: product.currency,
              centAmount: Math.round(product.price * 100)
            },
            country: 'US' // Important for matching checkout logic
          }
        ],
        images: [
            {
                url: product.imageUrl,
                dimensions: { w: 300, h: 300 }
            }
        ]
      }
    };

    const createdProduct = await fetchApi('/products', 'POST', body, true);

    const publishedProduct = await fetchApi(`/products/${createdProduct.id}`, 'POST', {
        version: createdProduct.version,
        actions: [
            { action: 'publish' }
        ]
    }, true);

    return mapProduct({ ...publishedProduct, masterData: { current: publishedProduct.masterData.staged } });
  },

  updateProductPrice: async (productId: string, newPrice: number): Promise<void> => {
    const productData = await fetchApi(`/products/${productId}`, 'GET', undefined, true);
    const version = productData.version;

    await fetchApi(`/products/${productId}`, 'POST', {
        version,
        actions: [
            {
                action: 'setPrices',
                variantId: 1,
                prices: [
                    {
                        value: {
                            currencyCode: 'USD',
                            centAmount: Math.round(newPrice * 100)
                        },
                        country: 'US' // Force US to keep checkout working
                    }
                ]
            },
            { action: 'publish' }
        ]
    }, true);
  },

  placeOrder: async (cartItems: any[], user: User | null, address: any): Promise<string> => {
    // 1. Prepare Cart Draft (Force US settings)
    const cartDraft: any = {
      currency: 'USD',
      country: 'US', // Matches admin product settings
      customerEmail: address.email,
      shippingAddress: {
        firstName: address.firstName,
        lastName: address.lastName,
        streetName: address.address,
        city: address.city,
        postalCode: address.zip,
        country: 'US'
      }
    };
    
    if (user && user.id && user.id.length > 30) {
        cartDraft.customerId = user.id;
    }
    
    // 2. Create Cart
    const cart = await fetchApi('/carts', 'POST', cartDraft, true);
    
    // 3. Add Items
    const version = cart.version;
    const actions = cartItems.map(item => ({
      action: 'addLineItem',
      productId: item.id,
      variantId: 1, 
      quantity: item.quantity,
      externalPrice: {
        currencyCode: 'USD',
        centAmount: Math.round(item.price * 100)
      }
    }));

    try {
      const updatedCart = await fetchApi(`/carts/${cart.id}`, 'POST', {
        version,
        actions
      }, true);

      // 4. Create Order in Commercetools
      const itemName = cartItems.length > 0 
        ? cartItems[0].name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15) 
        : 'Order';

      const orderBody = {
        id: updatedCart.id,
        version: updatedCart.version,
        orderNumber: `${itemName}-${Date.now()}`
      };

      const order = await fetchApi('/orders', 'POST', orderBody, true);

      // --- 5. TRIGGER AWS MICROSERVICES (Lambda -> EventBridge) ---
      // This is the critical step for your Architecture Diagram
      if (AWS_API_GATEWAY_URL && !AWS_API_GATEWAY_URL.includes("REPLACE_ME")) {
          try {
            console.log("⚡ Triggering AWS Backend...");
            
            const awsPayload = {
                source: "shopswift.frontend",
                orderId: order.id,
                orderNumber: order.orderNumber,
                customerEmail: address.email,
                totalAmount: order.totalPrice?.centAmount / 100 || 0,
                items: cartItems.map(i => ({ id: i.id, name: i.name, qty: i.quantity })),
                timestamp: new Date().toISOString()
            };

            // Non-blocking fetch (Fire and forget)
            fetch(AWS_API_GATEWAY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(awsPayload)
            })
            .then(res => console.log("✅ AWS Notified. Status:", res.status))
            .catch(err => console.warn("⚠️ AWS Network Error:", err));

          } catch (awsError) {
            console.warn("⚠️ AWS Logic Skipped:", awsError);
          }
      } else {
          console.warn("⚠️ AWS API URL is missing. Order saved in Commercetools only.");
      }

      return order.orderNumber;

    } catch (e: any) {
      console.error("Failed to update cart or place order:", e);
      throw new Error(e.message || "Failed to place order.");
    }
  },

  updateOrderStatus: async (orderId: string, status: 'Complete' | 'Shipped' | 'Paid' | 'Delivered'): Promise<void> => {
      const order = await fetchApi(`/orders/${orderId}`, 'GET', undefined, true);
      
      const actions: any[] = [];

      if (status === 'Complete') {
          actions.push(
              { action: 'changeOrderState', orderState: 'Complete' },
              { action: 'changeShipmentState', shipmentState: 'Delivered' },
              { action: 'changePaymentState', paymentState: 'Paid' }
          );
      } else if (status === 'Shipped') {
          actions.push({ action: 'changeShipmentState', shipmentState: 'Shipped' });
      } else if (status === 'Delivered') {
          actions.push({ action: 'changeShipmentState', shipmentState: 'Delivered' });
      } else if (status === 'Paid') {
          actions.push({ action: 'changePaymentState', paymentState: 'Paid' });
      }

      await fetchApi(`/orders/${orderId}`, 'POST', {
          version: order.version,
          actions: actions
      }, true);
  },

  uploadImage: async (file: File): Promise<string> => {
    await new Promise(r => setTimeout(r, 1000));
    console.log("Simulating S3 Upload for", file.name);
    return "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=300&q=80"; 
  }
};