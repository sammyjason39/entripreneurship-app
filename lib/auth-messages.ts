export function isEmailNotConfirmedError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('email not confirmed') ||
    m.includes('email_not_confirmed') ||
    m.includes('confirm your email')
  );
}

export function friendlyAuthError(message: string): string {
  if (isEmailNotConfirmedError(message)) {
    return 'Please confirm your email first. Check your inbox (and spam), then try logging in again.';
  }
  return message;
}
