from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.utils.report_generator import ReportGenerator
from flask import current_app
from io import BytesIO
import json

bp = Blueprint('export', __name__, url_prefix='/api/export')

@bp.route('/csv', methods=['GET'])
@jwt_required()
def export_csv():
    """Export user's analysis history as CSV"""
    user_id = get_jwt_identity()
    db = current_app.db
    
    try:
        # Get user's analyses
        analyses = list(db.reports.find({'user_id': user_id}).sort('created_at', -1).limit(100))
        
        # Generate CSV
        csv_content = ReportGenerator.generate_csv(analyses)
        
        # Return as download
        output = BytesIO()
        output.write(csv_content.encode('utf-8'))
        output.seek(0)
        
        return send_file(
            output,
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'analyses_{user_id}.csv'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/pdf', methods=['GET'])
@jwt_required()
def export_pdf():
    """Export user's analysis history as PDF"""
    user_id = get_jwt_identity()
    db = current_app.db
    
    try:
        # Get user data
        user = User.get_user_by_id(user_id)
        
        # Get user's analyses
        analyses = list(db.reports.find({'user_id': user_id}).sort('created_at', -1).limit(100))
        
        # Convert ObjectId to string for serialization
        for analysis in analyses:
            if '_id' in analysis:
                analysis['_id'] = str(analysis['_id'])
        
        # Generate PDF
        pdf_content = ReportGenerator.generate_pdf(user, analyses)
        
        # Return as download
        output = BytesIO()
        output.write(pdf_content)
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'analyses_{user_id}.pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/batch', methods=['POST'])
@jwt_required()
def export_batch():
    """Export batch analysis results"""
    user_id = get_jwt_identity()
    db = current_app.db
    data = request.get_json()
    
    try:
        analysis_ids = data.get('analysis_ids', [])
        format_type = data.get('format', 'csv')  # csv or pdf
        
        if not analysis_ids:
            return jsonify({'error': 'No analyses specified'}), 400
        
        # Get analyses
        from bson.objectid import ObjectId
        analyses = list(db.reports.find({
            '_id': {'$in': [ObjectId(id) for id in analysis_ids]},
            'user_id': user_id
        }))
        
        if format_type == 'csv':
            csv_content = ReportGenerator.generate_csv(analyses)
            output = BytesIO()
            output.write(csv_content.encode('utf-8'))
            output.seek(0)
            
            return send_file(
                output,
                mimetype='text/csv',
                as_attachment=True,
                download_name=f'batch_analyses.csv'
            )
        else:
            user = User.get_user_by_id(user_id)
            pdf_content = ReportGenerator.generate_pdf(user, analyses)
            
            output = BytesIO()
            output.write(pdf_content)
            output.seek(0)
            
            return send_file(
                output,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f'batch_analyses.pdf'
            )
    except Exception as e:
        return jsonify({'error': str(e)}), 400
