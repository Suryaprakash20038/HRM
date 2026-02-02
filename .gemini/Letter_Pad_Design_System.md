# 🎨 Letter Pad Design & Overlay System - Complete Implementation

## ✅ System Overview

A professional Letter Pad Design upload and overlay system that allows:
- Upload company letterhead design as background
- Overlay dynamic content on top
- Fixed positioning to avoid header/footer overlap
- Automatic PDF generation with perfect alignment
- Live preview before sending

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  LETTER PAD SYSTEM                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. ADMIN UPLOADS LETTER PAD DESIGN                    │
│     ↓                                                   │
│  2. SYSTEM STORES IN DATABASE + CLOUDINARY             │
│     ↓                                                   │
│  3. ADMIN SETS CONTENT MARGINS (Top/Bottom/Left/Right) │
│     ↓                                                   │
│  4. SYSTEM CALCULATES SAFE CONTENT AREA                │
│     ↓                                                   │
│  5. HR GENERATES LETTER WITH TEMPLATE                  │
│     ↓                                                   │
│  6. PDF SERVICE OVERLAYS CONTENT ON LETTER PAD         │
│     ↓                                                   │
│  7. PDF GENERATED & EMAILED TO CANDIDATE               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (MongoDB)

### Enhanced CompanyBranding Model

```javascript
{
  companyName: String,
  logo: { url, publicId },
  signature: { url, publicId },
  
  // NEW: Letter Pad Design
  letterPad: {
    url: String,              // Cloudinary URL
    publicId: String,         // For deletion
    isActive: Boolean,        // Enable/Disable overlay
    uploadedAt: Date,
    uploadedBy: ObjectId      // Admin who uploaded
  },
  
  // NEW: Layout Positioning
  layoutSettings: {
    contentMargin: {
      top: 150,     // px from top (avoid header)
      bottom: 120,  // px from bottom (avoid footer)
      left: 60,     // px from left
      right: 60     // px from right
    },
    pageSize: {
      width: 595,   // A4 width in points
      height: 842   // A4 height in points
    },
    safeArea: {     // Auto-calculated
      x: 60,
      y: 150,
      width: 475,
      height: 572
    }
  },
  
  // Legacy (for backward compatibility)
  headerContent: String,
  footerContent: String
}
```

---

## 🔧 Implementation Details

### 1. Model Enhancement ✅ DONE

**File**: `backend/src/models/Recruitment/CompanyBranding.js`

**Features**:
- Letter pad image storage
- Layout margin settings
- Safe area auto-calculation
- Pre-save hook for calculations

### 2. PDF Service Update ✅ DONE

**File**: `backend/src/services/pdf.service.js`

**Two Modes**:

#### Mode 1: Letter Pad Overlay (When Active)
```html
<body>
  <!-- Fixed Background -->
  <div class="letterpad-background" 
       style="background-image: url(letterpad.png)">
  </div>
  
  <!-- Content Overlay -->
  <div class="content-overlay" 
       style="top: 150px; left: 60px; right: 60px; bottom: 120px">
    {{dynamic_content}}
  </div>
</body>
```

#### Mode 2: Legacy (Header/Footer)
```html
<body>
  <div class="header">Logo + Header</div>
  <div class="content">{{dynamic_content}}</div>
  <div class="footer">Footer + Signature</div>
</body>
```

---

## 📋 API Endpoints (To Be Created)

### Upload Letter Pad Design

```javascript
POST /api/recruitment-settings/branding/letterpad

Headers:
  Authorization: Bearer <admin_token>
  Content-Type: multipart/form-data

Body:
  letterPad: <file> (PNG/JPG, max 5MB)

Response:
{
  success: true,
  message: "Letter pad uploaded successfully",
  data: {
    url: "https://cloudinary.com/...",
    publicId: "letterpad_123"
  }
}
```

### Update Layout Settings

```javascript
PUT /api/recruitment-settings/branding/layout

Headers:
  Authorization: Bearer <admin_token>

Body:
{
  contentMargin: {
    top: 150,
    bottom: 120,
    left: 60,
    right: 60
  }
}

Response:
{
  success: true,
  message: "Layout settings updated",
  data: {
    safeArea: {
      x: 60,
      y: 150,
      width: 475,
      height: 572
    }
  }
}
```

### Toggle Letter Pad

