## 🧩 Workshop EP Plan (แบ่งเป็น 3 Phase)
✅ Phase 1 – Core Backend Foundation & Kafka (EP1–EP5)
EP	หัวข้อ	รายละเอียด
1	Microservice Overview & Fastify Setup	- อธิบายแนวคิด microservice + Kafka
- สร้าง service แรก (UserService) ด้วย Fastify
2	Prisma ORM + PostgreSQL	- สร้าง schema สำหรับ User
- ใช้ Prisma migrate + seeding
- สร้าง basic CRUD
3	Kafka Messaging – Producer	- ติดตั้ง Kafka + KafkaJS
- ส่ง event “user.created” ไป Kafka เมื่อมีการสร้าง user
4	Kafka Consumer	- เขียน service ที่ 2 (NotificationService)
- consume event “user.created” แล้ว log หรือส่ง email mock
5	Service Communication + Error Handling	- จัดการ retry, dead-letter, validation
- สร้าง health check endpoint + docs (เช่น OpenAPI ผ่าน Fastify plugin)

## 🎨 Phase 2 – เริ่มฝั่ง Frontend (EP6–EP9)
EP	หัวข้อ	รายละเอียด
6	Frontend Project Setup	- สร้าง React App (Vite) + Zustand store base
- เริ่ม layout ด้วย Ant Design
- ทำ routing ด้วย React Router
7	React Query + Hook Form	- Connect ไปยัง user CRUD API
- ทำ form สำหรับสร้าง user โดยใช้ RHF
- ใช้ react-query สำหรับ fetch users
8	Notification Feed	- สร้างหน้า feed ดึง event ที่ consumer log มา (mock API ก่อน)
- ทดลอง refresh, loading state, caching
9	Micro Frontend Concept	- แยกหน้า user กับ notification เป็น module
- แนะนำการ deploy แบบแยก repo หรือ sub-paths

## 🚀 Phase 3 – Integration & Real-World Features (EP10–EP12)
EP	หัวข้อ	รายละเอียด
10	Auth Service + Frontend Login	- สร้าง AuthService (JWT-based)
- เพิ่มระบบ login form ด้วย React Hook Form
11	Role-based UI + Kafka UI Tool	- เพิ่ม role (admin/user) และปรับ UI ตาม role
- ใช้ Kafka UI (e.g. Kowl, Kafka UI) ตรวจ event
12	Deploy & Final Demo	- Docker Compose หรือ Railway Deploy
- Showcase ทั้งระบบ Backend–Frontend แบบเต็มรูปแบบ

## 🧠 Bonus:
AsyncAPI docs สำหรับ event documentation

GitHub Monorepo Structure แนะนำใช้ NX, TurboRepo หรือแบ่งเป็น 2 repo (BE/FE)

