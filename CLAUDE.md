# CLAUDE.md — FitTracker (Fitness Tracking Web App)

คู่มือสำหรับ Claude Code ใช้อ้างอิงตลอดการพัฒนาโปรเจกต์นี้ อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง

---

## 1. Tech Stack (บังคับใช้)

```
Frontend
├── Next.js 16.1.6 (App Router)
├── React
├── TypeScript (strict mode)
├── Tailwind CSS
├── shadcn/ui
└── Recharts (สำหรับกราฟ progression)

Forms
└── react-hook-form + @hookform/resolvers ^5.2.2 (คู่กับ zod สำหรับ validation)

Tables
└── @tanstack/react-table (ใช้กับ Workout History, Recent History, Program list)

Backend
├── Next.js API Routes (Route Handlers)
└── Mongoose

Database
└── MongoDB
```

### กติกาการเขียนโค้ด
- **TypeScript strict mode เท่านั้น** — ห้าม `any` โดยไม่จำเป็น, ต้องมี type/interface ให้ทุก schema และ API response
- **Styling ด้วย Tailwind + shadcn/ui เท่านั้น** — ห้ามใช้ inline style (`style={{...}}`)
- **ฟอร์มทุกฟอร์มใช้ react-hook-form + @hookform/resolvers (zod)** — ห้ามทำ controlled form มือเปล่า
- **ตารางทุกตารางใช้ Tanstack Table** — Workout History, Recent History, Exercise list, Program list
- โครงสร้างไฟล์แบบ Next.js App Router (`app/`, `components/`, `lib/`, `models/`, `types/`)
- แยก Mongoose model ออกจาก Zod schema (แต่ควร derive type ให้สอดคล้องกัน)

---

## 2. Data Model (MongoDB / Mongoose)

หลักการสำคัญที่สุด: **แยก "Program Template" ออกจาก "Workout Log จริง" เด็ดขาด** ห้ามแก้ target ของ Program เมื่อผู้ใช้บันทึกผลจริง

```
Program (โปรแกรมหลัก)
 └── WorkoutPlan (โปรแกรมรอง เช่น Push A, Pull A)
       └── WorkoutPlanExercise (target: sets/reps/weight)
             └── Exercise (คลังท่ากลาง, ใช้ซ้ำได้หลายโปรแกรม)

WorkoutLog (collection แยกต่างหาก — actual data)
 └── exercises[]
       └── sets[] { reps, weight, duration, rpe?, rir? }

BodyWeight (collection แยก — เพิ่มเติม)
PersonalRecord (collection แยก หรือ derived — เพิ่มเติม)
```

### Collections

**Program**
```ts
{
  _id, name, description, status: "active" | "archived"
}
```

**WorkoutPlan**
```ts
{
  _id, programId, name, day: number, description
}
```

**Exercise**
```ts
{
  _id, name, muscleGroup, equipment, type: "compound" | "isolation"
}
```

**WorkoutPlanExercise**
```ts
{
  _id, workoutPlanId, exerciseId, order,
  targetSets, targetReps, targetWeight
}
```

**WorkoutLog**
```ts
{
  _id, userId, workoutPlanId, date,
  exercises: [{
    exerciseId,
    sets: [{ set, reps, weight, duration, rpe?, rir? }],
    note?
  }],
  status: "in_progress" | "completed"
}
```

**BodyWeight** (เพิ่มเติม)
```ts
{ _id, userId, date, weight, note? }
```

**PersonalRecord** (เพิ่มเติม)
```ts
{ _id, userId, exerciseId, weight, reps, estimated1RM, achievedAt, workoutLogId }
```

---

## 3. หน้าหลัก (Pages)

1. **Dashboard** — จำนวน workout, total volume, current streak, workout/สัปดาห์, weight ล่าสุด, weight progress chart, active program, recent workout, PR ล่าสุด
2. **Programs** — 3 tabs: Programs / Workout Plans / Exercises
3. **Exercise Detail** — current / best / estimated 1RM, weight progress chart, recent history table, สลับ metric ได้ (Weight / Volume / Reps / Est. 1RM / Total Sets)
4. **Workout Today** — หน้าใช้บ่อยที่สุด, auto-fill จาก workout ก่อนหน้า, checklist ต่อ set, rest timer ระหว่าง set, ปุ่ม Finish Workout
5. **Progress Analytics** — Weight / Volume / Estimated 1RM (Epley Formula) / RPE-RIR
6. **History** — ตาราง workout log ทั้งหมด (Tanstack Table)
7. **Settings**

### Navigation
```
FitTracker
├── Dashboard
├── Programs (Program / Workout Plans / Exercises)
├── Workouts
├── Exercises
├── Statistics
├── History
└── Settings
```