```javascript
PATCH /api/recruitment-settings/branding/letterpad/toggle

Body:
{
  isActive: true
}

Response:
{
  success: true,
  message: "Letter pad activated"
}
```

### Preview Letter Pad

```javascript
GET /api/recruitment-settings/branding/letterpad/preview

Response:
{
  success: true,
  data: {
    letterPadUrl: "https://...",
    margins: { top, bottom, left, right },
    safeArea: { x, y, width, height },
    sampleHTML: "<preview html>"
  }
}
```

---

## 🎨 Frontend Implementation (To Be Created)

### Letter Pad Upload Component

**Location**: `frontend/src/pages/Recruitment/RecruitmentSettings.jsx`

**Features**:
1. **Upload Section**:
   - Drag & drop file upload
   - Image preview
   - File size validation (max 5MB)
   - Format validation (PNG/JPG only)

2. **Layout Settings**:
   - Margin sliders (Top/Bottom/Left/Right)
   - Live preview with sample content
   - Safe area visualization
   - Grid overlay for alignment

3. **Preview Panel**:
   - Shows letter pad background
   - Overlays sample text in safe area
   - Highlights margins in different colors
   - Zoom in/out controls

4. **Controls**:
   - Enable/Disable toggle
   - Save settings button
   - Reset to defaults
   - Delete letter pad

---

## 🖼️ Live Preview Logic

```javascript
// Preview Component
function LetterPadPreview({ letterPad, margins, sampleContent }) {
  return (
    <div className="preview-container" style={{
      width: '595px',
      height: '842px',
      position: 'relative',
      backgroundImage: `url(${letterPad.url})`,
      backgroundSize: 'cover'
    }}>
      {/* Margin Guides */}
      <div className="margin-guide top" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: `${margins.top}px`,
        background: 'rgba(255, 0, 0, 0.2)',
        border: '2px dashed red'
      }}>
        <span>Header Area (No Content)</span>
      </div>
      
      {/* Safe Content Area */}
      <div className="safe-area" style={{
        position: 'absolute',
        top: `${margins.top}px`,
        left: `${margins.left}px`,
        right: `${margins.right}px`,
        bottom: `${margins.bottom}px`,
        border: '2px solid green',
        padding: '20px',
        overflow: 'auto'
      }}>
        <div dangerouslySetInnerHTML={{ __html: sampleContent }} />
      </div>
      
      {/* Bottom Margin Guide */}
      <div className="margin-guide bottom" style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: `${margins.bottom}px`,
        background: 'rgba(255, 0, 0, 0.2)',
        border: '2px dashed red'
      }}>
        <span>Footer Area (No Content)</span>
      </div>
    </div>
  );
}
```

---

## 📐 Layout Calculation

### Safe Area Formula

```javascript
safeArea = {
  x: contentMargin.left,
  y: contentMargin.top,
  width: pageSize.width - contentMargin.left - contentMargin.right,
  height: pageSize.height - contentMargin.top - contentMargin.bottom
}
```

### Example:
```
Page: 595 x 842 pt (A4)
Margins: Top=150, Bottom=120, Left=60, Right=60

Safe Area:
  x = 60
  y = 150
  width = 595 - 60 - 60 = 475
  height = 842 - 150 - 120 = 572
```

---

## 🔐 Roles & Permissions

| Role | Upload Letter Pad | Edit Layout | Toggle Active | Generate Letters |
|------|-------------------|-------------|---------------|------------------|
| Super Admin | ✅ | ✅ | ✅ | ✅ |
| HR Admin | ❌ | ❌ | ❌ | ✅ |
| HR Executive | ❌ | ❌ | ❌ | ✅ |

---

## 🎯 Best Practices

### 1. Letter Pad Design Guidelines

**Recommended Specifications**:
- **Format**: PNG (with transparency) or JPG
- **Resolution**: 300 DPI minimum
- **Size**: A4 (2480 x 3508 px at 300 DPI)
- **File Size**: Under 5MB
- **Color Mode**: RGB

**Design Tips**:
- Keep header within top 150px
- Keep footer within bottom 120px
- Leave 60px margins on left/right
- Use subtle background colors
- Avoid busy patterns in content area

### 2. Content Margin Settings

