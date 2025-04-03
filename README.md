# 🚀 Real-Time Travel Dashboard

Αυτό το project είναι ένα real-time dashboard που:
- Παρουσιάζει δεδομένα μετακινήσεων (driving/transit) & ατμοσφαιρικής ρύπανσης (AQI)
- Εμφανίζει δυναμικά γραφήματα και διαδραστικό χάρτη για την Αθήνα
- Συνδέεται με PostgreSQL βάση σε Google Cloud SQL

## 📦 Περιεχόμενα

- backend/ (FastAPI)
- frontend/ (React + Recharts + Leaflet)
- docker-compose.yml
- README.md

## 🧰 Τεχνολογίες
- FastAPI (Python)
- React, Recharts, Leaflet
- PostgreSQL
- Docker

## 🧪 Εκκίνηση Locally
1. Ρύθμισε DB env vars στο docker-compose.yml
2. Τρέξε:
    docker-compose up --build
3. Άνοιξε:
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:8000/docs

## 🌐 Deployment
Μπορεί να γίνει deploy σε Render, GCP Cloud Run, Railway.

## 📈 Dashboard
- Επιλογή route_id + ημέρας
- 6 γραφήματα (5 bar, 1 scatter)
- Auto-refresh ανά 10'
- Χάρτης Αθηνών με 6 μοναδικά start points και τελευταίες τιμές

## ✍️ Author
Built by @eleftheriosvarv
