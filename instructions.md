# Predictive Maintenance System for Railways — Production‑Ready MVP

## 1. Project Goal (Non‑Negotiable)

Build a **production‑ready MVP** that:

* Ingests **real‑time sensor data** from railway assets
* Stores, processes, and analyzes the data reliably
* Detects anomalies and predicts failures
* Displays insights in a **professional, executive‑grade UI dashboard**
* Sends **real‑time alerts** when risk is detected

This is **not a demo**. Architecture must scale, be observable, and follow industry best practices.

---

## 2. Use Case Scope (MVP‑Safe)

Target **one railway asset type only**:

* Example: Wheel Bearings / Traction Motors / Track Vibration Sensors

### Sensor Data (real or simulated):

* Temperature (°C)
* Vibration (RMS / FFT)
* Current or Load
* Timestamp
* Device ID
* Location ID (yard / track section)

> Source: Common Practice — Industrial IoT MVPs

---

## 3. Real‑Time Data Ingestion

### Requirements

* Real‑time streaming
* Handle out‑of‑order events
* Handle device disconnects

### Mandatory Stack

* **MQTT or Kafka** for ingestion
* JSON payload format
* Topic per device or asset class

```json
{
  "device_id": "RB-AXLE-102",
  "timestamp": "2025-01-10T10:32:45Z",
  "temperature": 78.3,
  "vibration": 0.042,
  "current": 12.6
}
```

> Source: Industry Standard — IIoT Architecture

---

## 4. Backend Architecture

### Required Services

1. **Ingestion Service**

   * Payload validation
   * Stream publishing
2. **Processing Service**

   * Feature extraction
   * Rolling windows (mean, std, RMS)
3. **ML Inference Service**

   * Anomaly detection
   * Risk scoring
4. **Alerting Service**

   * Rule‑based + ML‑based alerts
5. **API Gateway**

   * Secure REST APIs for UI

### Tech Stack (Free & Proven)

* Python + FastAPI
* PostgreSQL + TimescaleDB
* Redis (alert deduplication & caching)

> Source: Common Practice — Predictive Maintenance Systems

---

## 5. Machine Learning (MVP‑Appropriate)

### Strategy

* **Unsupervised anomaly detection**

  * Isolation Forest **or** Autoencoder

### Output

* Anomaly score (0–1)
* Risk level: NORMAL / WARNING / CRITICAL

### Features

* Rolling mean
* Rolling standard deviation
* Vibration RMS
* Temperature delta

### Model Rules

* Offline training
* Runtime inference
* Retraining supported

> Source: Research Studies — Predictive Maintenance ML

---

## 6. Alerting Logic (Critical)

Alerts trigger when:

* Hard threshold breach
* Anomaly score exceeds limit
* Trend slope predicts imminent failure

### Alert Payload

* Asset ID
* Severity
* Reason
* Timestamp

### Channels

* UI notification
* Email (mock)
* Webhook

> Source: Industry Standard — Condition Monitoring

---

## 7. UI Dashboard (Professional Standard)

### Mandatory Pages

1. **Overview**

   * Asset health KPIs
   * Active alerts
2. **Asset Detail View**

   * Time‑series charts
   * Anomaly markers
   * Prediction trend
3. **Alerts Page**

   * Filters & severity levels
4. **System Health**

   * Device status
   * Data freshness

### UI Rules

* Clean typography
* No flashy visuals
* Light + Dark mode
* Industrial color palette

### Frontend Stack

* React + TypeScript
* Recharts / Chart.js
* Tailwind or Material UI

> Source: Common Practice — Industrial Dashboards

---

## 8. Security & Reliability

* JWT authentication
* Role‑based access (Admin / Viewer)
* Input validation
* API rate limiting
* Structured logging & error tracking

> Source: Industry Best Practice

---

## 9. Deployment (Low‑Cost)

* Dockerized microservices
* Docker Compose for MVP
* Local + Cloud ready

### Optional Platforms

* Fly.io
* Render
* Railway.app

> Source: Common Practice — MVP Deployment

---

## 10. Testing & Validation

* Unit tests (API + ML logic)
* Ingestion load testing
* Fault injection (sensor spikes)
* Sample datasets

---

## 11. Final Deliverables

The system **must** demonstrate:

* Live streaming data
* Real‑time dashboard
* Failure prediction
* Actionable alerts
* Clean, maintainable code

No static CSV dashboards.
No fake charts.
No hardcoded alerts.

---

## Hard Truth

* No streaming = Not real‑time
* No alerts = Just analytics
* No anomaly detection = Not predictive maintenance

This MVP avoids all three failures.
