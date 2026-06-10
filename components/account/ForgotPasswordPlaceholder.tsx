import { Mail } from "lucide-react";
export function ForgotPasswordPlaceholder({ onSignIn }: { onSignIn: () => void }) {
  return <div className="auth-placeholder"><span><Mail size={25} /></span><p className="eyebrow">PASSWORD RECOVERY</p><h2>Recovery is coming with production accounts.</h2><p>For this private beta, your account exists only in this browser. Return to sign in with the locally saved credentials.</p><button className="auth-submit" onClick={onSignIn}>Return to sign in</button></div>;
}
