# 25+ Template System - Complete Guide

## Overview
The Multi-Template Letter System now supports **25+ professional templates** across **5 letter types**, with **5-6 design variations** per type.

---

## Template Structure

### Current Implementation (6 Offer Letter Templates)
✅ **Completed:**
1. `offer-classic` - Traditional formal design
2. `offer-modern` - Contemporary with gradients
3. `offer-professional` - Corporate and polished
4. `offer-creative` - Bold and innovative
5. `offer-minimal` - Clean and simple
6. `offer-executive` - Premium for senior positions

### Remaining Templates to Add (19 more)

#### **Appointment Letter Templates** (5 templates)
- `appointment-classic`
- `appointment-modern`
- `appointment-professional`
- `appointment-creative`
- `appointment-minimal`

#### **Interview Call Letter Templates** (5 templates)
- `interview-classic`
- `interview-modern`
- `interview-professional`
- `interview-creative`
- `interview-minimal`

#### **Experience Letter Templates** (5 templates)
- `experience-classic`
- `experience-modern`
- `experience-professional`
- `experience-creative`
- `experience-minimal`

#### **Relieving Letter Templates** (4 templates)
- `relieving-classic`
- `relieving-modern`
- `relieving-professional`
- `relieving-minimal`

**Total: 25 Templates** (6 Offer + 5 Appointment + 5 Interview + 5 Experience + 4 Relieving)

---

## How to Add New Templates

### Step 1: Add Template Definition to `letterDesigns.js`

