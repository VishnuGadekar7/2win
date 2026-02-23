# Device Registration and Management Setup

## 🚀 Quick Setup Guide

### 1. Set up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to SQL Editor and run the contents of `supabase_schema.sql`
3. Get your project URL and service role key from Settings > API

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Start Backend Server

```bash
cd backend
source venv/Scripts/activate  # Windows
# or venv/Scripts/activate for Git Bash
uvicorn main:app --reload
```

### 4. Start Frontend Server

```bash
cd frontend
npm run dev
```

## 📱 Device Registration Flow

### For Users:

1. **Register Account**: Go to `/register` and create an account
2. **Login**: Use credentials to login
3. **Go to Profile**: Click profile or navigate to `/profile`
4. **Register Device**: 
   - Click "Register New Device"
   - Enter optional device name
   - Copy the device key (shown only once!)
5. **Configure ESP32**: Use the device key in your ESP32 code

### Device Key Format:
```
abc123def456... (32 characters)
```

## 🔧 API Endpoints

### Device Management:
- `POST /api/devices/register` - Register new device
- `GET /api/devices` - List user's devices
- `POST /api/devices/{device_id}/revoke` - Revoke device

### Authentication:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /users/me` - Get current user info

## 🧪 Testing the Flow

### 1. Test Registration:
```bash
curl -X POST "http://localhost:8000/api/devices/register" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_name": "My ESP32"}'
```

### 2. Test Device List:
```bash
curl -X GET "http://localhost:8000/api/devices" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test Revoke:
```bash
curl -X POST "http://localhost:8000/api/devices/DEVICE_ID/revoke" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔐 Security Features

- **Device Keys**: 32-character secure tokens
- **Hashed Storage**: Keys are hashed in database
- **User Isolation**: RLS policies ensure users only see their own data
- **Revocation**: Devices can be revoked instantly
- **JWT Authentication**: Secure token-based auth

## 📊 Database Schema

### Tables:
- `users` - User accounts and profiles
- `devices` - Device registration and ownership
- `device_keys` - Authentication keys (hashed)
- `readings` - IoT sensor data (time-series)
- `predictions` - ML model outputs

### Security:
- Row Level Security (RLS) enabled
- Service role only for server operations
- Device keys never stored in plain text

## 🚨 Troubleshooting

### Common Issues:

1. **"Device not found"** - Check device ID and user ownership
2. **"Invalid device key"** - Ensure key is copied correctly
3. **"Database connection failed"** - Check Supabase credentials
4. **"CORS error"** - Ensure frontend URL is in CORS origins

### Debug Tips:

1. Check browser console for errors
2. Verify Supabase tables exist
3. Test API endpoints with curl/Postman
4. Check JWT token in localStorage

## 📝 Next Steps

After device registration is working:

1. **ESP32 Integration**: Configure device with generated key
2. **Data Ingestion**: Set up Edge Function for sensor data
3. **ML Pipeline**: Implement diabetes prediction models
4. **Dashboard**: Visualize sensor data and predictions

## 🆘 Support

If you encounter issues:

1. Check the backend console logs
2. Verify Supabase schema is applied
3. Ensure all environment variables are set
4. Test with simple passwords (< 72 characters)

The device management system is now ready for testing!
