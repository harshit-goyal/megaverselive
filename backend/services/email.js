const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Support both SendGrid and Gmail
    if (process.env.EMAIL_SERVICE === 'sendgrid') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } else {
      // Gmail/custom SMTP
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  async sendBookingConfirmation(booking, mentorInfo) {
    const { customer_name, customer_email, start_time, end_time, session_topic } = booking;
    const startDate = new Date(start_time).toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7e22ce;">Booking Confirmed! 🎉</h2>
        
        <p>Hi ${customer_name},</p>
        
        <p>Your 1:1 session with <strong>${mentorInfo.name}</strong> has been confirmed!</p>
        
        <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Session Details:</strong></p>
          <p>📅 <strong>Date & Time:</strong> ${startDate} IST</p>
          <p>⏱️ <strong>Duration:</strong> 45 minutes</p>
          <p>📝 <strong>Topic:</strong> ${session_topic || 'General Discussion'}</p>
          <p>👤 <strong>Mentor:</strong> ${mentorInfo.name}</p>
        </div>
        
        <p><strong>What's next?</strong></p>
        <ul>
          <li>A Zoom/Google Meet link will be sent 30 minutes before the session</li>
          <li>Please be ready 5 minutes early</li>
          <li>Have your questions prepared!</li>
        </ul>
        
        <p>If you need to reschedule or cancel, please reply to this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px;">
          <strong>Megaverse Live</strong><br>
          1:1 Sessions with Real Mentors<br>
          hello@megaverselive.com
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'hello@megaverselive.com',
        to: customer_email,
        subject: `Session Confirmed: ${startDate} with ${mentorInfo.name}`,
        html,
      });

      console.log(`✅ Confirmation email sent to ${customer_email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      return false;
    }
  }

  async sendReminder(booking, mentorInfo) {
    const { customer_name, customer_email, start_time } = booking;
    const startDate = new Date(start_time).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7e22ce;">Reminder: Your Session is Tomorrow! 🔔</h2>
        
        <p>Hi ${customer_name},</p>
        
        <p>Your 1:1 session with <strong>${mentorInfo.name}</strong> is scheduled for tomorrow:</p>
        
        <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>📅 <strong>${startDate} IST</strong></p>
          <p>⏱️ <strong>Duration:</strong> 45 minutes</p>
        </div>
        
        <p style="color: #10b981; font-weight: bold;">
          ✅ Join link will be sent 30 minutes before the session starts.
        </p>
        
        <p>See you soon!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px;">
          <strong>Megaverse Live</strong><br>
          1:1 Sessions with Real Mentors
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'hello@megaverselive.com',
        to: customer_email,
        subject: `Reminder: Your session tomorrow at ${startDate}`,
        html,
      });

      console.log(`✅ Reminder email sent to ${customer_email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending reminder email:', error);
      return false;
    }
  }

  async sendCancellationConfirmation(booking, mentorInfo) {
    const { customer_name, customer_email, start_time } = booking;
    const startDate = new Date(start_time).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Booking Cancelled</h2>
        
        <p>Hi ${customer_name},</p>
        
        <p>Your session scheduled for <strong>${startDate}</strong> with ${mentorInfo.name} has been cancelled.</p>
        
        <p>If this was unexpected or you'd like to reschedule, please contact us at hello@megaverselive.com</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          <strong>Megaverse Live</strong><br>
          1:1 Sessions with Real Mentors
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'hello@megaverselive.com',
        to: customer_email,
        subject: 'Booking Cancelled - Megaverse Live',
        html,
      });

      console.log(`✅ Cancellation email sent to ${customer_email}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending cancellation email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