```javascript
'appointment-modern': {
  name: 'Modern Appointment',
  category: 'Appointment Letter',
  description: 'Contemporary appointment letter design',
  html: `
    <div class="letter-modern-appointment">
      <!-- Header -->
      <div class="header">
        {{#if logo}}
        <img src="{{logo}}" class="logo" />
        {{/if}}
        <h1>{{company_name}}</h1>
      </div>
      
      <!-- Content -->
      <div class="content">
        <p class="date">{{current_date}}</p>
        <p class="salutation">Dear {{candidate_name}},</p>
        
        <h2>Letter of Appointment</h2>
        
        <div class="body-content">
          {{body_content}}
        </div>
        
        <!-- Appointment Details -->
        {{#if designation}}
        <div class="appointment-details">
          <h3>Appointment Details</h3>
          <table>
            <tr><td>Position:</td><td>{{designation}}</td></tr>
            <tr><td>Department:</td><td>{{department}}</td></tr>
            <tr><td>Joining Date:</td><td>{{joining_date}}</td></tr>
            <tr><td>Reporting To:</td><td>{{reporting_manager}}</td></tr>
          </table>
        </div>
        {{/if}}
        
        <!-- Signature -->
        <div class="signature-block">
          {{#if signature}}
          <img src="{{signature}}" class="signature" />
          {{/if}}
          <p><strong>{{hr_name}}</strong></p>
          <p>HR Manager</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p>{{footer_text}}</p>
      </div>
    </div>
  `,
  css: `
    .letter-modern-appointment {
      font-family: 'Inter', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    /* Add your CSS styles here */
  `
}
```

### Step 2: Update Frontend DesignSelection Component

Update `DesignSelection.jsx` to categorize templates by letter type:

```javascript
const designs = [
  // Offer Letters
  { id: 'offer-classic', name: 'Classic', category: 'Offer Letter', icon: '📜' },
  { id: 'offer-modern', name: 'Modern', category: 'Offer Letter', icon: '✨' },
  { id: 'offer-professional', name: 'Professional', category: 'Offer Letter', icon: '💼' },
  { id: 'offer-creative', name: 'Creative', category: 'Offer Letter', icon: '🎨' },
  { id: 'offer-minimal', name: 'Minimal', category: 'Offer Letter', icon: '⚪' },
  { id: 'offer-executive', name: 'Executive', category: 'Offer Letter', icon: '👔' },
  
  // Appointment Letters
  { id: 'appointment-classic', name: 'Classic', category: 'Appointment Letter', icon: '📜' },
  { id: 'appointment-modern', name: 'Modern', category: 'Appointment Letter', icon: '✨' },
  // ... add more
];
```

### Step 3: Add Category Filter

```javascript
const [selectedCategory, setSelectedCategory] = useState('Offer Letter');

// Filter designs by category
const filteredDesigns = designs.filter(d => d.category === selectedCategory);

// Render category tabs
<div className="category-tabs">
  <button onClick={() => setSelectedCategory('Offer Letter')}>Offer</button>
  <button onClick={() => setSelectedCategory('Appointment Letter')}>Appointment</button>
  <button onClick={() => setSelectedCategory('Interview Call')}>Interview</button>
  <button onClick={() => setSelectedCategory('Experience Letter')}>Experience</button>
  <button onClick={() => setSelectedCategory('Relieving Letter')}>Relieving</button>
</div>
```

---

## AI Template Generation (Future Enhancement)

### Option 1: Generate from Online References

```javascript
// AI Service to generate templates
async function generateTemplateFromReference(url) {
  // 1. Fetch the reference template
  const html = await fetchTemplate(url);
  
  // 2. Use AI to analyze structure
  const analysis = await aiAnalyze(html, {
    prompt: `Analyze this letter template and extract:
    - Header structure
    - Footer structure
    - Body content area
    - Styling (colors, fonts, layout)
    - Placeholders for dynamic content`
  });
  
  // 3. Generate fixed template with placeholders
  const template = {
    name: analysis.templateName,
    category: analysis.letterType,
    html: analysis.htmlStructure.replace(
      /static text/g,
      '{{placeholder}}'
    ),
    css: analysis.extractedCSS
  };
  
  // 4. Save to database
  await saveTemplate(template);
  
  return template;
}
```

### Option 2: Convert Company Uploaded Templates

```javascript
// AI Service to convert uploaded templates
async function convertUploadedTemplate(file) {
  // 1. Extract content based on file type
  let content;
  if (file.type === 'application/pdf') {
    content = await extractPDFContent(file);
  } else if (file.type === 'application/msword') {
    content = await extractDOCContent(file);
  } else if (file.type === 'text/html') {
    content = await file.text();
  }
  
  // 2. Use AI to detect sections
  const sections = await aiDetectSections(content, {
    prompt: `Identify and extract:
    - Header section (logo, company name, address)
    - Footer section (contact info, legal text)
    - Body content area
    - Dynamic fields (name, date, salary, etc.)`
  });
  
  // 3. Convert to template format
  const template = {
    name: `Custom ${sections.companyName}`,
    category: sections.letterType,
    html: generateHTMLFromSections(sections),
    css: extractOrGenerateCSS(sections),
    isCustom: true,
    companyId: currentUser.companyId
  };
  
  // 4. Save as company-specific template
  await saveCompanyTemplate(template);
  
  return template;
}
```

---

## Placeholder System

### Standard Placeholders (All Templates)
```
{{logo}} - Company logo URL
{{signature}} - HR signature URL
{{company_name}} - Company name
{{company_address}} - Company address
{{candidate_name}} - Candidate/Employee name
{{designation}} - Job title/position
{{current_date}} - Current date
{{reference_number}} - Auto-generated reference
{{hr_name}} - HR manager name
{{body_content}} - Main letter content (sanitized)
{{footer_text}} - Footer contact information
```

### Letter-Specific Placeholders

**Offer Letter:**
```
{{salary}} / {{ctc}} - Salary/compensation
{{joining_date}} - Start date
{{expiry_date}} - Offer expiry date
```

**Appointment Letter:**
```
{{department}} - Department name
{{reporting_manager}} - Manager name
{{probation_period}} - Probation duration
{{work_location}} - Office location
```

**Interview Call:**
```
{{interview_date}} - Interview date
{{interview_time}} - Interview time
{{interview_mode}} - Online/Offline
{{interview_link}} - Meeting link
{{interview_location}} - Office address
{{interview_round}} - Round name
```

**Experience Letter:**
```
{{employment_start}} - Joining date
{{employment_end}} - Last working day
{{total_experience}} - Duration worked
{{last_designation}} - Final position
```

**Relieving Letter:**
```
{{resignation_date}} - Resignation submitted date
{{last_working_day}} - Final day
{{notice_period}} - Notice period served
{{clearance_status}} - All clear/pending
```

---

## Database Schema (Recommended)

### LetterTemplate Model
```javascript
const LetterTemplateSchema = new mongoose.Schema({
  templateId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Offer Letter', 'Appointment Letter', 'Interview Call', 'Experience Letter', 'Relieving Letter'],
    required: true 
  },
  description: String,
  html: { type: String, required: true },
  css: { type: String, required: true },
  placeholders: [String],
  isSystem: { type: Boolean, default: true },
  isCustom: { type: Boolean, default: false },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

---

## API Endpoints

### Get Templates by Category
```javascript
GET /api/templates?category=Offer Letter
Response: [
  {
    templateId: 'offer-modern',
    name: 'Modern Offer',
    category: 'Offer Letter',
    description: 'Contemporary offer letter design',
    previewUrl: '/previews/offer-modern.png'
  },
  // ... more templates
]
```

### Generate Template from URL (AI)
```javascript
POST /api/templates/generate
Body: {
  referenceUrl: 'https://example.com/template.html',
  category: 'Offer Letter',
  name: 'Custom Modern'
}
Response: {
  templateId: 'offer-custom-1',
  status: 'generated',
  preview: '...'
}
```

### Upload Company Template (AI)
```javascript
POST /api/templates/upload
Body: FormData {
  file: [PDF/DOC/HTML file],
  category: 'Offer Letter',
  companyId: '12345'
}
Response: {
  templateId: 'company-offer-1',
  status: 'converted',
  preview: '...'
}
```

---

## Frontend Integration

### Updated Modal Flow

```javascript
// Step 1: Select Letter Type
<div className="letter-type-selection">
  <button onClick={() => setLetterType('Offer Letter')}>Offer Letter</button>
  <button onClick={() => setLetterType('Appointment')}>Appointment</button>
  <button onClick={() => setLetterType('Interview')}>Interview Call</button>
  <button onClick={() => setLetterType('Experience')}>Experience</button>
  <button onClick={() => setLetterType('Relieving')}>Relieving</button>
</div>

// Step 2: Select Design Template (filtered by letter type)
<DesignSelection
  letterType={letterType}
  selectedDesign={formData.designId}
  onSelectDesign={(id) => setFormData({ ...formData, designId: id })}
/>

// Step 3: Enter Content
<ContentForm
  formData={formData}
  letterType={letterType}
  onFormChange={setFormData}
/>
```

---

## Implementation Roadmap

### Phase 1: Core Templates (Current)
- ✅ 6 Offer Letter templates
- ⏳ 5 Appointment Letter templates
- ⏳ 5 Interview Call templates
- ⏳ 5 Experience Letter templates
- ⏳ 4 Relieving Letter templates

### Phase 2: AI Generation
- ⏳ AI template generator from URLs
- ⏳ Template preview generator
- ⏳ Template validation system

### Phase 3: Company Upload
- ⏳ PDF/DOC parser
- ⏳ AI section detector
- ⏳ Template converter
- ⏳ Company template manager

### Phase 4: Advanced Features
- ⏳ Template versioning
- ⏳ A/B testing
- ⏳ Analytics (which templates are used most)
- ⏳ Template marketplace

---

## Next Steps

1. **Add Remaining Templates** - Copy the pattern from offer templates to create appointment, interview, experience, and relieving templates

2. **Update Frontend** - Add letter type selection before design selection

3. **Implement AI Generation** - Set up AI service for template generation

4. **Add Upload Feature** - Create UI for company template upload

5. **Testing** - Test all 25+ templates with real data

---

## File Locations

**Backend:**
- `backend/src/utils/letterDesigns.js` - Template definitions
- `backend/src/services/pdf.service.js` - PDF generation
- `backend/src/services/ai.service.js` - AI template generation (to be created)

**Frontend:**
- `frontend/src/components/Recruitment/DesignSelection.jsx` - Template gallery
- `frontend/src/components/Recruitment/ContentForm.jsx` - Content form
- `frontend/src/components/Recruitment/LetterTypeSelector.jsx` - Letter type selection (to be created)

---

**Status:** Phase 1 in progress (6/25 templates complete)
**Next:** Add remaining 19 templates following the same pattern
