from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.ai_analyzer import OriginallityAnalyzer
from app.models.report import Report
from app.models.user import User

bp = Blueprint('analyze', __name__, url_prefix='/api/analyze')

@bp.route('/text', methods=['POST'])
@jwt_required()
def analyze_text():
    """Analyze text for originality"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({'success': False, 'message': 'Text content required'}), 400
    
    text = data.get('text', '').strip()
    
    if len(text) < 10:
        return jsonify({'success': False, 'message': 'Text must be at least 10 characters'}), 400
    
    # Perform analysis
    analysis_result = OriginallityAnalyzer.analyze_text(text)
    
    # Create report
    report_id = Report.create_report(
        user_id=user_id,
        content=text[:500],  # Store first 500 chars
        originality_score=analysis_result['originality_score'],
        drift_details=analysis_result['drift_details'],
        style_analysis=analysis_result['style_fingerprint']
    )
    
    # Update user analysis count
    User.increment_analysis_count(user_id)
    
    return jsonify({
        'success': True,
        'report_id': report_id,
        'originality_score': analysis_result['originality_score'],
        'ai_similarity': analysis_result['ai_similarity'],
        'style_drift': analysis_result['style_drift'],
        'confidence': analysis_result['confidence'],
        'drift_details': analysis_result['drift_details'],
        'suggestions': analysis_result['suggestions'],
        'style_fingerprint': analysis_result['style_fingerprint']
    }), 201

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_analysis_history():
    """Get user's analysis history"""
    user_id = get_jwt_identity()
    limit = request.args.get('limit', 10, type=int)
    
    reports = Report.get_user_reports(user_id, limit=min(limit, 50))
    
    return jsonify({
        'success': True,
        'reports': reports,
        'count': len(reports)
    }), 200

@bp.route('/trend', methods=['GET'])
@jwt_required()
def get_originality_trend():
    """Get originality trend over time"""
    user_id = get_jwt_identity()
    days = request.args.get('days', 30, type=int)
    
    reports = Report.get_user_originality_trend(user_id, days=min(days, 365))
    
    # Format for chart
    trend_data = [
        {
            'date': report['created_at'].isoformat(),
            'score': report['originality_score']
        }
        for report in reports
    ]
    
    return jsonify({
        'success': True,
        'trend': trend_data,
        'average_score': sum(r['originality_score'] for r in reports) / len(reports) if reports else 0
    }), 200

@bp.route('/report/<report_id>', methods=['GET'])
@jwt_required()
def get_report(report_id):
    """Get detailed report"""
    user_id = get_jwt_identity()
    
    report = Report.get_report_by_id(report_id)
    
    if not report:
        return jsonify({'success': False, 'message': 'Report not found'}), 404
    
    # Check ownership
    if str(report['user_id']) != user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    return jsonify({
        'success': True,
        'report': report
    }), 200
