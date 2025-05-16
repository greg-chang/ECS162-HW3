from flask import Flask, jsonify, send_from_directory, request
import os
from flask_cors import CORS
from pymongo import MongoClient
from article_service import ArticleService

static_path = os.getenv('STATIC_PATH','static')
template_path = os.getenv('TEMPLATE_PATH','templates')
# Mongo connection
mongo_uri = os.getenv("MONGO_URI")
mongo = MongoClient(mongo_uri)
db = mongo.get_default_database()

app = Flask(__name__, static_folder=static_path, template_folder=template_path)
CORS(app)
article_service = ArticleService()

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

@app.route('/')
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