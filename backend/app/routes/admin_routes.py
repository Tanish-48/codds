from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from flask import current_app
from datetime import datetime, timedelta
from functools import wraps
from bson.objectid import ObjectId
import pymongo

bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def check_admin(user_id):
    """Check if user is admin"""
    user = User.get_user_by_id(user_id)
    return user and user.get('role') == 'admin'

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        if not check_admin(user_id):
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@bp.route('/analytics', methods=['GET'])
@admin_required
def get_analytics():
    """Get admin analytics"""
    db = current_app.db
    
    try:
        # User statistics
        total_users = db.users.count_documents({})
        active_users = db.users.count_documents({'analysis_count': {'$gt': 0}})
        
        # Analysis statistics
        total_analyses = db.reports.count_documents({})
        
        # Originality score statistics
        pipeline = [
            {
                '$group': {
                    '_id': None,
                    'average_originality': {'$avg': '$originality_score'},
                    'max_score': {'$max': '$originality_score'},
                    'min_score': {'$min': '$originality_score'},
                    'highly_original': {
                        '$sum': {
                            '$cond': [{'$gte': ['$originality_score', 80]}, 1, 0]
                        }
                    },
                    'original': {
                        '$sum': {
                            '$cond': [
                                {
                                    '$and': [
                                        {'$gte': ['$originality_score', 50]},
                                        {'$lt': ['$originality_score', 80]}
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    'mixed': {
                        '$sum': {
                            '$cond': [
                                {
                                    '$and': [
                                        {'$gte': ['$originality_score', 20]},
                                        {'$lt': ['$originality_score', 50]}
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    'low_original': {
                        '$sum': {
                            '$cond': [{'$lt': ['$originality_score', 20]}, 1, 0]
                        }
                    }
                }
            }
        ]
        
        score_data = list(db.reports.aggregate(pipeline))
        
        stats = {
            'average_originality': 0,
            'highest_originality': 0,
            'lowest_originality': 0,
            'highly_original': 0,
            'original': 0,
            'mixed': 0,
            'low_original': 0,
            'total_analyses': total_analyses
        }
        
        if score_data:
            stats.update({
                'average_originality': score_data[0].get('average_originality', 0),
                'highest_originality': score_data[0].get('max_score', 0),
                'lowest_originality': score_data[0].get('min_score', 0),
                'highly_original': score_data[0].get('highly_original', 0),
                'original': score_data[0].get('original', 0),
                'mixed': score_data[0].get('mixed', 0),
                'low_original': score_data[0].get('low_original', 0)
            })
        
        # Trend data (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        trend_pipeline = [
            {
                '$match': {
                    'created_at': {'$gte': seven_days_ago}
                }
            },
            {
                '$group': {
                    '_id': {
                        '$dateToString': {
                            'format': '%Y-%m-%d',
                            'date': '$created_at'
                        }
                    },
                    'analyses': {'$sum': 1}
                }
            },
            {
                '$sort': {'_id': 1}
            }
        ]
        
        trend_data = list(db.reports.aggregate(trend_pipeline))
        trend_data = [
            {'date': item['_id'], 'analyses': item['analyses'], 'new_users': 0} 
            for item in trend_data
        ]
        
        return jsonify({
            'analytics': {
                'user_stats': {
                    'total_users': total_users,
                    'active_users': active_users
                },
                'analysis_stats': stats,
                'trend_data': trend_data
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    """Get all users"""
    db = current_app.db
    
    try:
        users_list = list(db.users.find({}, {
            'password': 0,
            'email_verified': 0
        }).sort('created_at', pymongo.DESCENDING))
        
        # Convert ObjectId to string
        for user in users_list:
            user['_id'] = str(user['_id'])
            user['analysis_count'] = user.get('analysis_count', 0)
        
        return jsonify({'users': users_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user"""
    db = current_app.db
    current_user_id = get_jwt_identity()
    
    try:
        if user_id == current_user_id:
            return jsonify({'error': 'Cannot delete yourself'}), 400
        
        result = db.users.delete_one({'_id': ObjectId(user_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'User not found'}), 404
        
        # Delete user's reports
        db.reports.delete_many({'user_id': user_id})
        
        return jsonify({'message': 'User deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/system-health', methods=['GET'])
@admin_required
def get_system_health():
    """Get system health status"""
    db = current_app.db
    
    try:
        health = {
            'database': 'healthy',
            'collections': {
                'users': db.users.count_documents({}),
                'reports': db.reports.count_documents({})
            },
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify({'health': health})
    except Exception as e:
        return jsonify({
            'health': {
                'database': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
        }), 500

@bp.route('/summary', methods=['GET'])
@admin_required
def get_summary():
    """Get dashboard summary"""
    db = current_app.db
    
    try:
        return jsonify({
            'total_users': db.users.count_documents({}),
            'total_reports': db.reports.count_documents({}),
            'status': 'healthy'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_pipeline = [
        {
            '$match': {
                'created_at': {'$gte': thirty_days_ago}
            }
        },
        {
            '$group': {
                '_id': {
                    '$dateToString': {
                        'format': '%Y-%m-%d',
                        'date': '$created_at'
                    }
                },
                'count': {'$sum': 1}
            }
        },
        {
            '$sort': {'_id': 1}
        }
    ]
    
    daily_data = list(db.reports.aggregate(daily_pipeline))
    
    # Drift trends
    drift_pipeline = [
        {
            '$group': {
                '_id': None,
                'avg_ai_similarity': {'$avg': '$drift_details.ai_similarity'},
                'avg_style_drift': {'$avg': '$drift_details.style_drift'}
            }
        }
    ]
    drift_data = list(db.reports.aggregate(drift_pipeline))
    
    if drift_data:
        drift_stats = drift_data[0]
    else:
        drift_stats = {'avg_ai_similarity': 0, 'avg_style_drift': 0}
    
    # Top users by analysis count
    top_users = list(db.users.find(
        {'analysis_count': {'$gt': 0}},
        {'username': 1, 'analysis_count': 1}
    ).sort('analysis_count', -1).limit(10))
    
    for user in top_users:
        user['_id'] = str(user['_id'])
    
    return jsonify({
        'success': True,
        'analytics': {
            'user_stats': {
                'total_users': total_users,
                'active_users': active_users
            },
            'analysis_stats': {
                'total_analyses': total_analyses,
                'average_originality': round(score_data.get('avg_score', 0), 2),
                'highest_originality': round(score_data.get('max_score', 0), 2),
                'lowest_originality': round(score_data.get('min_score', 0), 2)
            },
            'daily_activity': daily_data,
            'drift_trends': {
                'avg_ai_similarity': round(drift_stats.get('avg_ai_similarity', 0), 2),
                'avg_style_drift': round(drift_stats.get('avg_style_drift', 0), 2)
            },
            'top_users': top_users
        }
    }), 200

@bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users (admin only)"""
    user_id = get_jwt_identity()
    
    if not check_admin(user_id):
        return jsonify({'success': False, 'message': 'Unauthorized - Admin only'}), 403
    
    db = current_app.db
    
    users = list(db.users.find(
        {},
        {'password': 0}
    ).sort('created_at', -1))
    
    for user in users:
        user['_id'] = str(user['_id'])
        user['created_at'] = user['created_at'].isoformat()
    
    return jsonify({
        'success': True,
        'users': users,
        'count': len(users)
    }), 200

@bp.route('/system-health', methods=['GET'])
@jwt_required()
def system_health():
    """Get system health metrics"""
    user_id = get_jwt_identity()
    
    if not check_admin(user_id):
        return jsonify({'success': False, 'message': 'Unauthorized - Admin only'}), 403
    
    db = current_app.db
    
    try:
        # Database connection check
        db.command('ping')
        db_status = 'healthy'
    except:
        db_status = 'unhealthy'
    
    # Collection sizes
    users_count = db.users.count_documents({})
    reports_count = db.reports.count_documents({})
    
    return jsonify({
        'success': True,
        'health': {
            'database': db_status,
            'collections': {
                'users': users_count,
                'reports': reports_count
            },
            'timestamp': datetime.utcnow().isoformat()
        }
    }), 200
