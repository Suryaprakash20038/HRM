# 📝 Letter Pad Upload பண்றது எப்படி? (How to Upload Letter Pad)

## 🎯 எங்க Upload பண்றது?

### Step 1: Recruitment Settings-க்கு போங்க
```
1. Recruitment Dashboard open பண்ணுங்க
2. Settings icon click பண்ணுங்க (அல்லது)
3. Direct-ஆ: http://localhost:5173/recruitment/settings
```

### Step 2: Company Branding Tab Select பண்ணுங்க
```
1. Settings page-ல 3 tabs இருக்கும்:
   - General Settings
   - Company Branding  ← இதை click பண்ணுங்க
   - Letter Templates
```

### Step 3: Letter Pad Section கண்டுபிடிங்க
```
Company Branding tab-ல கீழ scroll பண்ணுங்க:

✅ Company Logo upload
✅ Authorized Signature upload
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Letter Pad Design (Optional)  ← இங்க இருக்கும்!
```

---

## 📤 எப்படி Upload பண்றது?

### Method 1: File Select பண்ணுங்க

```
1. "Letter Pad Background Image" section-ல
2. "Choose File" button click பண்ணுங்க
3. உங்க company letterhead image select பண்ணுங்க
4. "Save Branding" button click பண்ணுங்க
```

### Method 2: Drag & Drop (Future)
```
இப்போ file select மட்டும் தான்
Drag & drop feature வர இருக்கு
```

---

## 🖼️ Letter Pad Image Requirements

### ✅ Recommended Specifications:

```
Format:     PNG or JPG
Size:       A4 (2480 x 3508 pixels at 300 DPI)
File Size:  Maximum 5MB
Quality:    High resolution (300 DPI minimum)
```

### 📐 Design Guidelines:

```
┌─────────────────────────────────────┐
│  Header Area (Top 150px)            │ ← Company logo, header design
├─────────────────────────────────────┤
│                                     │
│  Content Area                       │ ← Letter content இங்க வரும்
│  (Safe zone)                        │
│                                     │
├─────────────────────────────────────┤
│  Footer Area (Bottom 120px)         │ ← Footer design, address
└─────────────────────────────────────┘
```

**Important**:
- Top 150px: Header design மட்டும் வைங்க
- Bottom 120px: Footer design மட்டும் வைங்க
- Middle area: Content-க்காக empty-ஆ விடுங்க
- Left/Right: 60px margin விடுங்க

---

## 👀 Live Preview பார்ப்பது எப்படி?

### Upload பண்ணும்போதே Preview தெரியும்:

```
Left Side:                Right Side:
┌─────────────┐          ┌─────────────┐
│ Upload Form │          │ Live Preview│
│             │          │             │
│ • Logo      │          │ [Letter Pad │
│ • Signature │    →     │  Background]│
│ • Letter Pad│          │             │
│             │          │ + Content   │
│ [Save]      │          │   Overlay   │
└─────────────┘          └─────────────┘
```

**Preview Features**:
- ✅ Letter pad background காட்டும்
- ✅ Content overlay position காட்டும்
- ✅ "Letter Pad Mode" badge தெரியும்
- ✅ Sample content உடன் preview

---

## 🎨 என்ன நடக்கும் Upload பண்ணின பிறகு?

### Before (Legacy Mode):
```
┌─────────────────────────────────┐
│ [Logo]                          │
│ Company Name                    │
├─────────────────────────────────┤
│                                 │
│ Letter Content                  │
│                                 │
├─────────────────────────────────┤
│ Footer                          │
└─────────────────────────────────┘
```

### After (Letter Pad Mode):
```
┌─────────────────────────────────┐
│                                 │
│  [Letter Pad Background Image]  │
│                                 │
│    ┌─────────────────────┐     │
│    │ Letter Content      │     │ ← Overlay
│    │ (White box)         │     │
│    └─────────────────────┘     │
│                                 │
└─────────────────────────────────┘
```

---

## 🚀 Complete Workflow

