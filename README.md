# MELLOW SOAP

เว็บไซต์ร้านสบู่ MELLOW SOAP (HTML, CSS, JavaScript)

## เปิดดูเว็บไซต์ในเครื่อง
1. แตกไฟล์ ZIP
2. เปิดโฟลเดอร์ `mellow_soap_website`
3. ดับเบิลคลิก `index.html` เพื่อดูหน้าเว็บ

## โครงสร้าง
- `index.html` หน้าเว็บไซต์
- `styles.css` รูปแบบและสี
- `app.js` สินค้า ตะกร้า และการส่งคำสั่งซื้อ
- `google-apps-script/Code.gs` ตัวอย่าง API สำหรับ Google Sheets

## สถานะระบบ
หน้าเว็บมีตะกร้าและฟอร์มสั่งซื้อแล้ว หากยังไม่ใส่ URL ของ Apps Script จะบันทึกคำสั่งซื้อไว้ในเบราว์เซอร์เพื่อทดสอบเท่านั้น ไม่ได้ส่งไป Google Sheets และไม่ใช่ระบบชำระเงินจริง

## เชื่อม Google Sheets
1. เปิด Google Sheet ฐานข้อมูล MELLOW SOAP
2. ไปที่ Extensions > Apps Script
3. นำโค้ดจาก `google-apps-script/Code.gs` ไปวาง
4. ตรวจสอบชื่อชีตและหัวตารางให้ตรงกับไฟล์ฐานข้อมูล
5. Deploy > New deployment > Web app
6. ตั้ง Execute as: Me และ Who has access: Anyone (สำหรับงานทดสอบเท่านั้น)
7. คัดลอก Web app URL ที่ลงท้าย `/exec`
8. เปิด `app.js` แล้วใส่ URL ใน `GOOGLE_APPS_SCRIPT_URL`

ก่อนใช้งานจริง ต้องเพิ่มการยืนยันตัวตนและมาตรการป้องกันการเรียก API โดยบุคคลภายนอก รวมถึงทดสอบการจอง/คืนสต็อกและการจัดการข้อมูลส่วนบุคคล

## เผยแพร่ผ่าน Vercel
อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้น GitHub จากนั้นนำ repository ไป Import ใน Vercel โดยใช้ค่าเริ่มต้นสำหรับ Static Site ได้เลย