**Default Values** (Recommended):
```javascript
{
  top: 150,    // Company header/logo area
  bottom: 120, // Footer/signature area
  left: 60,    // Left margin
  right: 60    // Right margin
}
```

**Adjustment Guide**:
- **Large Header**: Increase top margin (150-200px)
- **Small Header**: Decrease top margin (100-150px)
- **Footer with Signature**: Increase bottom margin (120-150px)
- **Minimal Footer**: Decrease bottom margin (80-120px)

### 3. Avoiding Layout Shifting

**CSS Best Practices**:
```css
/* Fixed background - never moves */
.letterpad-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-size: cover;
  background-position: center;
}

/* Absolute positioning for content */
.content-overlay {
  position: absolute;
  top: 150px;  /* Fixed value */
  left: 60px;  /* Fixed value */
  right: 60px; /* Fixed value */
  bottom: 120px; /* Fixed value */
}
```

---

## 🧪 Testing Checklist

### Upload & Configuration
- [ ] Upload PNG letter pad (< 5MB)
- [ ] Upload JPG letter pad (< 5MB)
- [ ] Reject files > 5MB
- [ ] Reject non-image files
- [ ] Preview shows uploaded design
- [ ] Adjust top margin (100-200px)
- [ ] Adjust bottom margin (80-150px)
- [ ] Adjust left/right margins (40-80px)
- [ ] Safe area updates automatically
- [ ] Toggle letter pad on/off

### PDF Generation
- [ ] Generate Interview Call with letter pad
- [ ] Generate Next Round with letter pad
- [ ] Generate Offer Letter with letter pad
- [ ] Generate Rejection with letter pad
- [ ] Content stays within safe area
- [ ] No overlap with header
- [ ] No overlap with footer
- [ ] Background image clear and sharp
- [ ] Text readable on background

### Edge Cases
- [ ] Very long content (multiple pages)
- [ ] Tables in content
- [ ] Lists in content
- [ ] Special characters
- [ ] Different template types
- [ ] Toggle between letter pad and legacy mode

---

## 📊 Current Status

| Component | Status | File |
|-----------|--------|------|
| Database Model | ✅ Complete | `CompanyBranding.js` |
| PDF Service | ✅ Complete | `pdf.service.js` |
| API Endpoints | ⏳ Pending | To be created |
| Frontend UI | ⏳ Pending | To be created |
| File Upload | ⏳ Pending | Cloudinary integration |
| Live Preview | ⏳ Pending | React component |

---

## 🚀 Next Steps

### Phase 1: Backend API (Priority)
1. Create letter pad upload endpoint
2. Create layout settings endpoint
3. Create toggle endpoint
4. Create preview endpoint
5. Add file validation middleware
6. Integrate Cloudinary for storage

### Phase 2: Frontend UI
1. Add Letter Pad tab in Recruitment Settings
2. Create upload component with drag & drop
3. Create margin adjustment sliders
4. Create live preview panel
5. Add enable/disable toggle
6. Add save/reset buttons

### Phase 3: Testing & Polish
1. Test with real company letter pads
2. Fine-tune margin calculations
3. Add loading states
4. Add error handling
5. Create user documentation
6. Add tooltips and help text

---

## 📝 Summary in Tamil

### என்ன செய்யப்பட்டது:

1. **Database Model** ✅
   - Letter pad image storage
   - Layout margin settings
   - Safe area auto-calculation

2. **PDF Service** ✅
   - Letter pad overlay support
   - Dynamic content positioning
   - Two modes: Overlay & Legacy

### இன்னும் செய்ய வேண்டியவை:

1. **API Endpoints** ⏳
   - Upload letter pad
   - Update margins
   - Toggle on/off
   - Preview

2. **Frontend UI** ⏳
   - Upload component
   - Margin sliders
   - Live preview
   - Controls

### எப்படி வேலை செய்யும்:

```
1. Admin letter pad design upload பண்ணுவாங்க
2. System-ல store ஆகும்
3. Admin margins set பண்ணுவாங்க (top/bottom/left/right)
4. HR letter generate பண்ணும்போது:
   - Letter pad background-ஆ வரும்
   - Content மேல overlay ஆகும்
   - Header/footer overlap ஆகாது
5. PDF perfect-ஆ generate ஆகும்
6. Email-ல send ஆகும்
```

**Backend ready! Frontend UI create பண்ணணும்!** 🚀
