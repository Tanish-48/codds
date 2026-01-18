import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os

class EmailNotifier:
    """Email notification service for analysis results"""
    
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.sender_email = os.getenv('SENDER_EMAIL', 'noreply@echo.com')
        self.sender_password = os.getenv('SENDER_PASSWORD', '')
        self.enabled = bool(self.sender_password)
    
    def send_analysis_result(self, user_email, user_name, analysis_result):
        """Send analysis result notification email"""
        if not self.enabled:
            return False
        
        try:
            subject = "Your AI Originality Analysis Result"
            
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #667eea;">Analysis Complete!</h2>
                        <p>Hi {user_name},</p>
                        
                        <p>Your text analysis has been completed. Here are the results:</p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Originality Score:</strong> <span style="color: #667eea; font-size: 24px;">{analysis_result.get('originality_score', 0):.1f}%</span></p>
                            <p><strong>AI Similarity:</strong> {100 - analysis_result.get('originality_score', 0):.1f}%</p>
                            <p><strong>Confidence:</strong> {analysis_result.get('confidence', 'N/A')}</p>
                            <p><strong>Analyzed at:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                        </div>
                        
                        <p style="color: #666;">
                            <strong>Score Interpretation:</strong><br>
                            • 80-100%: Highly original content<br>
                            • 50-80%: Mostly original content<br>
                            • 20-50%: Mixed content (some AI)<br>
                            • 0-20%: Likely AI-generated
                        </p>
                        
                        <p style="margin-top: 30px; color: #999; font-size: 12px;">
                            © 2024 ECHO AI Detection System. All rights reserved.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.sender_email
            message["To"] = user_email
            
            message.attach(MIMEText(html_body, "html"))
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, user_email, message.as_string())
            
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    def send_welcome_email(self, user_email, user_name):
        """Send welcome email to new user"""
        if not self.enabled:
            return False
        
        try:
            subject = "Welcome to ECHO AI Detection System!"
            
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #667eea;">🎉 Welcome to ECHO!</h2>
                        <p>Hi {user_name},</p>
                        
                        <p>Thank you for joining ECHO AI Detection System. You can now:</p>
                        
                        <ul>
                            <li>Analyze text for AI originality</li>
                            <li>View your analysis history</li>
                            <li>Download reports in CSV/PDF format</li>
                            <li>Track trends over time</li>
                            <li>Generate API keys for integrations</li>
                        </ul>
                        
                        <p style="margin-top: 20px;">
                            <a href="http://echo.local/dashboard" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
                        </p>
                        
                        <p style="margin-top: 30px; color: #999; font-size: 12px;">
                            © 2024 ECHO AI Detection System. All rights reserved.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.sender_email
            message["To"] = user_email
            
            message.attach(MIMEText(html_body, "html"))
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, user_email, message.as_string())
            
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False

# Global instance
email_notifier = EmailNotifier()
