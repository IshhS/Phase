import nodemailer from 'nodemailer';


export async function sendTeamInvite({ userEmail, userName, teamName, leaderName, isLeader }) {
    if (!userEmail) {
        console.warn('[Phase Mailer] No recipient email provided.');
        return;
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'undefined' || process.env.SMTP_PASS === 'undefined') {
        console.warn('[Phase Mailer] SMTP credentials not configured or invalid. Skipping email send.');
        return;
    }

    console.log(`[Phase Mailer] Sending to: ${userEmail} using ${process.env.SMTP_USER}`);

    // Using service: 'gmail' for better reliability with Gmail accounts
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS, // This must be the 16-char app password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const fromEmail = process.env.PHASE_ADMIN_EMAIL || process.env.SMTP_USER;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

    const subject = isLeader
        ? `Project "${teamName}" Initialized - Phase Development`
        : `Invitation: Join Team "${teamName}" - Phase Development`;

    const html = `
    <div style="font-family: sans-serif; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 24px; border: 1px solid #c9b037; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #c9b037; letter-spacing: 4px; margin: 0; font-size: 28px;">PHASE</h1>
        <p style="color: #666; letter-spacing: 2px; font-size: 10px; margin-top: 5px;">DEVELOPMENT TUNNEL</p>
      </div>
      
      <p>Dear ${userName || 'User'},</p>
      
      ${isLeader
            ? `<p>Your project <strong>"${teamName}"</strong> has been initialized successfully. You are the project lead.</p>`
            : `<p>You have been added to the project <strong>"${teamName}"</strong> by <strong>${leaderName}</strong>.</p>`
        }
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${appUrl}" style="display: inline-block; padding: 14px 30px; background: #c9b037; color: #000; text-decoration: none; border-radius: 12px; font-weight: bold;">Access Dashboard</a>
      </div>
      
      <p style="font-size: 12px; color: #888; border-top: 1px solid #222; padding-top: 20px; margin-top: 40px;">
        Phase System Administrator
      </p>
    </div>
  `;

    try {
        const info = await transporter.sendMail({
            from: `"Phase Development" <${fromEmail}>`,
            to: userEmail,
            subject,
            html,
        });
        console.log(`[Phase Mailer] Invite sent! Response: ${info.response}`);
    } catch (err) {
        console.error(`[Phase Mailer] Invite FAILED for ${userEmail}:`, err.message);
    }
}

export async function sendWelcomeEmail({ userEmail, userName }) {
    if (!userEmail) return;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'undefined' || process.env.SMTP_PASS === 'undefined') {
        console.warn('[Phase Mailer] SMTP credentials not configured or invalid. Skipping welcome email send.');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const fromEmail = process.env.PHASE_ADMIN_EMAIL || process.env.SMTP_USER;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const html = `
    <div style="font-family: sans-serif; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 24px; border: 1px solid #c9b037; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #c9b037; letter-spacing: 4px; margin: 0; font-size: 28px;">WELCOME TO PHASE</h1>
      </div>
      <p>Dear ${userName},</p>
      <p>Your account has been successfully created. Welcome to the Phase Development Tunnel.</p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${appUrl}" style="display: inline-block; padding: 14px 30px; background: #c9b037; color: #000; text-decoration: none; border-radius: 12px; font-weight: bold;">Login to Dashboard</a>
      </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Phase Admin" <${fromEmail}>`,
            to: userEmail,
            subject: 'Welcome to Phase Development',
            html,
        });
        console.log(`[Phase Mailer] Welcome email sent to ${userEmail}`);
    } catch (err) {
        console.error(`[Phase Mailer] Welcome email FAILED for ${userEmail}:`, err.message);
    }
}

