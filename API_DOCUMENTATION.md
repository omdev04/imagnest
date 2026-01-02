# Imgnest Developer API Documentation

## 🚀 Quick Start

Imgnest provides a RESTful API that allows you to programmatically upload, manage, and retrieve your images. All API requests require authentication using an API key.

## 🔑 Authentication

### Getting Your API Key

1. Log in to your Imgnest dashboard
2. Navigate to **API Keys** section
3. Click **Generate Key**
4. Copy and securely store your API key

### Using Your API Key

Include your API key in the request header:

```
x-api-key: YOUR_API_KEY
```

⚠️ **Security Note**: Never share your API key or commit it to version control. Store it securely in environment variables.

## 📡 Base URL

```
https://your-domain.com/api
```

Replace `your-domain.com` with your actual domain.

## 📋 API Endpoints

### 1. Upload Image

Upload an image to your library.

**Endpoint:** `POST /upload`

**Headers:**
```
x-api-key: YOUR_API_KEY
Content-Type: multipart/form-data
```

**Body:**
- `file`: The image file (required)

**Response (200 OK):**
```json
{
  "success": true,
  "url": "https://your-domain.com/cdn/abc123",
  "imageId": "abc123",
  "filename": "image.jpg",
  "size": 1024000
}
```

**cURL Example:**
```bash
curl -X POST https://your-domain.com/api/upload \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@/path/to/image.jpg"
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('https://your-domain.com/api/upload', {
  method: 'POST',
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  },
  body: formData
});

const data = await response.json();
console.log('Upload URL:', data.url);
```

**Python Example:**
```python
import requests

url = 'https://your-domain.com/api/upload'
headers = {'x-api-key': 'YOUR_API_KEY'}
files = {'file': open('image.jpg', 'rb')}

response = requests.post(url, headers=headers, files=files)
data = response.json()
print(f"Upload URL: {data['url']}")
```

---

### 2. List Images

Retrieve a paginated list of your images.

**Endpoint:** `GET /images`

**Headers:**
```
x-api-key: YOUR_API_KEY
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "images": [
    {
      "_id": "abc123",
      "filename": "image.jpg",
      "size": 1024000,
      "url": "https://your-domain.com/cdn/abc123",
      "views": 42,
      "createdAt": "2026-01-01T14:30:00Z",
      "privacy": "public"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**cURL Example:**
```bash
curl -X GET "https://your-domain.com/api/images?page=1&limit=20" \
  -H "x-api-key: YOUR_API_KEY"
```

**JavaScript Example:**
```javascript
const response = await fetch('https://your-domain.com/api/images?page=1&limit=20', {
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});

const data = await response.json();
console.log(`Total images: ${data.pagination.total}`);
```

**Node.js with Axios:**
```javascript
const axios = require('axios');

const getImages = async () => {
  const response = await axios.get(
    'https://your-domain.com/api/images?page=1&limit=20',
    {
      headers: {
        'x-api-key': 'YOUR_API_KEY'
      }
    }
  );
  
  console.log(`Total images: ${response.data.pagination.total}`);
  return response.data.images;
};
```

---

### 3. Get Image Details

Retrieve details about a specific image.

**Endpoint:** `GET /images/:id`

**Headers:**
```
x-api-key: YOUR_API_KEY
```

**Response (200 OK):**
```json
{
  "success": true,
  "image": {
    "_id": "abc123",
    "filename": "image.jpg",
    "size": 1024000,
    "url": "https://your-domain.com/cdn/abc123",
    "views": 42,
    "createdAt": "2026-01-01T14:30:00Z",
    "privacy": "public"
  }
}
```

**cURL Example:**
```bash
curl -X GET "https://your-domain.com/api/images/abc123" \
  -H "x-api-key: YOUR_API_KEY"
```

---

### 4. Delete Image

Delete an image from your library.

**Endpoint:** `DELETE /images/:id`

**Headers:**
```
x-api-key: YOUR_API_KEY
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE "https://your-domain.com/api/images/abc123" \
  -H "x-api-key: YOUR_API_KEY"
```

**JavaScript Example:**
```javascript
const response = await fetch('https://your-domain.com/api/images/abc123', {
  method: 'DELETE',
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});

const data = await response.json();
console.log(data.message);
```

---

## ⚠️ Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 401 | Unauthorized | Invalid or missing API key |
| 403 | Forbidden | Insufficient permissions or plan limits exceeded |
| 404 | Not Found | Resource doesn't exist |
| 413 | Payload Too Large | File size exceeds plan limits |
| 500 | Internal Server Error | Something went wrong on our end |

**Error Response Format:**
```json
{
  "error": "Error message"
}
```

---

## 🚦 Rate Limits

API rate limits vary by plan:

| Plan | Rate Limit |
|------|------------|
| Free | 100 requests/hour |
| Pro | 1,000 requests/hour |
| Enterprise | Unlimited |

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

---

## 💡 Best Practices

1. **Store API Keys Securely**: Use environment variables, never hardcode keys
2. **Handle Errors Gracefully**: Always check response status and handle errors
3. **Respect Rate Limits**: Implement backoff strategies for retries
4. **Use HTTPS**: All API requests must use HTTPS
5. **Keep Keys Rotated**: Regularly rotate your API keys for security

---

## 🔄 SDK Examples

### Node.js SDK (Unofficial)

```javascript
class ImgnestClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://your-domain.com/api';
  }

  async upload(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: { 'x-api-key': this.apiKey },
      body: formData
    });

    return response.json();
  }

  async list(page = 1, limit = 20) {
    const response = await fetch(
      `${this.baseURL}/images?page=${page}&limit=${limit}`,
      { headers: { 'x-api-key': this.apiKey } }
    );

    return response.json();
  }

  async get(imageId) {
    const response = await fetch(`${this.baseURL}/images/${imageId}`, {
      headers: { 'x-api-key': this.apiKey }
    });

    return response.json();
  }

  async delete(imageId) {
    const response = await fetch(`${this.baseURL}/images/${imageId}`, {
      method: 'DELETE',
      headers: { 'x-api-key': this.apiKey }
    });

    return response.json();
  }
}

// Usage
const client = new ImgnestClient('YOUR_API_KEY');

// Upload
const result = await client.upload(file);
console.log('Uploaded:', result.url);

// List
const images = await client.list(1, 20);
console.log('Total:', images.pagination.total);
```

---

## 📞 Support

For API support and questions:
- 📧 Email: support@imgnest.com
- 💬 Discord: [Join our community](#)
- 📖 Docs: [https://docs.imgnest.com](#)

---

## 📜 License & Terms

By using the Imgnest API, you agree to our [Terms of Service](#) and [API Usage Policy](#).