### 1. Prepare Letter Pad Design
```
✓ Photoshop/Canva-ல design பண்ணுங்க
✓ A4 size (2480 x 3508 px)
✓ Header மேல, Footer கீழ
✓ Middle area empty-ஆ விடுங்க
✓ PNG/JPG-ஆ save பண்ணுங்க
```

### 2. Upload to System
```
✓ Recruitment Settings → Company Branding
✓ Letter Pad section scroll பண்ணுங்க
✓ Image select பண்ணுங்க
✓ Preview check பண்ணுங்க
✓ Save Branding click பண்ணுங்க
```

### 3. Verify Upload
```
✓ Success message வரணும்
✓ Preview-ல letter pad தெரியணும்
✓ "Letter Pad Mode" badge இருக்கணும்
```

### 4. Test PDF Generation
```
✓ Candidates page போங்க
✓ ஏதாவது letter generate பண்ணுங்க
✓ PDF open பண்ணி பாருங்க
✓ Letter pad background இருக்கணும்
✓ Content overlay ஆகியிருக்கணும்
```

---

## ⚙️ Backend Setup (Already Done ✅)

### Database Model:
```javascript
letterPad: {
  url: String,        // Cloudinary URL
  publicId: String,   // For deletion
  isActive: Boolean,  // Enable/Disable
  uploadedAt: Date
}
```

### PDF Service:
```javascript
if (letterPad.isActive) {
  // Use letter pad background
  // Overlay content on top
} else {
  // Use legacy header/footer
}
```

---

## 🔧 Troubleshooting

### Issue 1: File Upload Failed
```
Problem: "File size too large"
Solution: 
  - Image-ஐ compress பண்ணுங்க
  - Max 5MB-க்கு கீழ இருக்கணும்
  - Online tools: TinyPNG, Compressor.io
```

### Issue 2: Preview Not Showing
```
Problem: Upload பண்ணியும் preview காட்டல
Solution:
  - Page refresh பண்ணுங்க
  - Browser cache clear பண்ணுங்க
  - Different image try பண்ணுங்க
```

### Issue 3: PDF Not Using Letter Pad
```
Problem: PDF-ல letter pad background இல்ல
Solution:
  - Letter pad upload ஆச்சா check பண்ணுங்க
  - Preview-ல "Letter Pad Mode" badge இருக்கா பாருங்க
  - Backend restart பண்ணுங்க
```

---

## 📍 Current Location

**Frontend File**: 
```
c:\Users\ssath\corrected HRM\HRM\frontend\frontend\src\pages\Recruitment\RecruitmentSettings.jsx
```

**Section**: Lines 305-342
```jsx
<h5>Letter Pad Design (Optional)</h5>
<input 
  type="file" 
  accept="image/png,image/jpeg,image/jpg"
  onChange={(e) => handleFileChange(e, 'letterpad')}
/>
```

---

## ✅ Status

| Feature | Status |
|---------|--------|
| Upload UI | ✅ Ready |
| File Validation | ✅ Ready (5MB max) |
| Preview | ✅ Ready (Live) |
| State Management | ✅ Ready |
| Backend Model | ✅ Ready |
| PDF Service | ✅ Ready |
| API Endpoint | ⏳ Next (Upload handler) |

---

## 🎯 Quick Summary

**இப்போ நீங்க பண்ணணும்:**

1. ✅ **Frontend Ready** - Upload UI இருக்கு
2. ✅ **Preview Ready** - Live preview காட்டும்
3. ⏳ **Backend API** - Upload endpoint create பண்ணணும்

**எங்க Upload பண்றது:**
```
Recruitment Settings → Company Branding → Letter Pad Design
```

**என்ன Upload பண்றது:**
```
Company letterhead design (PNG/JPG, A4 size, max 5MB)
```

**எப்படி Test பண்றது:**
```
1. Image upload பண்ணுங்க
2. Preview பாருங்க
3. Save பண்ணுங்க
4. Letter generate பண்ணி PDF check பண்ணுங்க
```

---

**Frontend UI ready! Backend API endpoint-ஐ next-ஆ create பண்ணலாம்!** 🚀
