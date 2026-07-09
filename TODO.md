# TODO — تحسين الموقع

## تم إنجازه ✅
- [x] تحديث `style.css`:
  - [x] إضافة fluid typography باستخدام `clamp()` للعناوين الرئيسية (hero/section/about)
  - [x] إضافة breakpoints إضافية عند `max-width: 540px` و `max-width: 360px`
  - [x] تقليل paddings/heights الثابتة (`hero-section`, `.section-padding`) باستخدام `clamp()`
  - [x] منع overlap بين الهيدر الثابت وأول قسم عبر `scroll-padding-top`
  - [x] ضمان سلاسة الصور (`img { max-width:100%; height:auto }`)
  - [x] قائمة برجر على التابلت (≤1024px) بدل ازدحام الروابط
  - [x] إظهار تفاصيل البورتفوليو على أجهزة اللمس (بدون hover)
- [x] تحديث `main.js` لتخفيف canvas animations على الموبايل + دعم prefers-reduced-motion
- [x] ربط نموذج التواصل بـ Supabase (مشروع RIBA TECH — جدول `contact_messages`)

## دفعة التحسينات الثانية ✅
- [x] زر واتساب عائم (بانتظار الرقم — عدّل `DEFAULT_WHATSAPP` في main.js)
- [x] حفظ تقديرات الحاسبة كـ leads في Supabase (جدول `project_leads`)
- [x] Favicon + Open Graph tags للمشاركة على السوشال
- [x] قسم "كيف نعمل؟" (5 خطوات، ثنائي اللغة)
- [x] إعادة كتابة آراء العملاء العربية
- [x] إخفاء أيقونات السوشال الفارغة (معلّقة بالكود لحين جاهزيتها)

## متبقي
- [ ] إدخال رقم الواتساب الفعلي في `DEFAULT_WHATSAPP` (main.js)
- [ ] تحديث og:url و og:image لروابط مطلقة بعد ربط الدومين
- [ ] صفحات Terms of Service و Privacy Policy (روابط فارغة `#`)
- [ ] روابط السوشال ميديا (معلّقة بالفوتر — فعّلها لما تجهز)
- [ ] (اختياري) عرض رسائل Supabase داخل لوحة التحكم admin.html
- [ ] (اختياري) قسم أرقام وإنجازات + شعارات العملاء + FAQ
