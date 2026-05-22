export function isEmailNotConfirmedError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('email not confirmed') ||
    m.includes('email_not_confirmed') ||
    m.includes('confirm your email')
  );
}

export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (isEmailNotConfirmedError(message)) {
    return 'Please confirm your email first. Check your inbox (and spam), then try logging in again.';
  }
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'Wrong student ID or WhatsApp number. Use the same number you registered with (08… or 62…).';
  }
  return message;
}
