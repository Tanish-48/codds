import csv
import io
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors

class ReportGenerator:
    """Generate PDF and CSV reports for analysis results"""
    
    @staticmethod
    def generate_csv(analyses):
        """Generate CSV report from analyses"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Date', 'Text', 'Originality Score', 'AI Similarity', 'Confidence'])
        
        # Write data
        for analysis in analyses:
            writer.writerow([
                analysis.get('created_at', ''),
                analysis.get('content', '')[:50] + '...',  # First 50 chars
                f"{analysis.get('originality_score', 0):.1f}%",
                f"{100 - analysis.get('originality_score', 0):.1f}%",
                analysis.get('confidence', 'N/A')
            ])
        
        return output.getvalue()
    
    @staticmethod
    def generate_pdf(user_data, analyses):
        """Generate PDF report with statistics"""
        from io import BytesIO
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch)
        styles = getSampleStyleSheet()
        story = []
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=30,
            fontName='Helvetica-Bold'
        )
        
        # Title
        story.append(Paragraph('AI Originality Analysis Report', title_style))
        story.append(Spacer(1, 0.3*inch))
        
        # User info
        story.append(Paragraph('<b>User Information</b>', styles['Heading2']))
        user_info = [
            ['Username:', user_data.get('username', 'N/A')],
            ['Report Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ['Total Analyses:', str(len(analyses))],
        ]
        
        if analyses:
            avg_score = sum(a.get('originality_score', 0) for a in analyses) / len(analyses)
            user_info.append(['Average Originality:', f'{avg_score:.1f}%'])
        
        table = Table(user_info, colWidths=[2*inch, 4*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.3*inch))
        
        # Analyses
        story.append(Paragraph('<b>Analysis Results</b>', styles['Heading2']))
        
        if analyses:
            data = [['Date', 'Content Preview', 'Originality', 'AI Similarity']]
            for analysis in analyses[:20]:  # Limit to 20 rows
                content_preview = analysis.get('content', 'N/A')[:30] + '...'
                originality = analysis.get('originality_score', 0)
                data.append([
                    analysis.get('created_at', '')[:10],
                    content_preview,
                    f'{originality:.1f}%',
                    f'{100-originality:.1f}%'
                ])
            
            table = Table(data, colWidths=[1.2*inch, 2*inch, 1.4*inch, 1.4*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')])
            ]))
            story.append(table)
        else:
            story.append(Paragraph('No analyses found.', styles['Normal']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
