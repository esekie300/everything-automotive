# backend/run.py
from flask import Flask, jsonify
from .config import config
from .extensions import init_app as init_extensions
from .database.supabase_client import init_supabase_client
import asyncio

# Import Blueprints
from .api.auth import auth_bp
# Import other blueprints as they are created
# from .api.parts import parts_bp
# from .api.orders import orders_bp
# from .api.services import services_bp
# from .api.users import users_bp
# from .api.store import store_bp
# from .api.delivery import delivery_bp
# from .api.admin import admin_bp
from .api.ai import ai_bp

# <<< Import the tracing config function >>>
from agents import set_tracing_disabled

def create_app():
    """Application Factory Function"""
    # 1. Create the Flask app instance FIRST
    app = Flask(__name__)

    # 2. Load configuration onto the app
    app.config.from_object(config)

    # 3. Initialize Supabase (or other services that don't depend on 'app')
    init_supabase_client()

    # <<< Disable OpenAI Agents Tracing Globally >>>
    print("Disabling OpenAI Agents tracing globally...")
    set_tracing_disabled(True)
    print("OpenAI Agents tracing disabled.")
    # <<< End Disable Tracing >>>

    # 4. Initialize extensions, passing the created 'app' instance
    init_extensions(app)

    # 5. Register blueprints onto the 'app'
    app.register_blueprint(auth_bp)
    # app.register_blueprint(parts_bp)
    # app.register_blueprint(orders_bp)
    # app.register_blueprint(services_bp)
    # app.register_blueprint(users_bp)
    # app.register_blueprint(store_bp)
    # app.register_blueprint(delivery_bp)
    # app.register_blueprint(admin_bp)
    app.register_blueprint(ai_bp)

    # 6. Define routes on the 'app'
    @app.route('/')
    def health_check():
        return jsonify({"status": "ok", "message": "Everything Automotive Backend is running!"})

    # 7. Return the configured 'app' instance
    return app

# This allows running directly with `python run.py` for development
if __name__ == '__main__':
    # IMPORTANT: When running with `python run.py`, Flask's dev server is used,
    # which is WSGI and won't work well with async routes.
    # Use Hypercorn for running async Flask apps.
    print("ERROR: Running directly with 'python run.py' is not recommended for async apps.")
    print("Use: hypercorn \"backend.run:create_app()\" --bind 127.0.0.1:5001 --reload")

    # The code below is kept for reference but should not be the primary run method
    # app = create_app()
    # app.run(host='0.0.0.0', port=5001, debug=config.DEBUG)

    # To run with Waitress (WSGI, also not ideal for async):
    # from waitress import serve
    # serve(app, host='0.0.0.0', port=5001)