---

## 4. สูตรคำนวณ

```
Volume = Weight × Reps (รวมทุก set)
Estimated 1RM (Epley) = weight × (1 + reps / 30)
```

---

## 5. Feature เสริม (Enhanced Features)

นอกเหนือจาก MVP ให้เพิ่มฟีเจอร์เหล่านี้เข้าไปในแผนพัฒนา (implement หลัง MVP core เสร็จ):

### 5.1 Personal Record (PR) Detection
- ตรวจจับ PR อัตโนมัติทุกครั้งที่ finish workout (เทียบ weight/reps/est.1RM กับประวัติ)
- แสดง toast/badge "🏆 New PR" พร้อมเทียบค่าก่อนหน้า
- หน้า Dashboard แสดง PR ล่าสุด 3-5 รายการ
- เก็บลง collection `PersonalRecord` แยกเพื่อ query เร็ว

### 5.2 Rest Timer
- นับถอยหลัง/นับเดินหน้าอัตโนมัติหลังกด "เสร็จ set"
- ตั้งเวลา default ได้ต่อ exercise หรือ global setting
- แจ้งเตือนเสียง/vibration เมื่อครบเวลา (ใช้ Web Notification API หรือ sound)

### 5.3 Body Weight Tracking
- หน้าเพิ่ม/ดูประวัติน้ำหนักตัว (line chart)
- เทียบ overlay กับ strength progression ของ exercise ที่เลือกได้ (composite chart ด้วย Recharts)

### 5.4 RPE / RIR
- เพิ่ม field ต่อ set ใน Workout Today (optional input)
- แสดงในกราฟ/ตาราง history เป็น column เสริม
- ใช้วิเคราะห์ intensity trend แยกจาก volume

### 5.5 Notes
- Note ระดับ exercise (ต่อ workout log) — มีอยู่ใน MVP data model แล้ว (`note` field)
- Note ระดับ workout log โดยรวม (เพิ่ม field `overallNote` ที่ WorkoutLog)
- แสดง note history ในหน้า Exercise Detail และ History

### 5.6 Workout Template
- บันทึก workout ที่ทำบ่อยเป็น template แยกจาก Program (สำหรับ ad-hoc workout ที่ไม่ผูกกับโปรแกรมหลัก)

### 5.7 Advanced Analytics
- Muscle group volume distribution (pie/bar chart จาก `muscleGroup` ของ Exercise)
- Weekly/Monthly volume trend
- Consistency heatmap (คล้าย GitHub contribution graph)

### 5.8 Notification / Reminder
- แจ้งเตือนวันที่ควรออกกำลังกายตาม schedule ของ Program
- แจ้งเตือน streak ใกล้ขาด

### 5.9 Mobile / PWA
- ทำ manifest.json + service worker ให้ใช้งานแบบ installable app บนมือถือ
- Workout Today ต้อง mobile-first โดยเฉพาะ (ใช้งานหน้างานจริงที่ยิม)

---

## 6. ลำดับการพัฒนา (แนะนำให้ Claude Code ทำทีละเฟส)

```
Phase 1 — Foundation
  → Setup Next.js + TS strict + Tailwind + shadcn/ui + Mongoose connection
  → Mongoose schemas: Program, WorkoutPlan, Exercise, WorkoutPlanExercise, WorkoutLog
  → Zod schemas คู่กับแต่ละ model

Phase 2 — API Routes
  → CRUD: Programs, WorkoutPlans, Exercises, WorkoutPlanExercises
  → WorkoutLog: create / update (in progress) / finish

Phase 3 — Program Management UI
  → Programs / Workout Plans / Exercises tabs
  → ฟอร์มด้วย react-hook-form + zod resolver

Phase 4 — Workout Today
  → Auto-fill จาก workout log ล่าสุดของ workoutPlanId เดียวกัน
  → บันทึก set แบบ real-time, Finish Workout

Phase 5 — Dashboard + Exercise Detail + Graph
  → Recharts: weight progress, metric switcher
  → Tanstack Table: recent history

Phase 6 — Enhanced Features (ตามลำดับ 5.1 → 5.9)
```

---

## 7. UI Direction

- Dark mode เป็นหลัก
- Sidebar navigation (desktop) / bottom nav หรือ hamburger (mobile)
- Card-based dashboard
- Line chart สำหรับทุก progression metric
- ปุ่ม Start / Finish Workout ต้องเด่นชัด ขนาดใหญ่ กด thumb-friendly บนมือถือ
- ใช้สี accent แยก state: completed (เขียว), PR (ทอง/เหลือง), in-progress (น้ำเงิน/primary)
- Responsive: Desktop (sidebar + multi-column) และ Mobile (single column, bottom-fixed action button)
