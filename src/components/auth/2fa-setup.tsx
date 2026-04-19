'use client';

import { useState, useEffect } from 'react';
import { Shield, Smartphone, ArrowRight, CheckCircle2, AlertCircle, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';

interface TwoFactorSetupProps {
  onSuccess?: () => void;
}

export function TwoFactorSetup({ onSuccess }: TwoFactorSetupProps) {
  const { t, language } = useI18n();
  const isRTL = language === 'ar';
  const { toast } = useToast();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(false);

  // بدء إعداد 2FA
  const handleStartSetup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/setup', { method: 'POST' });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setQrCode(data.qrCodeUrl);
      setSecret(data.secret);
      setStep(2);
    } catch (error: any) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل بدء إعداد المصادقة الثنائية' : 'Failed to initiate 2FA setup'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تفعيل 2FA بعد التحقق من الكود
  const handleEnable2FA = async () => {
    if (!code || code.length !== 6) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setBackupCodes(data.backupCodes || []);
      setEnabled(true);
      setStep(3);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'كود التحقق غير صحيح' : 'Invalid verification code'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: isRTL ? 'تم النسخ إلى الحافظة' : 'Copied to clipboard',
    });
  };

  if (step === 1) {
    return (
      <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader>
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-yellow-500" />
          </div>
          <CardTitle className="text-xl text-white">
            {isRTL ? 'تفعيل المصادقة الثنائية' : 'Enable Two-Factor Authentication'}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {isRTL 
              ? 'قم بإضافة طبقة حماية إضافية لحسابك باستخدام تطبيق المصادقة.' 
              : 'Add an extra layer of security to your account using an authenticator app.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <Smartphone className="w-5 h-5 text-zinc-400 mt-0.5" />
            <div className="text-sm text-zinc-300">
              {isRTL 
                ? 'ستحتاج إلى تطبيق مثل Google Authenticator أو Microsoft Authenticator.' 
                : 'You will need an app like Google Authenticator or Microsoft Authenticator.'}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" 
            onClick={handleStartSetup}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isRTL ? 'بدء الإعداد' : 'Start Setup'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === 2) {
    return (
      <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">
            {isRTL ? 'الخطوة 2: ربط التطبيق' : 'Step 2: Link App'}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {isRTL 
              ? 'امسح رمز QR التالي في تطبيق المصادقة الخاص بك.' 
              : 'Scan the following QR code in your authenticator app.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {qrCode && (
            <div className="p-4 bg-white rounded-xl">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
          )}
          
          <div className="w-full space-y-2">
            <p className="text-sm text-zinc-400 text-center">
              {isRTL ? 'أو أدخل السر يدوياً:' : 'Or enter the secret manually:'}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-black/30 rounded border border-white/10 text-yellow-500 text-center font-mono text-sm">
                {secret}
              </code>
              <Button size="icon" variant="ghost" onClick={() => secret && copyToClipboard(secret)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="w-full space-y-2">
            <label className="text-sm text-zinc-300">
              {isRTL ? 'كود التحقق المكون من 6 أرقام:' : '6-digit verification code:'}
            </label>
            <Input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="bg-black/30 border-white/10 text-white text-center text-lg tracking-widest"
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 text-zinc-400">
            {isRTL ? 'رجوع' : 'Back'}
          </Button>
          <Button 
            className="flex-[2] bg-yellow-500 hover:bg-yellow-600 text-black"
            onClick={handleEnable2FA}
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isRTL ? 'تفعيل وتحقق' : 'Verify & Enable'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl">
      <CardHeader>
        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        </div>
        <CardTitle className="text-xl text-white">
          {isRTL ? 'تم تفعيل الحماية بنجاح!' : '2FA Enabled Successfully!'}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {isRTL 
            ? 'حسابك الآن محمي بطبقة أمان ثنائية.' 
            : 'Your account is now protected with 2FA.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-500/10 border-blue-500/30">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          <AlertTitle className="text-blue-500">{isRTL ? 'أكواد الاحتياط' : 'Backup Codes'}</AlertTitle>
          <AlertDescription className="text-zinc-300 text-xs">
            {isRTL 
              ? 'احفظ هذه الأكواد في مكان آمن. ستستخدمها إذا فقدت الوصول لهاتفك.' 
              : 'Save these codes in a safe place. You will need them if you lose access to your phone.'}
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((c, i) => (
            <div key={i} className="p-2 bg-black/30 rounded border border-white/10 text-xs text-center font-mono text-zinc-400">
              {c}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-white/10 hover:bg-white/20 text-white" onClick={() => setStep(1)}>
          {isRTL ? 'إغلاق' : 'Close'}
        </Button>
      </CardFooter>
    </Card>
  );
}
