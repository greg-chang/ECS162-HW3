from flask import Flask, jsonify, send_from_directory, request, session, redirect
import os
from flask_cors import CORS
from pymongo import MongoClient
from article_service import ArticleService
from authlib.integrations.flask_client import OAuth
from authlib.common.security import generate_token
from comment_service import CommentService
from models.comment import Comment

static_path = os.getenv('STATIC_PATH','static')
template_path = os.getenv('TEMPLATE_PATH','templates')
# Mongo connection
mongo_uri = os.getenv("MONGO_URI")
mongo = MongoClient(mongo_uri)
db = mongo.get_default_database()

app = Flask(__name__, static_folder=static_path, template_folder=template_path)
app.secret_key = os.urandom(24)  # Add secret key for session management
CORS(app, supports_credentials=True)  # Enable credentials support
article_service = ArticleService()
comment_service = CommentService(mongo)

oauth = OAuth(app)

nonce = generate_token()

oauth.register(
    name='flask_app',
    client_id=os.getenv('OIDC_CLIENT_ID'),
    client_secret=os.getenv('OIDC_CLIENT_SECRET'),
    #server_metadata_url='http://dex:5556/.well-known/openid-configuration',
    authorization_endpoint="http://localhost:5556/auth",
    token_endpoint="http://dex:5556/token",
    jwks_uri="http://dex:5556/keys",
    userinfo_endpoint="http://dex:5556/userinfo",
    device_authorization_endpoint="http://dex:5556/device/code",
    client_kwargs={'scope': 'openid email profile'}
)

@app.route('/')
def home():
    return redirect('http://localhost:5173/')

@app.route('/login')
def login():
    session['nonce'] = nonce
    redirect_uri = 'http://localhost:8000/authorize'
    return oauth.flask_app.authorize_redirect(redirect_uri, nonce=nonce)

@app.route('/authorize')
def authorize():
    token = oauth.flask_app.authorize_access_token()
    nonce = session.get('nonce')

    user_info = oauth.flask_app.parse_id_token(token, nonce=nonce)  # or use .get('userinfo').json()
    session['user'] = user_info
    return redirect('/')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/api/me')
def get_user():
    user = session.get('user')
    if user:
        return jsonify(user)
    return jsonify({"error": "Not logged in"}), 401

@app.route('/api/articles')
def get_articles():
    page = request.args.get('page', default=0, type=int)
    locations = request.args.getlist('locations')
    if not locations:
        locations = ['Sacramento', 'Davis']
    
    try:
        articles_data = article_service.fetch_articles(page=page, locations=locations)
        return jsonify(articles_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/articles/<article_id>/comments', methods=['GET'])
def get_comments(article_id):
    try:
        # Clean the article ID to match what the frontend sends
        clean_id = article_id.replace('_', ':')
        comments = comment_service.get_comments_by_article(clean_id)
        return jsonify([comment.dict() for comment in comments])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/articles/<article_id>/comments', methods=['POST'])
def create_comment(article_id):
    try:
        data = request.json
        # Clean the article ID to match what the frontend sends
        clean_id = article_id.replace('_', ':')
        comment = Comment(
            article_id=clean_id,
            user_id=data.get('user_id'),
            content=data.get('content')
        )
        created_comment = comment_service.create_comment(comment)
        return jsonify(created_comment.dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments/<comment_id>', methods=['PUT'])
def update_comment(comment_id):
    try:
        data = request.json
        updated_comment = comment_service.update_comment(comment_id, data.get('content'))
        if updated_comment:
            return jsonify(updated_comment.dict())
        return jsonify({'error': 'Comment not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments/<comment_uuid>', methods=['DELETE'])
def delete_comment(comment_uuid):
    try:
        success = comment_service.delete_comment(comment_uuid)
        if success:
            return jsonify({"message": "Comment deleted"}), 200
        else:
            return jsonify({"error": "Comment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/<path:path>')
def serve_frontend(path=''):
    if path != '' and os.path.exists(os.path.join(static_path,path)):
        return send_from_directory(static_path, path)
    return send_from_directory(template_path, 'index.html')

@app.route("/test-mongo")
def test_mongo():
    return jsonify({"collections": db.list_collection_names()})

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)),debug=debug_mode)