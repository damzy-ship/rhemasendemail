import { ParentData } from '../types';

export function base64urlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function createMimeMessage(parent: ParentData): string {
  const emailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rhema Youth Camp 2025</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #1ba3cd  75%, #2e86de 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #1ba3cd 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
        }
        .logo {
            color: white;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }
        .subtitle {
            color: rgba(255,255,255,0.9);
            font-size: 18px;
            position: relative;
            z-index: 1;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
        }
        .greeting {
            font-size: 20px;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        .parent-name {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: bold;
            font-size: 22px;
        }
        .child-name {
            background: linear-gradient(135deg, #1ba3cd, #2e86de);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: bold;
            font-size: 20px;
        }
        .qr-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 3px solid transparent;
            background-clip: padding-box;
            position: relative;
        }
        .qr-section::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(135deg, #ff6b35, #f7931e, #1ba3cd, #2e86de);
            border-radius: 18px;
            z-index: -1;
        }
        .qr-title {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
        }
        .qr-container {
            background: white;
            border-radius: 15px;
            padding: 20px;
            display: inline-block;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border: 4px solid transparent;
            background-clip: padding-box;
            position: relative;
        }
        .qr-container::before {
            content: '';
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            background: linear-gradient(135deg, #ff6b35, #1ba3cd);
            border-radius: 19px;
            z-index: -1;
        }
        .qr-code {
            width: 200px;
            height: 200px;
            border-radius: 10px;
        }
        .download-btn {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            margin-top: 15px;
            box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
            transition: transform 0.2s ease;
        }
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4);
        }
        .important-info {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border-left: 5px solid #f7931e;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
        }
        .info-title {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
        }
        .info-item {
            margin-bottom: 15px;
        }
        .info-label {
            font-weight: bold;
            color: #ff6b35;
            font-size: 16px;
        }
        .footer {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 0 0 20px 20px;
        }
        .team-signature {
            font-size: 18px;
            font-weight: bold;
            color: #f7931e;
        }
        .venue-info {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-left: 5px solid #1ba3cd;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
        }
        .venue-title {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
        }
        .venue-item {
            margin-bottom: 10px;
        }
        .venue-label {
            font-weight: bold;
            color: #1ba3cd;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">RHEMA YOUTH CAMP 2025</div>
            <div class="subtitle">Raised to Reign</div>
        </div>
        
        <div class="content">
            <div class="greeting">
                Dear <span class="parent-name">${parent.parentName}</span>,
            </div>
            
            <p>We're absolutely <strong>excited</strong> to have your child, <span class="child-name">${parent.childNames}</span>, join us for Rhema Youth Camp 2025! This email contains <strong>important information</strong> for check-in and pick-up.</p>
            
            <div class="venue-info">
                <div class="venue-title">📍 Camp Details</div>
                
                <div class="venue-item">
                    <span class="venue-label">🏫 Venue:</span> Premiere Academy, Lugbe, Abuja
                </div>
                
                <div class="venue-item">
                    <span class="venue-label">📅 Date:</span> Sunday, 17th August 2025
                </div>
                
                <div class="venue-item">
                    <span class="venue-label">⏰ Check-in Time:</span> 1pm - 5pm
                </div>
            </div>
            
            <div class="qr-section">
                <div class="qr-title">🎯 Your Child's Digital QR Code</div>
                <p><strong>Save this QR code to your phone!</strong> You'll need it for both check-in and pick-up.</p>
                
                <div class="qr-container">
                    <img src="${parent.qrCodeUrl}" alt="QR Code for ${parent.childNames}" class="qr-code" />
                </div>
                
                <a href="${parent.qrCodeUrl}" download="rhema-camp-${parent.childNames.replace(/[^a-zA-Z0-9]/g, '-')}-qr.png" class="download-btn">
                    📱 Download QR Code
                </a>
            </div>
            
            <div class="important-info">
                <div class="info-title">🏕️ Camp Check-in & Pick-up Instructions</div>
                
                <div class="info-item">
                    <span class="info-label">📋 Check-in:</span> On the first day, present this digital QR code at the check-in desk. Your child will receive a physical tag with the same QR code for daily camp use.
                </div>
                
                <div class="info-item">
                    <span class="info-label">🚗 Pick-up:</span> On the last day, present this same digital QR code to pick up your child. Our team will scan it to confirm your identity.
                </div>
            </div>
            
            <p>We look forward to an <strong>amazing week</strong> with <span class="child-name">${parent.childNames}</span>! If you have any questions, please don't hesitate to reach out.</p>
        </div>
        
        <div class="footer">
            <p>Best regards,</p>
            <p class="team-signature">The Rhema Youth Camp Team</p>
            
        </div>
    </div>
</body>
</html>`;

  return `To: ${parent.parentEmail}
Subject: Important: Rhema Youth Camp 2025 Check-in & Pick-up Info
Content-Type: text/html; charset=UTF-8

${emailBody}`;
}

export function validateParentData(data: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors };
  }

  if (data.length === 0) {
    errors.push('Array cannot be empty');
    return { isValid: false, errors };
  }

  data.forEach((item, index) => {
    if (!item.parentEmail) {
      errors.push(`Item ${index + 1}: parentEmail is required`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.parentEmail)) {
      errors.push(`Item ${index + 1}: parentEmail is not a valid email address`);
    }
    
    if (!item.parentName) {
      errors.push(`Item ${index + 1}: parentName is required`);
    }
    
    if (!item.childNames) {
      errors.push(`Item ${index + 1}: childNames is required`);
    }
    
    if (!item.qrCodeUrl) {
      errors.push(`Item ${index + 1}: qrCodeUrl is required`);
    } else if (!/^https?:\/\/.+/.test(item.qrCodeUrl)) {
      errors.push(`Item ${index + 1}: qrCodeUrl must be a valid URL`);
    }
  });

  return { isValid: errors.length === 0, errors };
}