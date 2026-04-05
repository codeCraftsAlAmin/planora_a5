// Inlined EJS templates — avoids filesystem access on Vercel serverless.
// These are compiled directly into the bundle, so no file path resolution is needed.

export const templates: Record<string, string> = {
  otp: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Verification Code</title>
    <style>
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f7f9;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      }
      .header {
        background-color: #4a90e2;
        color: #ffffff;
        padding: 30px;
        text-align: center;
      }
      .content {
        padding: 40px 30px;
        text-align: center;
        color: #333333;
      }
      .otp-code {
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 5px;
        color: #4a90e2;
        background-color: #f0f7ff;
        padding: 15px;
        border-radius: 4px;
        display: inline-block;
        margin: 20px 0;
        border: 1px dashed #4a90e2;
      }
      .footer {
        background-color: #f9f9f9;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #777777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Verify Your Account</h1>
      </div>
      <div class="content">
        <p>Hello <strong><%= name %></strong>,</p>
        <p>
          Thank you for joining us. Please use the following One-Time Password
          (OTP) to complete your verification process. This code is valid for
          <strong>2 minutes</strong>.
        </p>

        <div class="otp-code"><%= otp %></div>

        <p>
          If you did not request this code, please ignore this email or contact
          support if you have concerns.
        </p>
      </div>
      <div class="footer">
        <p>&copy; 2026 Planora. All rights reserved.</p>
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  </body>
</html>`,

  invitation: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .header { background-color: #6366f1; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #ffffff; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #6366f1;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
        }
        .event-box {
            background-color: #f3f4f6;
            border-left: 4px solid #6366f1;
            padding: 15px;
            margin: 20px 0;
        }
        .highlight { color: #6366f1; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>You're Invited!</h1>
        </div>
        <div class="content">
            <p>Hi <strong><%= inviteeName %></strong>,</p>

            <p>Great news! <span class="highlight"><%= inviterName %></span> has invited you to join an upcoming event on <strong>Planora</strong>.</p>

            <div class="event-box">
                <h3 style="margin-top: 0;"><%= eventName %></h3>
                <p style="margin-bottom: 0;">Log in to your dashboard to view the full details and respond to this invitation.</p>
            </div>

            <p>You can accept or decline this invitation directly from your notifications center.</p>

            <a href="<%= eventLink %>" class="button">View Invitation</a>

            <p style="margin-top: 30px;">See you there,<br>The Planora Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 Planora Event Management. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`,

  invoice: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f9;
            margin: 0;
            padding: 0;
            color: #334155;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #2563eb;
            padding: 40px 20px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 2px;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
        }
        .greeting {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 15px;
        }
        .summary-table {
            width: 100%;
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 10px 0;
            font-size: 14px;
        }
        .label {
            color: #64748b;
            font-weight: 500;
            width: 40%;
        }
        .value {
            color: #1e293b;
            font-weight: 700;
            text-align: right;
        }
        .divider {
            border-top: 1px solid #e2e8f0;
        }
        .btn-container {
            text-align: center;
            margin-top: 35px;
        }
        .btn {
            background-color: #2563eb;
            color: #ffffff !important;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 700;
            display: inline-block;
        }
        .footer {
            padding: 30px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            background-color: #f8fafc;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PLANORA</h1>
            <p style="margin-top: 10px; opacity: 0.9;">Booking Confirmed</p>
        </div>

        <div class="content">
            <p class="greeting">Hi <%= userName %>,</p>
            <p>Your payment was successful! We've secured your spot for the upcoming event. You can find your receipt and event details below.</p>

            <table class="summary-table">
                <tr>
                    <td class="label">Event</td>
                    <td class="value"><%= eventName %></td>
                </tr>
                <tr>
                    <td class="label">Date</td>
                    <td class="value"><%= new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) %></td>
                </tr>
                <tr>
                    <td colspan="2"><div class="divider"></div></td>
                </tr>
                <tr style="padding-top: 10px;">
                    <td class="label" style="font-size: 16px; color: #1e293b;">Total Paid</td>
                    <td class="value" style="font-size: 18px; color: #2563eb;"><%= amount.toFixed(2) %> BDT</td>
                </tr>
                <tr>
                    <td class="label">Transaction ID</td>
                    <td class="value" style="font-family: monospace; font-size: 11px;"><%= transactionId %></td>
                </tr>
            </table>

            <p style="font-size: 14px; text-align: center;">
                A PDF copy of your invoice is attached to this email.
            </p>

            <div class="btn-container">
                <a href="<%= invoiceUrl %>" class="btn">Download Online Invoice</a>
            </div>
        </div>

        <div class="footer">
            <p>&copy; <%= new Date().getFullYear() %> Planora Events. All rights reserved.</p>
            <p>Sylhet, Bangladesh | support@planora.com</p>
        </div>
    </div>
</body>
</html>`,
};
