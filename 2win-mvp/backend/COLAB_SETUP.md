# Colab ML Model Deployment Guide

## 🤖 **Deploy Your Diabetes Prediction Model from Colab**

This guide shows how to deploy your Colab-trained ML model as a REST API that the backend can call.

---

## 📋 **Step 1: Prepare Your Colab Model**

### **Model Input Format:**
Your Colab model should expect JSON input like this:

```json
{
  "age": 45,
  "height": 175,
  "weight": 80,
  "bmi": 26.1,
  "avg_glucose": 110,
  "heart_rate": 72,
  "body_temp": 98.6,
  "activity_level": 30
}
```

### **Model Output Format:**
Your model should return JSON like this:

```json
{
  "risk_score": 65,
  "factors": ["High BMI", "Elevated glucose", "Age risk"],
  "recommendations": ["Increase physical activity", "Monitor glucose levels"],
  "confidence": 0.87,
  "data_points": 150
}
```

---

## 🔧 **Step 2: Create REST API in Colab**

Add this code to your Colab notebook to create a Flask API:

```python
# In your Colab notebook
from flask import Flask, request, jsonify
import nest_asyncio
from pyngrok import ngrok
import joblib
import numpy as np

# Allow asyncio in Colab
nest_asyncio.apply()

# Initialize Flask app
app = Flask(__name__)

# Load your trained model
model = joblib.load('your_diabetes_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from request
        data = request.get_json()
        
        # Prepare features for model
        features = [
            data.get('age', 0),
            data.get('bmi', 0),
            data.get('avg_glucose', 100),
            data.get('heart_rate', 70),
            data.get('body_temp', 98.6),
            data.get('activity_level', 0)
        ]
        
        # Make prediction
        features_array = np.array(features).reshape(1, -1)
        risk_score = model.predict_proba(features_array)[0][1] * 100
        
        # Generate factors and recommendations based on input
        factors = []
        recommendations = []
        
        if data.get('bmi', 0) >= 30:
            factors.append("High BMI")
            recommendations.append("Weight management program")
        
        if data.get('avg_glucose', 100) >= 126:
            factors.append("High glucose levels")
            recommendations.append("Immediate medical consultation")
        elif data.get('avg_glucose', 100) >= 100:
            factors.append("Elevated glucose")
            recommendations.append("Monitor glucose regularly")
        
        if data.get('age', 0) >= 65:
            factors.append("Age-related risk")
            recommendations.append("Regular health checkups")
        
        response = {
            "risk_score": int(risk_score),
            "factors": factors if factors else ["General health factors"],
            "recommendations": recommendations if recommendations else ["Maintain healthy lifestyle"],
            "confidence": 0.85,
            "data_points": 1000
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Start ngrok tunnel
public_url = ngrok.connect(5000)
print(f"Public URL: {public_url}")

# Run the app
app.run(port=5000)
```

---

## 🚀 **Step 3: Deploy to Cloud Service**

### **Option 1: ngrok (Quick Testing)**
```python
# In Colab - already included in the code above
from pyngrok import ngrok
public_url = ngrok.connect(5000)
```

### **Option 2: PythonAnywhere (Free Hosting)**
1. Export your Colab model: `joblib.dump(model, 'diabetes_model.pkl')`
2. Create Flask app on PythonAnywhere
3. Upload model file and Flask code
4. Get your API URL

### **Option 3: Heroku (Free Tier)**
1. Create `requirements.txt`: `flask, scikit-learn, joblib, gunicorn`
2. Create `Procfile`: `web: gunicorn app:app`
3. Deploy to Heroku

---

## 🔧 **Step 4: Update Backend Configuration**

Update your `colab_predictor.py` with your deployed API URL:

```python
# In backend/ml_models/colab_predictor.py
def __init__(self):
    # Replace with your actual deployed API URL
    self.colab_api_url = "https://your-app.herokuapp.com/predict"
    # Or ngrok URL for testing: "https://abc123.ngrok.io/predict"
    self.fallback_enabled = True
```

---

## 🧪 **Step 5: Test the Integration**

### **Test Your Colab API:**
```bash
# Test the API directly
curl -X POST "https://your-app-url/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "age": 45,
       "height": 175,
       "weight": 80,
       "bmi": 26.1,
       "avg_glucose": 110,
       "heart_rate": 72,
       "body_temp": 98.6,
       "activity_level": 30
     }'
```

### **Test Backend Integration:**
```bash
# Start backend server
uvicorn main:app --reload

# Test health prediction endpoint
curl -X POST "http://localhost:8000/api/iot/health-summary/test-user-id"
```

---

## 📊 **Step 6: Monitor Performance**

### **Add Logging to Colab:**
```python
import logging

@app.route('/predict', methods=['POST'])
def predict():
    logging.info(f"Prediction request: {request.get_json()}")
    # ... your prediction code ...
    logging.info(f"Prediction result: {response}")
    return jsonify(response)
```

### **Monitor in Backend:**
```python
# In colab_predictor.py
async def predict_diabetes_risk(self, user_data, readings):
    try:
        # ... API call ...
        print(f"✅ Colab API success: risk_score={prediction['risk_score']}")
        return prediction
    except Exception as e:
        print(f"❌ Colab API error: {str(e)}")
        return self._fallback_prediction(user_data, readings)
```

---

## 🔄 **Step 7: Fallback Strategy**

The system includes automatic fallback to rule-based prediction if Colab API fails:

```python
# Fallback triggers:
- Network connectivity issues
- API timeout (>30 seconds)
- Invalid response format
- HTTP errors (4xx, 5xx)
```

---

## 📈 **Performance Optimization**

### **Colab Optimization:**
```python
# Add caching for repeated predictions
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_predict(features_tuple):
    features = list(features_tuple)
    return model.predict_proba([features])[0][1]

# Use in your predict function
risk_score = cached_predict(tuple(features))
```

### **Backend Optimization:**
```python
# Add request timeout and retry logic
async with httpx.AsyncClient(timeout=30.0) as client:
    response = await client.post(
        self.colab_api_url,
        json=model_input,
        headers={"Content-Type": "application/json"}
    )
```

---

## 🎯 **Production Considerations**

### **Security:**
- Add API key authentication to your Colab API
- Use HTTPS (ngrok provides this automatically)
- Validate input data in Colab

### **Scaling:**
- PythonAnywhere free tier: Limited but sufficient for testing
- Heroku free tier: 550 hours/month
- Consider paid plans for production

### **Monitoring:**
- Add health check endpoint: `/health`
- Log prediction requests and responses
- Monitor API response times

---

## 🚀 **Quick Start Checklist**

1. **[ ] Train Model in Colab** - Use your diabetes dataset
2. **[ ] Create Flask API** - Add the REST endpoint code
3. **[ ] Test Locally** - Use ngrok for public URL
4. **[ ] Deploy to Cloud** - PythonAnywhere/Heroku
5. **[ ] Update Backend URL** - Configure colab_predictor.py
6. **[ ] Test Integration** - End-to-end testing
7. **[ ] Monitor Performance** - Check logs and response times

---

## 🎉 **Success Criteria**

Your integration is complete when:
- ✅ Colab API returns valid predictions
- ✅ Backend successfully calls Colab API
- ✅ Dashboard shows ML-based risk scores
- ✅ Fallback works when API is unavailable
- ✅ Response time < 5 seconds

**🎯 Your Colab-trained ML model is now integrated with the health monitoring system!**
