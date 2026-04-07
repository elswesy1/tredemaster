# TradeMaster Project Documentation

## نظام المصادقة (Authentication)

### الوصف
يستخدم المشروع نظام مصادقة موحد يعتمد على JWT tokens مخزنة في cookies.

### المكونات

1. **`src/lib/auth-simple.ts`** - النظام الأساسي للمصادقة
   - `createToken()` - إنشاء JWT token
   - `verifyToken()` - التحقق من الـ token
   - `loginUser()` - تسجيل الدخول
   - `registerUser()` - تسجيل مستخدم جديد
   - `getCurrentUser()` - الحصول على المستخدم الحالي من cookie

2. **`src/lib/auth-middleware.ts`** - Middleware للحماية
   - `getAuthUser()` - الحصول على المستخدم الحالي (للاستخدام في API routes)
   - `authMiddleware()` - حماية المسارات المحمية

3. **Cookie Name**: `auth-token`
   - صلاحية: 7 أيام
   - httpOnly: true
   - secure: true في production

### API Routes التي تستخدم نظام المصادقة

| Route | الوظيفة |
|-------|---------|
| `/api/auth/login` | تسجيل الدخول |
| `/api/auth/register` | تسجيل مستخدم جديد |
| `/api/auth/me` | الحصول على المستخدم الحالي |
| `/api/dashboard` | بيانات لوحة التحكم |
| `/api/trading-accounts` | إدارة الحسابات |

### كيفية الاستخدام في API routes

```typescript
import { getAuthUser } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  
  if (!user) {
    return NextResponse.json({ 
      error: 'غير مصرح', 
      message: 'يجب تسجيل الدخول' 
    }, { status: 401 })
  }
  
  // استخدام user.userId للوصول لقاعدة البيانات
  const data = await prisma.someModel.findMany({
    where: { userId: user.userId }
  })
  
  return NextResponse.json(data)
}
```

### Troubleshooting

#### مشكلة: خطأ 401 Unauthorized
- **السبب**: الـ cookie `auth-token` غير موجود أو غير صالح
- **الحل**: تسجيل الدخول مرة أخرى

#### مشكلة: خطأ 500 Internal Server Error
- **السبب**: مشكلة في الاتصال بقاعدة البيانات أو في الـ token verification
- **الحل**: التحقق من DATABASE_URL و NEXTAUTH_SECRET في environment variables

### Environment Variables المطلوبة

```env
DATABASE_URL="postgresql://..."  # Neon PostgreSQL
NEXTAUTH_SECRET="your-secret-key"  # مفتاح سري للتشفير
NEXTAUTH_URL="https://your-domain.vercel.app"  # URL الموقع
```
