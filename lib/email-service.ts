/**
 * Email service for sending verification codes and notifications
 */

interface EmailOptions {
  to: string
  subject: string
  body: string
  isHtml?: boolean
}

/**
 * Send an email using the configured email service
 * This is a simulated function that would be replaced with a real email service in production
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // In a real application, this would use a service like SendGrid, AWS SES, or Nodemailer
  console.log(`[EMAIL SERVICE] Sending email to ${options.to}`)
  console.log(`[EMAIL SERVICE] Subject: ${options.subject}`)
  console.log(`[EMAIL SERVICE] Body: ${options.body}`)

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Log the email for demonstration purposes
  console.log(`[EMAIL SERVICE] Email sent successfully to ${options.to}`)

  // In a real app, you would return true/false based on the email service response
  return true
}

/**
 * Send a verification code email
 */
export async function sendVerificationCodeEmail(email: string, code: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Your Verification Code",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Your Verification Code</h2>
        <p>Please use the following code to complete your authentication:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
          ${code}
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          This code will expire in 15 minutes. If you did not request this code, please ignore this email.
        </p>
      </div>
    `,
    isHtml: true,
  })
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Welcome to Our Secure Platform",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Welcome, ${name}!</h2>
        <p>Thank you for registering with our secure platform. Your account has been created successfully.</p>
        <p>Here are some tips to keep your account secure:</p>
        <ul>
          <li>Use a strong, unique password</li>
          <li>Enable two-factor authentication</li>
          <li>Never share your login credentials</li>
          <li>Be cautious of phishing attempts</li>
        </ul>
        <p>If you have any questions or need assistance, please contact our support team.</p>
      </div>
    `,
    isHtml: true,
  })
}

