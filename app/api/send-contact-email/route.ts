import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function generateEmailHtml({
  ambassadorName,
  buyerName,
  buyerEmail,
  buyerPhone,
  message,
  vehicleName,
  vehicleUrl,
}: {
  ambassadorName: string
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
  message: string
  vehicleName: string
  vehicleUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9fafb;
      }
      .header {
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        padding: 30px;
        border-radius: 8px 8px 0 0;
        text-align: center;
      }
      .header h1 {
        color: white;
        margin: 0;
        font-size: 24px;
      }
      .content {
        background: white;
        padding: 30px;
        border-radius: 0 0 8px 8px;
      }
      .section {
        background: #f9fafb;
        padding: 20px;
        margin: 20px 0;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
      }
      .section h2 {
        margin-top: 0;
        color: #111827;
        font-size: 18px;
      }
      .info-row {
        margin: 10px 0;
        padding: 8px 0;
        border-bottom: 1px solid #e5e7eb;
      }
      .info-row:last-child {
        border-bottom: none;
      }
      .label {
        font-weight: 600;
        color: #6b7280;
        font-size: 14px;
      }
      .value {
        color: #111827;
        margin-top: 4px;
      }
      .message {
        background: white;
        padding: 15px;
        border-radius: 6px;
        border-left: 4px solid #dc2626;
        margin: 15px 0;
        white-space: pre-wrap;
      }
      .button {
        display: inline-block;
        background: #dc2626;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        color: #6b7280;
        font-size: 14px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>🚗 New Test Drive Request</h1>
    </div>

    <div class="content">
      <p>Hi ${ambassadorName},</p>
      <p>
        Great news! Someone is interested in your <strong>${vehicleName}</strong> and would like to contact you for a test drive.
      </p>

      <div class="section">
        <h2>Contact Information</h2>
        <div class="info-row">
          <div class="label">Name</div>
          <div class="value">${buyerName}</div>
        </div>
        <div class="info-row">
          <div class="label">Email</div>
          <div class="value">
            <a href="mailto:${buyerEmail}">${buyerEmail}</a>
          </div>
        </div>
        ${buyerPhone ? `
        <div class="info-row">
          <div class="label">Phone</div>
          <div class="value">
            <a href="tel:${buyerPhone}">${buyerPhone}</a>
          </div>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <h2>Message</h2>
        <div class="message">${message}</div>
      </div>

      <p>
        You can reply directly to this email to reach ${buyerName}, or use their contact information above.
      </p>

      <center>
        <a href="${vehicleUrl}" class="button">
          View Vehicle Details
        </a>
      </center>

      <div class="footer">
        <p>
          This notification was sent because you are listed as the ambassador for this vehicle on the Tesla Ambassador Platform.
        </p>
        <p>
          © ${new Date().getFullYear()} Tesla Ambassador Platform. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ambassadorEmail,
      ambassadorName,
      buyerName,
      buyerEmail,
      buyerPhone,
      message,
      vehicleName,
      vehicleUrl,
    } = body

    // Validate required fields
    if (!ambassadorEmail || !ambassadorName || !buyerName || !buyerEmail || !message || !vehicleName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(ambassadorEmail) || !emailRegex.test(buyerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY || !resend) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      )
    }

    // Send email to ambassador
    const { data, error } = await resend.emails.send({
      from: 'Tesla Ambassador Platform <noreply@teslaambassador.cz>',
      to: ambassadorEmail,
      replyTo: buyerEmail, // Allow ambassador to reply directly to the buyer
      subject: `New Test Drive Request for your ${vehicleName}`,
      html: generateEmailHtml({
        ambassadorName,
        buyerName,
        buyerEmail,
        buyerPhone,
        message,
        vehicleName,
        vehicleUrl,
      }),
    })

    if (error) {
      console.error('Error sending email:', error)
      return NextResponse.json(
        { error: 'Failed to send email notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    })
  } catch (error) {
    console.error('Error in send-contact-email API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
