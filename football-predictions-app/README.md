# ⚽ Football Predictions App

A comprehensive AI-powered football match prediction system built with FastAPI, React, and local ML models.

## 🚀 Features

### Core Functionality
- **Match Management**: Add, edit, and track football matches
- **Team Management**: Manage team information and statistics
- **ML Model Training**: Train multiple ML models (Random Forest, XGBoost, Neural Networks, Logistic Regression)
- **Predictions**: Make predictions on upcoming matches
- **Performance Tracking**: Monitor model accuracy and prediction performance
- **Data Import**: Import historical match data from CSV/JSON/Excel files

### Technical Features
- **Modern Stack**: FastAPI + React + TypeScript + Material-UI
- **Local ML**: All models run locally, no external API dependencies
- **Real-time Updates**: Live prediction accuracy tracking
- **Responsive Design**: Mobile-friendly interface
- **Docker Support**: Easy deployment with Docker Compose

## 🛠️ Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM for database operations
- **scikit-learn** - Machine learning library
- **XGBoost** - Gradient boosting framework
- **PyTorch** - Deep learning framework
- **pandas** - Data manipulation
- **SQLite** - Local database

### Frontend
- **React 18+** - UI library
- **TypeScript** - Type safety
- **Material-UI v5** - Component library
- **Redux Toolkit** - State management
- **Chart.js** - Data visualization

### Infrastructure
- **Docker** - Containerization
- **Redis** - Caching
- **MLflow** - Model management

## 📦 Installation

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd football-predictions-app
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs

### Manual Installation

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🎯 Usage

### 1. Import Data
- Go to **Data Import** page
- Upload CSV/JSON/Excel files with match data
- Ensure columns: `home_team`, `away_team`, `home_score`, `away_score`, `date`, `league`

### 2. Train Models
- Navigate to **ML Models** page
- Click "Train New Model"
- Select model type and parameters
- Monitor training progress

### 3. Make Predictions
- Go to **Predictions** page
- Select a trained model
- Choose matches to predict
- View prediction confidence and accuracy

### 4. Monitor Performance
- Track model accuracy over time
- Compare different model performances
- Analyze prediction success rates

## 📊 Expected Accuracy

- **Random Forest**: ~50-60%
- **XGBoost**: ~55-65%
- **Logistic Regression**: ~45-55%
- **Neural Networks**: ~50-65%

*Note: Football is inherently unpredictable. These are realistic accuracy ranges for sports prediction models.*

## 🔧 Configuration

### Environment Variables

#### Backend
- `DATABASE_URL`: Database connection string
- `ML_MODEL_PATH`: Path to store trained models
- `REDIS_URL`: Redis connection string

#### Frontend
- `REACT_APP_API_URL`: Backend API URL

### Model Parameters
- `test_size`: Test data split (default: 0.2)
- `random_state`: Random seed for reproducibility
- `hyperparameters`: Model-specific parameters

## 📁 Project Structure

```
football-predictions-app/
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── models/        # Database models
│   │   ├── ml/           # ML training & prediction
│   │   ├── database/     # Database configuration
│   │   └── core/         # Core utilities
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── data/                 # Data files
├── models/              # Trained models
├── docker-compose.yml
└── README.md
```

## 🚀 Development

### Adding New Features

1. **Backend**: Add new endpoints in `backend/app/api/`
2. **Frontend**: Create components in `frontend/src/components/`
3. **ML Models**: Extend `backend/app/ml/` for new algorithms

### Database Migrations
```bash
# Generate migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head
```

### Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed description

## 🔮 Future Enhancements

- [ ] Real-time data integration
- [ ] Advanced feature engineering
- [ ] Ensemble model methods
- [ ] Mobile app
- [ ] Betting odds integration
- [ ] Player statistics
- [ ] Weather data integration
- [ ] Live match tracking

---

**Happy Predicting! ⚽🤖**
