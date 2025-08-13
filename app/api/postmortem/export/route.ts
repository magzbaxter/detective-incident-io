import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { PostMortemDraft } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { postMortem, gameRoom, winningTheory } = await request.json();

    if (!postMortem) {
      return NextResponse.json(
        { error: 'Post-mortem data is required' },
        { status: 400 }
      );
    }

    // Generate HTML content for PDF
    const htmlContent = generatePostMortemHTML(postMortem, gameRoom, winningTheory);

    try {
      // Use Puppeteer to generate PDF
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm', 
          bottom: '20mm',
          left: '20mm'
        }
      });

      await browser.close();

      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="PostMortem_${gameRoom?.code || 'Investigation'}_${new Date().toISOString().split('T')[0]}.pdf"`
        }
      });
      
    } catch (puppeteerError) {
      console.warn('Puppeteer PDF generation failed:', puppeteerError);
      
      // Fallback: Return HTML for client-side PDF generation
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="PostMortem_${gameRoom?.code || 'Investigation'}.html"`
        }
      });
    }

  } catch (error) {
    console.error('Error exporting post-mortem:', error);
    return NextResponse.json(
      { error: 'Failed to export post-mortem' },
      { status: 500 }
    );
  }
}

function generatePostMortemHTML(postMortem: PostMortemDraft, gameRoom: any, winningTheory: any): string {
  const formatDate = (date?: Date | string) => {
    return date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString();
  };

  const formatTime = (date?: Date | string) => {
    return date ? new Date(date).toLocaleTimeString() : new Date().toLocaleTimeString();
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${postMortem.title}</title>
        <style>
            body {
                font-family: Georgia, serif;
                line-height: 1.6;
                color: #2F1B14;
                margin: 0;
                padding: 20px;
                background: #F5F5DC;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            
            .header {
                text-align: center;
                border-bottom: 3px solid #FFD700;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .header h1 {
                font-size: 28px;
                margin: 0 0 10px 0;
                color: #2F1B14;
            }
            
            .header .subtitle {
                color: #8B4513;
                font-style: italic;
            }
            
            .section {
                margin-bottom: 30px;
                page-break-inside: avoid;
            }
            
            .section h2 {
                font-size: 20px;
                color: #2F1B14;
                border-bottom: 2px solid #FFD700;
                padding-bottom: 5px;
                margin-bottom: 15px;
            }
            
            .section h3 {
                font-size: 16px;
                color: #8B4513;
                margin-bottom: 10px;
            }
            
            .highlight-box {
                background: #FFD700;
                background-opacity: 0.1;
                border: 1px solid #FFD700;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
            }
            
            .timeline {
                background: #F5F5DC;
                padding: 15px;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                white-space: pre-line;
            }
            
            .action-item {
                display: flex;
                align-items: flex-start;
                padding: 10px;
                background: #F5F5DC;
                border-radius: 5px;
                margin: 10px 0;
            }
            
            .action-number {
                background: #8B4513;
                color: white;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                margin-right: 15px;
                flex-shrink: 0;
            }
            
            .action-content {
                flex: 1;
            }
            
            .action-meta {
                font-size: 14px;
                color: #8B4513;
                margin-top: 5px;
            }
            
            .team-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .team-member {
                background: #F5F5DC;
                padding: 10px;
                border-radius: 5px;
                display: flex;
                align-items: center;
            }
            
            .team-role {
                font-size: 14px;
                color: #8B4513;
                text-transform: capitalize;
            }
            
            .lessons-list {
                list-style: none;
                padding: 0;
            }
            
            .lessons-list li {
                padding: 8px 0;
                border-bottom: 1px solid #F0F0F0;
                position: relative;
                padding-left: 25px;
            }
            
            .lessons-list li:before {
                content: "✓";
                color: #4CAF50;
                font-weight: bold;
                position: absolute;
                left: 0;
            }
            
            .footer {
                border-top: 2px solid #FFD700;
                padding-top: 20px;
                text-align: center;
                color: #8B4513;
                font-size: 14px;
                margin-top: 40px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin: 15px 0;
            }
            
            .stat-item {
                text-align: center;
                padding: 10px;
                background: #F5F5DC;
                border-radius: 5px;
            }
            
            .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #2F1B14;
            }
            
            .stat-label {
                font-size: 14px;
                color: #8B4513;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${postMortem.title}</h1>
                <p class="subtitle">Investigation completed ${formatDate()} • Case ${gameRoom?.code || 'Investigation'}</p>
                <p class="subtitle">Generated with Detective incident.io Collaborative Investigation Platform</p>
            </div>

            <div class="section">
                <h2>Executive Summary</h2>
                <p>${postMortem.summary}</p>
            </div>

            <div class="section">
                <h2>Incident Timeline</h2>
                <div class="timeline">${postMortem.timeline}</div>
            </div>

            <div class="section">
                <h2>Root Cause Analysis</h2>
                ${winningTheory ? `
                <div class="highlight-box">
                    <h3>Final Determination: ${winningTheory.title}</h3>
                    <p>${winningTheory.description}</p>
                    <p><strong>Root Cause:</strong> ${postMortem.rootCause}</p>
                    
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number">${winningTheory.votes?.length || 0}</div>
                            <div class="stat-label">Team Votes</div>
                        </div>
                        ${winningTheory.aiValidation ? `
                        <div class="stat-item">
                            <div class="stat-number">${winningTheory.aiValidation.score}</div>
                            <div class="stat-label">AI Validation Score</div>
                        </div>
                        ` : ''}
                        <div class="stat-item">
                            <div class="stat-number">${gameRoom?.players?.length || 1}</div>
                            <div class="stat-label">Total Investigators</div>
                        </div>
                    </div>
                </div>
                ` : `<p>${postMortem.rootCause}</p>`}
            </div>

            <div class="section">
                <h2>Impact Assessment</h2>
                <p>${postMortem.impact}</p>
            </div>

            <div class="section">
                <h2>Resolution Steps</h2>
                <p>${postMortem.resolution}</p>
            </div>

            <div class="section">
                <h2>Action Items</h2>
                ${postMortem.actionItems.map((item, index) => `
                    <div class="action-item">
                        <div class="action-number">${index + 1}</div>
                        <div class="action-content">
                            <p><strong>${item.description}</strong></p>
                            <div class="action-meta">
                                <strong>Owner:</strong> ${item.owner} • 
                                <strong>Priority:</strong> ${item.priority} • 
                                <strong>Status:</strong> ${item.status}
                                ${item.dueDate ? ` • <strong>Due:</strong> ${formatDate(item.dueDate)}` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>Lessons Learned</h2>
                <ul class="lessons-list">
                    ${postMortem.lessons.map(lesson => `<li>${lesson}</li>`).join('')}
                </ul>
            </div>

            ${gameRoom?.players ? `
            <div class="section">
                <h2>Investigation Team</h2>
                <div class="team-grid">
                    ${gameRoom.players.map((player: any) => `
                        <div class="team-member">
                            <div>
                                <div><strong>${player.name}</strong></div>
                                <div class="team-role">${player.role?.replace('_', ' ') || 'Detective'}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <div class="footer">
                <p><strong>Detective incident.io</strong> • Collaborative Post-Mortem Investigation Platform</p>
                <p>Case ${gameRoom?.code || 'Investigation'} • Generated ${formatDate()} at ${formatTime()}</p>
                <p>For questions about this investigation, contact the engineering team.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}