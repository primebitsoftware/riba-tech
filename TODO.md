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

## متبقي
- [ ] اختبار يدوي على أحجام شائعة (360x640, 390x844, 768x1024, 1366x768)
- [ ] استبدال نصوص آراء العملاء العربية (placeholder حالياً)
- [ ] صفحات Terms of Service و Privacy Policy (روابط فارغة `#`)
- [ ] روابط السوشال ميديا في الفوتر (فارغة `#`)
- [ ] (اختياري) عرض رسائل Supabase داخل لوحة التحكم admin.html
