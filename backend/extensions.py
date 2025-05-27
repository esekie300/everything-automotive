from flask_cors import CORS

# Initialize extensions without app context here
cors = CORS()

def init_app(app):
    """Initialize Flask extensions with the app context."""
    # Allow requests from the frontend development server
    cors.init_app(app, resources={r"/api/*": {"origins": app.config['FRONTEND_URL']}}, supports_credentials=True)
    # Add other extension initializations here if needed