# LyricsIntelliect

LyricsIntelliect is a web application that analyzes song lyrics to provide meaningful insights. Simply enter an artist and song title, and the application will fetch the lyrics, provide a brief summary of what the song is about, and identify any countries mentioned in the lyrics.

## 🌟 Features

- **Song Analysis**: Get a concise one-sentence summary of what a song is about
- **Country Detection**: Identify countries mentioned in song lyrics
- **User Authentication**: Secure login/registration system
- **History Tracking**: View your previously analyzed songs
- **Reanalysis**: Re-run the analysis for a song you have already submitted
- **Responsive Design**: Works on desktop and mobile devices

## 🔍 Demo

- **Frontend**: [https://lyricsintelliect.netlify.app](https://lyricsintelliect.netlify.app)

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 5.1.7 with Django REST Framework 3.16.0
- **Database**: PostgreSQL 16.2
- **Task Queue**: Celery 5.5.0 with Redis
- **Authentication**: JWT (djangorestframework-simplejwt)
- **API Documentation**: drf-spectacular
- **Lyrics Source**: Musixmatch API
- **Text Analysis**: OpenAI GPT API

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.2
- **UI Components**: shadcn/ui with Tailwind CSS 4.0
- **Form Handling**: react-hook-form with zod validation
- **HTTP Client**: Axios
- **Router**: react-router 7
- **State Management**: SWR for data fetching

### Infrastructure
- **Backend Hosting**: AWS EC2
- **Frontend Hosting**: Netlify
- **Containerization**: Docker Compose

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (v18+)
- npm or yarn
- Git

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/abdullahmujahidali/LyricsIntelliect.git
   cd LyricsIntelliect
   ```

2. Create a `.env` file in the backend directory based on the `.env.example`:
   ```bash
   cd backend
   cp .env.example .env
   ```

3. Update the `.env` file with your database credentials, API keys, and other configurations:
   ```
   DB_NAME=lyricsintelliect
   DB_USER=yourusername
   DB_PASSWORD=yourpassword
   DB_HOST=db
   DB_PORT=5432
   
   REDIS_URL=redis://redis:6379/1
   CELERY_BROKER_URL=redis://redis:6379/0
   CELERY_RESULT_BACKEND=django-db
   
   MUSIXMATCH_API_KEY=your_musixmatch_api_key
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-3.5-turbo
   
   ACCESS_TOKEN_LIFETIME_MINUTES=60
   REFRESH_TOKEN_LIFETIME_DAYS=1
   ```

4. Start the backend services using Docker Compose:
   ```bash
   docker-compose up -d
   ```

5. The backend will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file:
   ```bash
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. The frontend will be available at http://localhost:5173

## 📄 API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs/
- ReDoc: http://localhost:8000/redoc/

## 🌐 Deployment

### Backend Deployment (AWS EC2)

1. Connect to your EC2 instance:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-instance-ip
   ```

2. Clone the repository and set up the environment as described in the backend setup.

3. Configure Nginx as a reverse proxy:
   ```
   server {
       listen 80;
       server_name your_domain_or_ip;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. Start the Docker Compose services.

### Frontend Deployment (Netlify)

1. Connect your GitHub repository to Netlify.

2. Configure the build settings:
   - Build command: `npm run build` or `yarn build`
   - Publish directory: `dist`

3. Set the environment variables:
   - `VITE_API_BASE_URL=http://your_backend_url`

4. Deploy the site.

## 🔒 Authentication

The application uses JWT-based authentication. When a user logs in, they receive an access token and a refresh token. The access token is used to authenticate API requests, while the refresh token is used to obtain a new access token when the current one expires.

## 🔍 Project Structure

### Backend

```
backend/
├── core/                 # Django project settings and configuration
├── songs/                # Song analysis app
│   ├── models.py         # Song data model
│   ├── services.py       # External API integrations (Musixmatch, OpenAI)
│   ├── tasks.py          # Celery tasks for asynchronous processing
│   ├── views.py          # API endpoints for song analysis
│   └── serializers.py    # Data serialization/deserialization
├── users/                # User management app
├── docker-compose.yml    # Docker configuration for services
└── requirements.txt      # Python dependencies
```

### Frontend

```
frontend/
├── public/               # Static files
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React context for global state
│   ├── hooks/            # Custom React hooks
│   ├── layout/           # Layout components
│   ├── lib/              # Utility functions and client config
│   ├── services/         # API service functions
│   ├── types/            # TypeScript type definitions
│   └── views/            # Page components
└── package.json          # Node.js dependencies
```

## ⚙️ Configuration

### Environment Variables

#### Backend
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: Database connection details
- `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`: Celery and Redis configuration
- `MUSIXMATCH_API_KEY`: API key for Musixmatch
- `OPENAI_API_KEY`: API key for OpenAI
- `OPENAI_MODEL`: OpenAI model to use for analysis (default: "gpt-3.5-turbo")
- `ACCESS_TOKEN_LIFETIME_MINUTES`, `REFRESH_TOKEN_LIFETIME_DAYS`: JWT token configuration

#### Frontend
- `VITE_API_BASE_URL`: URL of the backend API

## 👨‍💻 Development

### Backend

To run backend tests:
```bash
cd backend
python manage.py test
```

To create a superuser:
```bash
cd backend
python manage.py createsuperuser
```

### Frontend

To run linting:
```bash
cd frontend
npm run lint
# or
yarn lint
```

To build for production:
```bash
cd frontend
npm run build
# or
yarn build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 🙏 Acknowledgements

- [Musixmatch API](https://developer.musixmatch.com/) for providing song lyrics
- [OpenAI GPT API](https://openai.com/) for text analysis capabilities
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Django REST Framework](https://www.django-rest-framework.org/) for API development
- [Vite](https://vitejs.dev/) for frontend build tooling