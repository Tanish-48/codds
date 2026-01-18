from flask import current_app
from bson.objectid import ObjectId
from datetime import datetime

class Report:
    @staticmethod
    def create_report(user_id, content, originality_score, drift_details, style_analysis):
        """Create a new originality report"""
        db = current_app.db
        
        report_data = {
            'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id,
            'content': content,
            'originality_score': originality_score,
            'drift_details': drift_details,
            'style_analysis': style_analysis,
            'created_at': datetime.utcnow(),
            'ai_similarity_score': drift_details.get('ai_similarity', 0),
            'style_drift': drift_details.get('style_drift', 0)
        }
        
        result = db.reports.insert_one(report_data)
        return str(result.inserted_id)
    
    @staticmethod
    def get_user_reports(user_id, limit=10):
        """Get all reports for a user"""
        db = current_app.db
        reports = list(db.reports.find(
            {"user_id": ObjectId(user_id)},
            {"content": 0}  # Exclude large content field
        ).sort("created_at", -1).limit(limit))
        
        # Convert ObjectId to string
        for report in reports:
            report['_id'] = str(report['_id'])
            report['user_id'] = str(report['user_id'])
        
        return reports
    
    @staticmethod
    def get_report_by_id(report_id):
        """Get a specific report"""
        db = current_app.db
        report = db.reports.find_one({"_id": ObjectId(report_id)})
        if report:
            report['_id'] = str(report['_id'])
            report['user_id'] = str(report['user_id'])
        return report
    
    @staticmethod
    def get_user_originality_trend(user_id, days=30):
        """Get originality trend for a user"""
        db = current_app.db
        from datetime import timedelta
        
        start_date = datetime.utcnow() - timedelta(days=days)
        reports = list(db.reports.find(
            {
                "user_id": ObjectId(user_id),
                "created_at": {"$gte": start_date}
            },
            {"originality_score": 1, "created_at": 1}
        ).sort("created_at", 1))
        
        return reports
