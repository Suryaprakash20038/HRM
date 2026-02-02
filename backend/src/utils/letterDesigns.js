/**
 * Multi-Template Letter Design System
 * 25+ Professional Templates across 5 Letter Types
 * Each letter type has 5-6 design variations
 */

const letterDesigns = {

  // ==================== PROMOTION LETTER TEMPLATES ====================

  'promotion-classic': {
    name: 'Classic Promotion',
    category: 'Promotion',
    description: 'Traditional formal promotion letter',
    html: `
      <div class="letter-classic">
        <div class="header">
          {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
          <h1>{{company_name}}</h1>
          <p class="company-address">{{company_address}}</p>
        </div>
        <div class="content">
          <p class="date">Date: {{current_date}}</p>
          <p class="ref">Ref: {{reference_number}}</p>
          <p class="salutation">Dear {{candidate_name}},</p>
          <h2 class="subject">Subject: Promotion to {{designation}}</h2>
          <div class="body-content">
            <p>We are pleased to inform you that you have been promoted to the position of <strong>{{designation}}</strong>.</p>
            {{body_content}}
          </div>
          {{#if salary}}
          <div class="offer-details">
            <h3>New Compensation Details:</h3>
            <table>
              <tr><td>New Position:</td><td>{{designation}}</td></tr>
              <tr><td>New CTC:</td><td>{{ctc}}</td></tr>
              <tr><td>Effective Date:</td><td>{{joining_date}}</td></tr>
            </table>
          </div>
          {{/if}}
          <div class="signature-block">
            <p>Sincerely,</p>
            {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
            <p><strong>{{hr_name}}</strong><br>HR Manager<br>{{company_name}}</p>
          </div>
        </div>
        <div class="footer"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-classic { font-family: 'Georgia', serif; color: #2c3e50; max-width: 800px; margin: 0 auto; padding: 40px; background: #ffffff; } .letter-classic .header { text-align: center; border-bottom: 3px double #2c3e50; padding-bottom: 20px; margin-bottom: 30px; } .letter-classic .logo { max-height: 80px; margin-bottom: 15px; } .letter-classic h1 { font-size: 28px; font-weight: 700; margin: 10px 0; } .letter-classic .company-address { font-size: 12px; color: #7f8c8d; } .letter-classic .subject { font-size: 16px; text-decoration: underline; margin: 20px 0; } .letter-classic .offer-details { background: #f8f9fa; padding: 20px; margin: 25px 0; border-left: 4px solid #2c3e50; } .letter-classic .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #bdc3c7; text-align: center; font-size: 11px; }`
  },

  'promotion-modern': {
    name: 'Modern Promotion',
    category: 'Promotion',
    description: 'Contemporary promotion letter',
    html: `
      <div class="letter-modern">
        <div class="header-bar"></div>
        <div class="header">
          <div class="logo-section">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div>
          <div class="company-info"><h1>{{company_name}}</h1><p>{{company_address}}</p></div>
        </div>
        <div class="content">
          <div class="meta-info"><span class="date-badge">{{current_date}}</span></div>
          <p class="salutation">Dear {{candidate_name}},</p>
          <div class="offer-banner">
            <h2>Congratulations on Your Promotion!</h2>
            <p class="position">{{designation}}</p>
          </div>
          <div class="body-content">{{body_content}}</div>
          {{#if salary}}
          <div class="offer-card">
            <div class="offer-item"><span class="label">New Position</span><span class="value">{{designation}}</span></div>
            <div class="offer-item"><span class="label">New CTC</span><span class="value">{{ctc}}</span></div>
            <div class="offer-item"><span class="label">Effective Date</span><span class="value">{{joining_date}}</span></div>
          </div>
          {{/if}}
          <div class="signature-block">
            <p class="regards">Best Regards,</p>
            {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
            <div class="hr-details"><p class="hr-name">{{hr_name}}</p><p class="hr-title">HR Manager</p></div>
          </div>
        </div>
        <div class="footer"><div class="footer-content">{{footer_text}}</div></div>
      </div>
    `,
    css: `.letter-modern { font-family: 'Inter', sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; background: #fff; } .header-bar { height: 8px; background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%); } .header { padding: 30px; background: #f8fafc; display: flex; align-items: center; gap: 20px; } .logo { max-height: 60px; } .offer-banner { background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; } .offer-card { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 30px 0; } .offer-item { background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; } .offer-item .value { font-weight: 700; color: #0f172a; display: block; } .footer { background: #0f172a; color: #cbd5e1; padding: 20px; text-align: center; font-size: 11px; margin-top: 40px; }`
  },

  'promotion-professional': {
    name: 'Professional Promotion',
    category: 'Promotion',
    description: 'Corporate polished promotion letter',
    html: `
      <div class="letter-professional">
        <div class="header">
           {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
           <div class="header-right"><h1>{{company_name}}</h1></div>
        </div>
        <div class="divider"></div>
        <div class="content">
          <div class="document-header"><h2>LETTER OF PROMOTION</h2></div>
          <div class="document-info">
            <table>
              <tr><td><strong>Date:</strong></td><td>{{current_date}}</td></tr>
              <tr><td><strong>To:</strong></td><td>{{candidate_name}}</td></tr>
              <tr><td><strong>New Role:</strong></td><td>{{designation}}</td></tr>
            </table>
          </div>
          <div class="body-content">{{body_content}}</div>
          {{#if salary}}
          <div class="compensation-section">
            <h3>New Compensation Details</h3>
            <div class="comp-grid">
               <div class="comp-item"><span class="comp-label">New CTC</span><span class="comp-value">{{ctc}}</span></div>
               <div class="comp-item"><span class="comp-label">Effective Date</span><span class="comp-value">{{joining_date}}</span></div>
            </div>
          </div>
          {{/if}}
          <div class="signature-block">
             {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
             <div class="signatory-info"><p class="name">{{hr_name}}</p><p class="title">HR Manager</p></div>
          </div>
        </div>
        <div class="footer"><div class="footer-bar"></div><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-professional { font-family: 'Arial', sans-serif; color: #2d3748; max-width: 800px; margin: 0 auto; padding: 40px; } .header { display: flex; justify-content: space-between; align-items: center; } .logo { max-height: 60px; } .divider { height: 3px; background: #2b6cb0; margin: 20px 0; } .document-header { text-align: center; margin: 30px 0; } .document-header h2 { color: #2b6cb0; letter-spacing: 2px; } .document-info { background: #f7fafc; padding: 20px; border-left: 4px solid #2b6cb0; } .compensation-section { background: #edf2f7; padding: 20px; border-radius: 8px; margin: 30px 0; } .comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } .comp-item { background: white; padding: 15px; text-align: center; border-radius: 4px; } .comp-value { font-weight: 700; display: block; } .footer-bar { height: 2px; background: #e2e8f0; margin-bottom: 10px; }`
  },

  'promotion-creative': {
    name: 'Creative Promotion',
    category: 'Promotion',
    description: 'Bold and innovative promotion letter',
    html: `
      <div class="letter-creative">
         <div class="header-creative">
            {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
            <h1>{{company_name}}</h1>
         </div>
         <div class="content-creative">
            <div class="greeting"><span class="recipient-name">Congratulations, {{candidate_name}}!</span></div>
            <div class="offer-title">
               <h2>Promotion Update</h2>
               <p class="position-highlight">{{designation}}</p>
            </div>
            <div class="body-content">{{body_content}}</div>
            {{#if salary}}
            <div class="offer-highlights">
               <div class="highlight-box"><div class="label">New Role</div><div class="value">{{designation}}</div></div>
               <div class="highlight-box"><div class="label">New CTC</div><div class="value">{{ctc}}</div></div>
               <div class="highlight-box"><div class="label">Effective From</div><div class="value">{{joining_date}}</div></div>
            </div>
            {{/if}}
            <div class="signature-creative">
               {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
               <div class="signature-details"><p class="signer-name">{{hr_name}}</p><p class="signer-role">HR Manager</p></div>
            </div>
         </div>
         <div class="footer-creative"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-creative { font-family: 'Poppins', sans-serif; color: #1a1a2e; max-width: 800px; margin: 0 auto; background: #fff; } .header-creative { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; color: white; } .logo { filter: brightness(0) invert(1); max-height: 50px; } .offer-title { background: #fff5f5; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; } .position-highlight { color: #f5576c; font-size: 20px; font-weight: 700; margin: 0; } .offer-highlights { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 30px 0; } .highlight-box { background: #fdf2f8; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #fbcfe8; } .footer-creative { background: #fce7f3; padding: 20px; text-align: center; font-size: 11px; }`
  },

  'promotion-minimal': {
    name: 'Minimal Promotion',
    category: 'Promotion',
    description: 'Clean and simple promotion letter',
    html: `
      <div class="letter-minimal">
        <div class="header-minimal">
          {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
          <h1>{{company_name}}</h1>
        </div>
        <div class="content-minimal">
          <p class="meta">{{current_date}} | {{reference_number}}</p>
          <p class="to">{{candidate_name}}</p>
          <h2 class="subject">Promotion Letter</h2>
          <div class="body-content">{{body_content}}</div>
          {{#if salary}}
          <div class="offer-summary">
            <div class="summary-row"><span>New Position:</span><span>{{designation}}</span></div>
            <div class="summary-row"><span>New CTC:</span><span>{{ctc}}</span></div>
            <div class="summary-row"><span>Effective Date:</span><span>{{joining_date}}</span></div>
          </div>
          {{/if}}
          <div class="signature-minimal">
            {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
            <p class="name">{{hr_name}}</p>
            <p class="role">HR Manager</p>
          </div>
        </div>
        <div class="footer-minimal"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-minimal { font-family: 'Helvetica Neue', sans-serif; color: #000; max-width: 750px; margin: 0 auto; padding: 50px; } .header-minimal { border-bottom: 1px solid #000; padding-bottom: 20px; margin-bottom: 40px; } .logo { max-height: 50px; } .subject { font-size: 18px; text-transform: uppercase; letter-spacing: 1px; margin: 30px 0; } .offer-summary { border: 1px solid #e0e0e0; padding: 20px; margin: 30px 0; } .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; } .footer-minimal { border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 50px; text-align: center; font-size: 10px; color: #999; }`
  },

  'promotion-executive': {
    name: 'Executive Promotion',
    category: 'Promotion',
    description: 'Premium promotion letter',
    html: `
      <div class="letter-executive">
        <div class="header-executive">
           {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
           <div class="header-right"><h1>{{company_name}}</h1><p class="tagline">Executive Management</p></div>
        </div>
        <div class="content-executive">
          <div class="document-title"><h2>Notice of Promotion</h2><p class="subtitle">{{designation}}</p></div>
          <div class="meta-executive">
             <div class="meta-item"><span class="label">Date</span><span class="value">{{current_date}}</span></div>
             <div class="meta-item"><span class="label">Employee</span><span class="value">{{candidate_name}}</span></div>
          </div>
          <div class="body-content">{{body_content}}</div>
          {{#if salary}}
          <div class="compensation-executive">
            <h3>New Compensation Structure</h3>
            <div class="comp-details">
               <div class="comp-row"><span class="comp-label">Designation</span><span class="comp-value">{{designation}}</span></div>
               <div class="comp-row highlight"><span class="comp-label">Annual CTC</span><span class="comp-value">{{ctc}}</span></div>
               <div class="comp-row"><span class="comp-label">Effective</span><span class="comp-value">{{joining_date}}</span></div>
            </div>
          </div>
          {{/if}}
          <div class="signature-executive">
             {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
             <div class="signature-info"><p class="name">{{hr_name}}</p><p class="title">Chief Human Resources Officer</p></div>
          </div>
        </div>
        <div class="footer-executive"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-executive { font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 50px; border: 1px solid #d4af37; background: #fffcf5; } .header-executive { display: flex; justify-content: space-between; border-bottom: 2px solid #d4af37; padding-bottom: 20px; } .logo { max-height: 70px; } .tagline { color: #d4af37; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; } .document-title { text-align: center; margin: 30px 0; } .subtitle { color: #d4af37; font-weight: bold; font-size: 18px; } .meta-executive { background: #fff; border: 1px solid #d4af37; padding: 15px; display: flex; justify-content: space-around; margin: 20px 0; } .compensation-executive { background: #fff; border: 1px solid #d4af37; padding: 20px; } .comp-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; } .comp-row.highlight { background: #fdf6e3; font-weight: bold; } .footer-executive { text-align: center; margin-top: 50px; font-size: 11px; color: #666; border-top: 1px solid #d4af37; padding-top: 10px; }`
  },

  'promotion-elegant': {
    name: 'Elegant Promotion',
    category: 'Promotion',
    description: 'Sophisticated promotion letter',
    html: `
      <div class="letter-elegant">
         <div class="header-elegant">
            {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
            <h1>{{company_name}}</h1>
         </div>
         <div class="content-elegant">
            <p class="date">{{current_date}}</p>
            <p class="salutation">Dear {{candidate_name}},</p>
            <div class="title-section"><span class="ornament">❧</span><h2>Promotion Letter</h2><span class="ornament">❧</span></div>
            <div class="body-content">
               <p>We are delighted to announce your promotion to <strong class="highlight">{{designation}}</strong>.</p>
               {{body_content}}
            </div>
            {{#if salary}}
            <div class="details-elegant">
               <p><strong>New Role:</strong> {{designation}}</p>
               <p><strong>New Annual CTC:</strong> {{ctc}}</p>
               <p><strong>Effective Date:</strong> {{joining_date}}</p>
            </div>
            {{/if}}
            <div class="signature-block">
               <p>Sincerely,</p>
               {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
               <p><strong>{{hr_name}}</strong></p>
            </div>
         </div>
         <div class="footer-elegant"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-elegant { font-family: 'Playfair Display', serif; max-width: 800px; margin: 0 auto; padding: 60px; border: double 6px #e5e5e5; background: #fff; } .header-elegant { text-align: center; margin-bottom: 40px; } .title-section { text-align: center; color: #7c3aed; margin: 30px 0; } .title-section h2 { display: inline; font-style: italic; border-bottom: 1px solid #7c3aed; } .ornament { color: #c4b5fd; font-size: 20px; padding: 0 10px; } .highlight { color: #7c3aed; } .details-elegant { background: #faf5ff; padding: 20px; text-align: center; border: 1px dashed #d8b4fe; margin: 30px 0; } .footer-elegant { text-align: center; margin-top: 50px; font-size: 11px; color: #a1a1aa; border-top: 1px solid #f4f4f5; padding-top: 20px; }`
  },

  'promotion-corporate': {
    name: 'Corporate Promotion',
    category: 'Promotion',
    description: 'Professional business style promotion',
    html: `
      <div class="letter-corporate">
         <div class="sidebar">
            {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
            <div class="company-details"><h3>{{company_name}}</h3><p>{{footer_text}}</p></div>
         </div>
         <div class="main-content">
            <div class="top-bar"></div>
            <div class="content">
               <div class="meta-grid"><div><strong>Date:</strong> {{current_date}}</div><div><strong>Ref:</strong> {{reference_number}}</div></div>
               <h1 class="doc-title">PROMOTION LETTER</h1>
               <div class="to-address"><strong>To:</strong> {{candidate_name}}<br><strong>New Role:</strong> {{designation}}</div>
               <div class="body-content">{{body_content}}</div>
               {{#if salary}}
               <table class="offer-table">
                  <tr><td>New Position</td><td>{{designation}}</td></tr>
                  <tr><td>New CTC</td><td>{{ctc}}</td></tr>
                  <tr><td>Effective Date</td><td>{{joining_date}}</td></tr>
               </table>
               {{/if}}
               <div class="signature-section">
                  <p>Authorized Signatory</p>
                  {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
                  <p><strong>{{hr_name}}</strong><br>HR Manager</p>
               </div>
            </div>
         </div>
      </div>
    `,
    css: `.letter-corporate { display: flex; font-family: 'Arial', sans-serif; min-height: 800px; color: #334155; } .sidebar { width: 200px; background: #1e293b; color: white; padding: 30px; display: flex; flex-direction: column; } .logo { background: white; padding: 5px; margin-bottom: 20px; } .main-content { flex: 1; } .top-bar { height: 15px; background: #334155; } .content { padding: 40px; } .doc-title { font-size: 24px; border-bottom: 2px solid #334155; display: inline-block; margin-bottom: 30px; } .to-address { background: #f1f5f9; padding: 15px; border-left: 4px solid #334155; margin-bottom: 30px; } .offer-table { width: 100%; border-collapse: collapse; margin: 20px 0; } .offer-table td { border: 1px solid #cbd5e1; padding: 10px; } .offer-table tr:nth-child(odd) { background: #f8fafc; }`
  },

  'promotion-vibrant': {
    name: 'Vibrant Promotion',
    category: 'Promotion',
    description: 'Energetic promotion letter',
    html: `
      <div class="letter-vibrant">
         <div class="header-vibrant">
            <div class="header-text"><h1>{{company_name}}</h1><p>CONGRATULATIONS!</p></div>
            {{#if logo}}<div class="logo-box"><img src="{{logo}}" class="logo" /></div>{{/if}}
         </div>
         <div class="content-vibrant">
            <p class="date"><strong>Date:</strong> {{current_date}}</p>
            <p class="hello">Hello {{candidate_name}}!</p>
            <div class="offer-msg">You've leveled up! We are thrilled to promote you to <span>{{designation}}</span>!</div>
            <div class="body-content">{{body_content}}</div>
            {{#if salary}}
            <div class="stats-grid">
               <div class="stat-box"><span class="label">New Role</span><span class="value">{{designation}}</span></div>
               <div class="stat-box"><span class="label">New CTC</span><span class="value">{{ctc}}</span></div>
            </div>
            {{/if}}
            <div class="signature-block">
               <p>Cheers,</p>
               {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
               <p><strong>{{hr_name}}</strong></p>
            </div>
         </div>
         <div class="footer-vibrant">{{footer_text}}</div>
      </div>
    `,
    css: `.letter-vibrant { font-family: 'Verdana', sans-serif; max-width: 800px; margin: 0 auto; } .header-vibrant { background: #e11d48; color: white; padding: 40px; position: relative; clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); } .logo-box { position: absolute; right: 40px; top: 30px; background: white; padding: 10px; border-radius: 50%; } .logo { max-height: 50px; } .hello { font-size: 22px; font-weight: bold; color: #e11d48; } .offer-msg span { background: #ffe4e6; color: #e11d48; padding: 2px 8px; font-weight: bold; } .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; } .stat-box { border: 2px solid #e11d48; border-radius: 10px; padding: 15px; text-align: center; } .stat-box .value { color: #e11d48; font-weight: bold; } .footer-vibrant { background: #1a1a1a; color: white; padding: 15px; text-align: center; font-size: 11px; margin-top: 40px; }`
  },

  'promotion-fresh': {
    name: 'Fresh Promotion',
    category: 'Promotion',
    description: 'Modern and clean promotion letter',
    html: `
       <div class="letter-fresh">
          <div class="border-wrapper">
             <div class="header-fresh">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
             <div class="content">
                <p class="date">{{current_date}}</p>
                <h2 class="title">Promotion Confirmation</h2>
                <p>Dear {{candidate_name}},</p>
                <div class="body-content">{{body_content}}</div>
                <div class="highlight-box">
                   <p><strong>Promoted To:</strong> {{designation}}</p>
                   {{#if salary}}<p><strong>Revised Compensation:</strong> {{ctc}}</p>{{/if}}
                   <p><strong>Effective:</strong> {{joining_date}}</p>
                </div>
                <div class="signature">
                   <p>Sincerely,</p>
                   {{#if signature}}<img src="{{signature}}" class="signature-img" />{{/if}}
                   <p><strong>{{hr_name}}</strong><br>HR Department</p>
                </div>
             </div>
             <div class="footer"><p>{{footer_text}}</p></div>
          </div>
       </div>
     `,
    css: `.letter-fresh { padding: 20px; background: #f0fdf4; font-family: 'Segoe UI', sans-serif; } .border-wrapper { background: white; border: 1px solid #bbf7d0; padding: 40px; border-radius: 8px; max-width: 800px; margin: 0 auto; } .header-fresh { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; } .title { color: #15803d; text-align: center; letter-spacing: 1px; } .highlight-box { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 5px solid #22c55e; } .footer { text-align: center; font-size: 11px; color: #86efac; margin-top: 40px; }`
  },

  'promotion-sunset': {
    name: 'Sunset Promotion',
    category: 'Promotion',
    description: 'Warm promotion letter',
    html: `
       <div class="letter-sunset">
         <div class="header">
            {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
            <h1>{{company_name}}</h1>
         </div>
         <div class="content">
            <h3>Promotion Letter</h3>
            <p><strong>Date:</strong> {{current_date}}</p>
            <p><strong>To:</strong> {{candidate_name}}</p>
            <div class="body-content">{{body_content}}</div>
            {{#if salary}}
            <div class="details">
               <p>New Designation: {{designation}}</p>
               <p>New CTC: {{ctc}}</p>
               <p>Effective Date: {{joining_date}}</p>
            </div>
            {{/if}}
            <div class="signature">
               {{#if signature}}<img src="{{signature}}" class="signature-img" />{{/if}}
               <p>{{hr_name}}<br>HR Manager</p>
            </div>
         </div>
         <div class="footer">{{footer_text}}</div>
       </div>
     `,
    css: `.letter-sunset { font-family: 'Tahoma', sans-serif; max-width: 800px; margin: 0 auto; background: #fff7ed; } .header { background: linear-gradient(to right, #ea580c, #fdba74); padding: 30px; color: white; display: flex; align-items: center; justify-content: space-between; } .logo { max-height: 50px; background: white; padding: 5px; border-radius: 4px; } .content { padding: 40px; background: white; margin: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); } h3 { color: #c2410c; border-bottom: 2px solid #fdba74; padding-bottom: 10px; } .details { background: #fff7ed; padding: 20px; border: 1px solid #fdba74; border-radius: 4px; margin: 20px 0; } .footer { text-align: center; padding: 20px; font-size: 11px; color: #9a3412; }`
  },

  // ==================== OFFER LETTER TEMPLATES ====================

  'offer-classic': {
    name: 'Classic Offer',
    category: 'Offer Letter',
    description: 'Traditional formal offer letter design',
    html: `
      <div class="letter-classic">
        <div class="header">
          {{#if logo}}
          <img src="{{logo}}" class="logo" alt="Company Logo" />
          {{/if}}
          <h1>{{company_name}}</h1>
          <p class="company-address">{{company_address}}</p>
        </div>
        
        <div class="content">
          <p class="date">Date: {{current_date}}</p>
          <p class="ref">Ref: {{reference_number}}</p>
          
          <p class="salutation">Dear {{candidate_name}},</p>
          
          <h2 class="subject">Subject: Offer of Employment - {{designation}}</h2>
          
          <div class="body-content">
            {{body_content}}
          </div>
          
          {{#if salary}}
          <div class="offer-details">
            <h3>Offer Details:</h3>
            <table>
              <tr><td>Position:</td><td>{{designation}}</td></tr>
              <tr><td>Annual CTC:</td><td>{{ctc}}</td></tr>
              <tr><td>Joining Date:</td><td>{{joining_date}}</td></tr>
            </table>
          </div>
          {{/if}}
          
          <div class="signature-block">
            <p>Sincerely,</p>
            {{#if signature}}
            <img src="{{signature}}" class="signature" alt="Signature" />
            {{/if}}
            <p><strong>{{hr_name}}</strong><br>HR Manager<br>{{company_name}}</p>
          </div>
        </div>
        
        <div class="footer">
          <p>{{footer_text}}</p>
        </div>
      </div>
    `,
    css: `
      .letter-classic {
        font-family: 'Georgia', serif;
        color: #2c3e50;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        background: #ffffff;
      }
      .letter-classic .header {
        text-align: center;
        border-bottom: 3px double #2c3e50;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .letter-classic .logo { max-height: 80px; margin-bottom: 15px; }
      .letter-classic h1 { font-size: 28px; margin: 10px 0; color: #1a252f; font-weight: 700; }
      .letter-classic .company-address { font-size: 12px; color: #7f8c8d; margin: 5px 0; }
      .letter-classic .content { line-height: 1.8; font-size: 14px; }
      .letter-classic .date, .letter-classic .ref { text-align: right; margin: 5px 0; font-size: 13px; color: #555; }
      .letter-classic .salutation { margin: 30px 0 20px 0; font-weight: 600; }
      .letter-classic .subject { font-size: 16px; color: #2c3e50; margin: 20px 0; text-decoration: underline; }
      .letter-classic .body-content { text-align: justify; margin: 20px 0; }
      .letter-classic .body-content p { margin: 15px 0; }
      .letter-classic .offer-details { background: #f8f9fa; padding: 20px; margin: 25px 0; border-left: 4px solid #2c3e50; }
      .letter-classic .offer-details h3 { margin: 0 0 15px 0; color: #2c3e50; }
      .letter-classic .offer-details table { width: 100%; }
      .letter-classic .offer-details td { padding: 8px 0; }
      .letter-classic .offer-details td:first-child { font-weight: 600; width: 150px; }
      .letter-classic .signature-block { margin-top: 50px; text-align: right; }
      .letter-classic .signature { max-height: 60px; margin: 10px 0; }
      .letter-classic .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #bdc3c7; text-align: center; font-size: 11px; color: #7f8c8d; }
    `
  },

  'offer-modern': {
    name: 'Modern Offer',
    category: 'Offer Letter',
    description: 'Contemporary offer letter with vibrant accents',
    html: `
      <div class="letter-modern">
        <div class="header-bar"></div>
        <div class="header">
          <div class="logo-section">
            {{#if logo}}
            <img src="{{logo}}" class="logo" alt="Company Logo" />
            {{/if}}
          </div>
          <div class="company-info">
            <h1>{{company_name}}</h1>
            <p>{{company_address}}</p>
          </div>
        </div>
        
        <div class="content">
          <div class="meta-info">
            <span class="date-badge">{{current_date}}</span>
            <span class="ref-badge">{{reference_number}}</span>
          </div>
          
          <p class="salutation">Dear {{candidate_name}},</p>
          
          <div class="offer-banner">
            <h2>Offer of Employment</h2>
            <p class="position">{{designation}}</p>
          </div>
          
          <div class="body-content">
            {{body_content}}
          </div>
          
          {{#if salary}}
          <div class="offer-card">
            <div class="offer-item">
              <span class="label">Position</span>
              <span class="value">{{designation}}</span>
            </div>
            <div class="offer-item">
              <span class="label">Annual CTC</span>
              <span class="value">{{ctc}}</span>
            </div>
            <div class="offer-item">
              <span class="label">Joining Date</span>
              <span class="value">{{joining_date}}</span>
            </div>
          </div>
          {{/if}}
          
          <div class="signature-block">
            <p class="regards">Best Regards,</p>
            {{#if signature}}
            <img src="{{signature}}" class="signature" alt="Signature" />
            {{/if}}
            <div class="hr-details">
              <p class="hr-name">{{hr_name}}</p>
              <p class="hr-title">Human Resources Manager</p>
              <p class="company">{{company_name}}</p>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-content">{{footer_text}}</div>
        </div>
      </div>
    `,
    css: `
      .letter-modern { font-family: 'Inter', 'Segoe UI', sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; background: #ffffff; }
      .letter-modern .header-bar { height: 8px; background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%); }
      .letter-modern .header { display: flex; align-items: center; padding: 30px 40px; background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); gap: 20px; }
      .letter-modern .logo { max-height: 70px; max-width: 120px; }
      .letter-modern .company-info h1 { font-size: 26px; font-weight: 700; color: #1e293b; margin: 0 0 5px 0; }
      .letter-modern .company-info p { font-size: 12px; color: #64748b; margin: 0; }
      .letter-modern .content { padding: 40px; }
      .letter-modern .meta-info { display: flex; gap: 15px; margin-bottom: 30px; }
      .letter-modern .date-badge, .letter-modern .ref-badge { display: inline-block; padding: 6px 12px; background: #eff6ff; color: #3b82f6; border-radius: 6px; font-size: 12px; font-weight: 600; }
      .letter-modern .salutation { font-size: 16px; font-weight: 600; margin: 20px 0; color: #0f172a; }
      .letter-modern .offer-banner { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; }
      .letter-modern .offer-banner h2 { margin: 0 0 10px 0; font-size: 24px; }
      .letter-modern .offer-banner .position { margin: 0; font-size: 18px; opacity: 0.95; }
      .letter-modern .body-content { line-height: 1.8; font-size: 14px; color: #334155; }
      .letter-modern .body-content p { margin: 15px 0; text-align: justify; }
      .letter-modern .offer-card { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 30px 0; }
      .letter-modern .offer-item { background: #f8fafc; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #e2e8f0; }
      .letter-modern .offer-item .label { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
      .letter-modern .offer-item .value { display: block; font-size: 16px; font-weight: 700; color: #0f172a; }
      .letter-modern .signature-block { margin-top: 50px; text-align: right; }
      .letter-modern .regards { font-size: 14px; margin-bottom: 10px; }
      .letter-modern .signature { max-height: 60px; margin: 10px 0; }
      .letter-modern .hr-name { font-size: 16px; font-weight: 700; color: #0f172a; margin: 5px 0; }
      .letter-modern .hr-title { font-size: 13px; color: #3b82f6; margin: 3px 0; }
      .letter-modern .company { font-size: 12px; color: #64748b; margin: 3px 0; }
      .letter-modern .footer { background: #0f172a; padding: 20px 40px; color: #cbd5e1; text-align: center; font-size: 11px; }
    `
  },

  'offer-professional': {
    name: 'Professional Offer',
    category: 'Offer Letter',
    description: 'Corporate and polished offer letter',
    html: `
      <div class="letter-professional">
        <div class="header">
          <div class="header-left">
            {{#if logo}}
            <img src="{{logo}}" class="logo" alt="Company Logo" />
            {{/if}}
          </div>
          <div class="header-right">
            <h1>{{company_name}}</h1>
            <p class="tagline">Excellence in Human Resources</p>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="content">
          <div class="document-header">
            <h2>OFFER OF EMPLOYMENT</h2>
          </div>
          
          <div class="document-info">
            <table>
              <tr><td><strong>Date:</strong></td><td>{{current_date}}</td></tr>
              <tr><td><strong>Reference:</strong></td><td>{{reference_number}}</td></tr>
              <tr><td><strong>To:</strong></td><td>{{candidate_name}}</td></tr>
              <tr><td><strong>Position:</strong></td><td>{{designation}}</td></tr>
            </table>
          </div>
          
          <div class="body-content">
            {{body_content}}
          </div>
          
          {{#if salary}}
          <div class="compensation-section">
            <h3>Compensation Package</h3>
            <div class="comp-grid">
              <div class="comp-item">
                <span class="comp-label">Annual CTC</span>
                <span class="comp-value">{{ctc}}</span>
              </div>
              <div class="comp-item">
                <span class="comp-label">Joining Date</span>
                <span class="comp-value">{{joining_date}}</span>
              </div>
            </div>
          </div>
          {{/if}}
          
          <div class="signature-block">
            <div class="signature-line">
              {{#if signature}}
              <img src="{{signature}}" class="signature" alt="Signature" />
              {{/if}}
            </div>
            <div class="signatory-info">
              <p class="name">{{hr_name}}</p>
              <p class="title">HR Manager</p>
              <p class="company">{{company_name}}</p>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-bar"></div>
          <p>{{footer_text}}</p>
        </div>
      </div>
    `,
    css: `
      .letter-professional { font-family: 'Arial', 'Helvetica', sans-serif; color: #2d3748; max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; }
      .letter-professional .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
      .letter-professional .logo { max-height: 65px; }
      .letter-professional .header-right { text-align: right; }
      .letter-professional h1 { font-size: 24px; font-weight: 700; color: #1a202c; margin: 0 0 5px 0; letter-spacing: 0.5px; }
      .letter-professional .tagline { font-size: 11px; color: #718096; margin: 0; font-style: italic; }
      .letter-professional .divider { height: 3px; background: linear-gradient(90deg, #2b6cb0 0%, #4299e1 100%); margin: 20px 0; }
      .letter-professional .document-header { text-align: center; margin: 30px 0; }
      .letter-professional .document-header h2 { font-size: 20px; color: #2b6cb0; letter-spacing: 2px; margin: 0; }
      .letter-professional .document-info { margin: 30px 0; background: #f7fafc; padding: 20px; border-left: 4px solid #2b6cb0; }
      .letter-professional .document-info table { width: 100%; border-collapse: collapse; }
      .letter-professional .document-info td { padding: 8px 0; font-size: 13px; }
      .letter-professional .document-info td:first-child { width: 120px; color: #4a5568; }
      .letter-professional .body-content { line-height: 1.8; font-size: 14px; margin: 30px 0; text-align: justify; }
      .letter-professional .body-content p { margin: 15px 0; }
      .letter-professional .compensation-section { background: #edf2f7; padding: 25px; border-radius: 8px; margin: 30px 0; }
      .letter-professional .compensation-section h3 { margin: 0 0 20px 0; color: #2b6cb0; font-size: 16px; }
      .letter-professional .comp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
      .letter-professional .comp-item { background: white; padding: 15px; border-radius: 6px; text-align: center; }
      .letter-professional .comp-label { display: block; font-size: 12px; color: #718096; margin-bottom: 8px; }
      .letter-professional .comp-value { display: block; font-size: 18px; font-weight: 700; color: #1a202c; }
      .letter-professional .signature-block { margin-top: 60px; display: flex; flex-direction: column; align-items: flex-end; }
      .letter-professional .signature { max-height: 55px; margin-bottom: 10px; }
      .letter-professional .signatory-info { text-align: right; }
      .letter-professional .signatory-info .name { font-size: 15px; font-weight: 700; color: #1a202c; margin: 5px 0; }
      .letter-professional .signatory-info .title { font-size: 13px; color: #2b6cb0; margin: 3px 0; }
      .letter-professional .signatory-info .company { font-size: 12px; color: #718096; margin: 3px 0; }
      .letter-professional .footer { margin-top: 50px; }
      .letter-professional .footer-bar { height: 2px; background: #e2e8f0; margin-bottom: 15px; }
      .letter-professional .footer p { text-align: center; font-size: 11px; color: #a0aec0; line-height: 1.6; }
    `
  },

  'offer-creative': {
    name: 'Creative Offer',
    category: 'Offer Letter',
    description: 'Bold and innovative offer letter',
    html: `
      <div class="letter-creative">
        <div class="header-creative">
          <div class="accent-shape"></div>
          <div class="header-content">
            {{#if logo}}
            <img src="{{logo}}" class="logo" alt="Company Logo" />
            {{/if}}
            <h1>{{company_name}}</h1>
          </div>
        </div>
        
        <div class="content-creative">
          <div class="info-card">
            <div class="info-item">
              <span class="label">Date</span>
              <span class="value">{{current_date}}</span>
            </div>
            <div class="info-item">
              <span class="label">Ref</span>
              <span class="value">{{reference_number}}</span>
            </div>
          </div>
          
          <div class="greeting">
            <span class="greeting-text">Hello,</span>
            <span class="recipient-name">{{candidate_name}}</span>
          </div>
          
          <div class="offer-title">
            <h2>We're Excited to Offer You</h2>
            <p class="position-highlight">{{designation}}</p>
          </div>
          
          <div class="body-content">
            {{body_content}}
          </div>
          
          {{#if salary}}
          <div class="offer-highlights">
            <div class="highlight-box">
              <div class="icon">💼</div>
              <div class="detail">
                <span class="label">Position</span>
                <span class="value">{{designation}}</span>
              </div>
            </div>
            <div class="highlight-box">
              <div class="icon">💰</div>
              <div class="detail">
                <span class="label">Annual CTC</span>
                <span class="value">{{ctc}}</span>
              </div>
            </div>
            <div class="highlight-box">
              <div class="icon">📅</div>
              <div class="detail">
                <span class="label">Start Date</span>
                <span class="value">{{joining_date}}</span>
              </div>
            </div>
          </div>
          {{/if}}
          
          <div class="signature-creative">
            <div class="signature-card">
              {{#if signature}}
              <img src="{{signature}}" class="signature" alt="Signature" />
              {{/if}}
              <div class="signature-details">
                <p class="signer-name">{{hr_name}}</p>
                <p class="signer-role">HR Manager</p>
                <p class="signer-company">{{company_name}}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer-creative">
          <div class="footer-wave"></div>
          <p>{{footer_text}}</p>
        </div>
      </div>
    `,
    css: `
      .letter-creative { font-family: 'Poppins', 'Segoe UI', sans-serif; color: #1a1a2e; max-width: 800px; margin: 0 auto; background: #ffffff; position: relative; overflow: hidden; }
      .letter-creative .header-creative { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; position: relative; color: white; }
      .letter-creative .accent-shape { position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; }
      .letter-creative .header-content { position: relative; z-index: 2; }
      .letter-creative .logo { max-height: 60px; margin-bottom: 15px; filter: brightness(0) invert(1); }
      .letter-creative h1 { font-size: 32px; font-weight: 700; margin: 0; letter-spacing: 1px; }
      .letter-creative .content-creative { padding: 40px; }
      .letter-creative .info-card { display: flex; gap: 20px; margin-bottom: 30px; }
      .letter-creative .info-item { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 15px 25px; border-radius: 12px; color: white; display: flex; flex-direction: column; gap: 5px; }
      .letter-creative .info-item .label { font-size: 11px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
      .letter-creative .info-item .value { font-size: 14px; font-weight: 600; }
      .letter-creative .greeting { margin: 30px 0; display: flex; flex-direction: column; gap: 5px; }
      .letter-creative .greeting-text { font-size: 14px; color: #666; }
      .letter-creative .recipient-name { font-size: 22px; font-weight: 700; color: #667eea; }
      .letter-creative .offer-title { text-align: center; margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 15px; }
      .letter-creative .offer-title h2 { margin: 0 0 10px 0; font-size: 24px; color: #1a1a2e; }
      .letter-creative .offer-title .position-highlight { margin: 0; font-size: 20px; font-weight: 700; color: #764ba2; }
      .letter-creative .body-content { line-height: 1.9; font-size: 14px; color: #2d3748; }
      .letter-creative .body-content p { margin: 18px 0; text-align: justify; }
      .letter-creative .offer-highlights { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 30px 0; }
      .letter-creative .highlight-box { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 20px; border-radius: 12px; text-align: center; }
      .letter-creative .highlight-box .icon { font-size: 32px; margin-bottom: 10px; }
      .letter-creative .highlight-box .detail { display: flex; flex-direction: column; gap: 5px; }
      .letter-creative .highlight-box .label { font-size: 11px; color: #666; text-transform: uppercase; }
      .letter-creative .highlight-box .value { font-size: 16px; font-weight: 700; color: #1a1a2e; }
      .letter-creative .signature-creative { margin-top: 50px; display: flex; justify-content: flex-end; }
      .letter-creative .signature-card { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 25px; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
      .letter-creative .signature { max-height: 50px; margin-bottom: 10px; }
      .letter-creative .signer-name { font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 5px 0; }
      .letter-creative .signer-role { font-size: 13px; color: #764ba2; margin: 3px 0; }
      .letter-creative .signer-company { font-size: 12px; color: #666; margin: 3px 0; }
      .letter-creative .footer-creative { background: #f7fafc; padding: 30px 40px; position: relative; }
      .letter-creative .footer-wave { position: absolute; top: -20px; left: 0; right: 0; height: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); clip-path: polygon(0 50%, 10% 0, 20% 50%, 30% 0, 40% 50%, 50% 0, 60% 50%, 70% 0, 80% 50%, 90% 0, 100% 50%, 100% 100%, 0 100%); }
      .letter-creative .footer-creative p { text-align: center; font-size: 11px; color: #718096; line-height: 1.6; margin: 0; }
    `
  },

  'offer-minimal': {
    name: 'Minimal Offer',
    category: 'Offer Letter',
    description: 'Clean and simple offer letter',
    html: `
      <div class="letter-minimal">
        <div class="header-minimal">
          {{#if logo}}
          <img src="{{logo}}" class="logo" alt="Company Logo" />
          {{/if}}
          <h1>{{company_name}}</h1>
        </div>
        
        <div class="content-minimal">
          <div class="meta">
            <p>{{current_date}}</p>
            <p>{{reference_number}}</p>
          </div>
          
          <p class="to">{{candidate_name}}</p>
          
          <h2 class="subject">Employment Offer: {{designation}}</h2>
          
          <div class="body-content">
            {{body_content}}
          </div>
          
          {{#if salary}}
          <div class="offer-summary">
            <div class="summary-row">
              <span>Position:</span>
              <span>{{designation}}</span>
            </div>
            <div class="summary-row">
              <span>Annual CTC:</span>
              <span>{{ctc}}</span>
            </div>
            <div class="summary-row">
              <span>Start Date:</span>
              <span>{{joining_date}}</span>
            </div>
          </div>
          {{/if}}
          
          <div class="signature-minimal">
            {{#if signature}}
            <img src="{{signature}}" class="signature" alt="Signature" />
            {{/if}}
            <p class="name">{{hr_name}}</p>
            <p class="role">HR Manager</p>
          </div>
        </div>
        
        <div class="footer-minimal">
          <p>{{footer_text}}</p>
        </div>
      </div>
    `,
    css: `
      .letter-minimal { font-family: 'Helvetica Neue', 'Arial', sans-serif; color: #000000; max-width: 750px; margin: 0 auto; background: #ffffff; padding: 50px; }
      .letter-minimal .header-minimal { margin-bottom: 50px; padding-bottom: 20px; border-bottom: 1px solid #000000; }
      .letter-minimal .logo { max-height: 50px; margin-bottom: 20px; }
      .letter-minimal h1 { font-size: 20px; font-weight: 400; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
      .letter-minimal .meta { margin: 30px 0; font-size: 12px; color: #666666; }
      .letter-minimal .meta p { margin: 5px 0; }
      .letter-minimal .to { font-size: 14px; font-weight: 600; margin: 30px 0; color: #000000; }
      .letter-minimal .subject { font-size: 16px; font-weight: 600; margin: 25px 0; color: #000000; }
      .letter-minimal .body-content { line-height: 1.8; font-size: 13px; color: #333333; margin: 30px 0; }
      .letter-minimal .body-content p { margin: 20px 0; text-align: justify; }
      .letter-minimal .offer-summary { margin: 40px 0; padding: 25px; border: 1px solid #e0e0e0; }
      .letter-minimal .summary-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
      .letter-minimal .summary-row:last-child { border-bottom: none; }
      .letter-minimal .summary-row span:first-child { font-weight: 600; }
      .letter-minimal .signature-minimal { margin-top: 60px; text-align: left; }
      .letter-minimal .signature { max-height: 50px; margin-bottom: 10px; }
      .letter-minimal .signature-minimal .name { font-size: 14px; font-weight: 600; margin: 5px 0; color: #000000; }
      .letter-minimal .signature-minimal .role { font-size: 12px; color: #666666; margin: 3px 0; }
      .letter-minimal .footer-minimal { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
      .letter-minimal .footer-minimal p { text-align: center; font-size: 10px; color: #999999; line-height: 1.6; margin: 0; }
    `
  },

  'offer-executive': {
    name: 'Executive Offer',
    category: 'Offer Letter',
    description: 'Premium offer letter for senior positions',
    html: `
      <div class="letter-executive">
        <div class="header-executive">
          <div class="header-left">
            {{#if logo}}
            <img src="{{logo}}" class="logo" alt="Company Logo" />
            {{/if}}
          </div>
          <div class="header-right">
            <h1>{{company_name}}</h1>
            <div class="header-line"></div>
            <p class="tagline">Executive Recruitment</p>
          </div>
        </div>
        
        <div class="content-executive">
          <div class="confidential-banner">
            <span>CONFIDENTIAL</span>
          </div>
          
          <div class="document-title">
            <h2>Executive Employment Offer</h2>
            <p class="subtitle">{{designation}}</p>
          </div>
          
          <div class="meta-executive">
            <div class="meta-item">
              <span class="label">Date</span>
              <span class="value">{{current_date}}</span>
            </div>
            <div class="meta-item">
              <span class="label">Reference</span>
              <span class="value">{{reference_number}}</span>
            </div>
            <div class="meta-item">
              <span class="label">Candidate</span>
              <span class="value">{{candidate_name}}</span>
            </div>
          </div>
          
          <div class="body-content">
            {{body_content}}
          </div>
          
          {{#if salary}}
          <div class="compensation-executive">
            <h3>Executive Compensation Package</h3>
            <div class="comp-details">
              <div class="comp-row">
                <span class="comp-label">Position Title</span>
                <span class="comp-value">{{designation}}</span>
              </div>
              <div class="comp-row highlight">
                <span class="comp-label">Total Annual Compensation</span>
                <span class="comp-value">{{ctc}}</span>
              </div>
              <div class="comp-row">
                <span class="comp-label">Anticipated Start Date</span>
                <span class="comp-value">{{joining_date}}</span>
              </div>
            </div>
          </div>
          {{/if}}
          
          <div class="signature-executive">
            <div class="signature-container">
              {{#if signature}}
              <img src="{{signature}}" class="signature" alt="Signature" />
              {{/if}}
              <div class="signature-info">
                <p class="name">{{hr_name}}</p>
                <p class="title">Chief Human Resources Officer</p>
                <p class="company">{{company_name}}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer-executive">
          <p>{{footer_text}}</p>
          <p class="confidentiality">This document contains confidential information intended solely for the addressee.</p>
        </div>
      </div>
    `,
    css: `
      .letter-executive { font-family: 'Times New Roman', serif; color: #1a1a1a; max-width: 850px; margin: 0 auto; background: #ffffff; padding: 50px; border: 1px solid #d4af37; }
      .letter-executive .header-executive { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 25px; border-bottom: 2px solid #d4af37; }
      .letter-executive .logo { max-height: 75px; }
      .letter-executive .header-right { text-align: right; }
      .letter-executive h1 { font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0 0 10px 0; letter-spacing: 1px; }
      .letter-executive .header-line { height: 2px; background: #d4af37; margin: 8px 0; }
      .letter-executive .tagline { font-size: 12px; color: #666; margin: 0; font-style: italic; letter-spacing: 2px; text-transform: uppercase; }
      .letter-executive .confidential-banner { background: #d4af37; color: white; text-align: center; padding: 8px; font-size: 11px; font-weight: 700; letter-spacing: 3px; margin-bottom: 30px; }
      .letter-executive .document-title { text-align: center; margin: 30px 0; }
      .letter-executive .document-title h2 { font-size: 24px; color: #1a1a1a; margin: 0 0 10px 0; font-weight: 700; }
      .letter-executive .document-title .subtitle { font-size: 18px; color: #d4af37; margin: 0; font-weight: 600; }
      .letter-executive .meta-executive { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; padding: 20px; background: #f9f9f9; border-left: 4px solid #d4af37; }
      .letter-executive .meta-item { display: flex; flex-direction: column; gap: 5px; }
      .letter-executive .meta-item .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
      .letter-executive .meta-item .value { font-size: 14px; font-weight: 600; color: #1a1a1a; }
      .letter-executive .body-content { line-height: 1.9; font-size: 14px; margin: 35px 0; text-align: justify; }
      .letter-executive .body-content p { margin: 18px 0; }
      .letter-executive .compensation-executive { margin: 40px 0; padding: 30px; background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%); border: 2px solid #d4af37; border-radius: 8px; }
      .letter-executive .compensation-executive h3 { margin: 0 0 25px 0; font-size: 18px; color: #1a1a1a; text-align: center; }
      .letter-executive .comp-row { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #e0e0e0; }
      .letter-executive .comp-row:last-child { border-bottom: none; }
      .letter-executive .comp-row.highlight { background: #d4af37; color: white; font-weight: 700; }
      .letter-executive .comp-label { font-size: 13px; }
      .letter-executive .comp-value { font-size: 15px; font-weight: 600; }
      .letter-executive .signature-executive { margin-top: 60px; }
      .letter-executive .signature-container { display: flex; flex-direction: column; align-items: flex-end; }
      .letter-executive .signature { max-height: 60px; margin-bottom: 10px; }
      .letter-executive .signature-info { text-align: right; }
      .letter-executive .signature-info .name { font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 5px 0; }
      .letter-executive .signature-info .title { font-size: 13px; color: #d4af37; margin: 3px 0; }
      .letter-executive .signature-info .company { font-size: 12px; color: #666; margin: 3px 0; }
      .letter-executive .footer-executive { margin-top: 50px; padding-top: 20px; border-top: 2px solid #d4af37; text-align: center; }
      .letter-executive .footer-executive p { font-size: 11px; color: #666; line-height: 1.6; margin: 8px 0; }
      .letter-executive .confidentiality { font-style: italic; color: #999; font-size: 10px; }
    `
  },

  'offer-elegant': {
    name: 'Elegant Offer',
    category: 'Offer Letter',
    description: 'Sophisticated and refined offer letter',
    html: `
      <div class="letter-elegant">
        <div class="header-elegant">
          <div class="logo-wrapper">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div>
          <h1>{{company_name}}</h1>
        </div>
        <div class="content-elegant">
          <p class="date">{{current_date}}</p>
          <p class="salutation">Dear {{candidate_name}},</p>
          <div class="title-section">
            <span class="ornament">❧</span>
            <h2>Offer of Employment</h2>
            <span class="ornament">❧</span>
          </div>
          <div class="body-content">
            <p>It is with great pleasure that we offer you the position of <strong class="highlight">{{designation}}</strong>.</p>
            <p>Your skills and experience will be an ideal fit for our creative team.</p>
            {{body_content}}
          </div>
          {{#if salary}}
          <div class="details-elegant">
            <p><strong>Annual Compensation:</strong> {{ctc}}</p>
            <p><strong>Date of Joining:</strong> {{joining_date}}</p>
          </div>
          {{/if}}
          <div class="signature-block">
            <p>Sincerely,</p>
            {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
            <p><strong>{{hr_name}}</strong></p>
            <p class="role">Human Resources</p>
          </div>
        </div>
        <div class="footer-elegant"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-elegant { font-family: 'Playfair Display', serif; color: #4a4a4a; max-width: 800px; margin: 0 auto; background: #fff; padding: 60px; border: double 6px #e5e5e5; } .header-elegant { text-align: center; margin-bottom: 50px; } .logo { max-height: 80px; margin-bottom: 15px; } .header-elegant h1 { font-style: italic; font-weight: 700; color: #2c1810; margin: 0; font-size: 32px; } .title-section { text-align: center; margin: 30px 0; color: #8b5cf6; } .title-section h2 { display: inline-block; font-weight: 400; font-style: italic; border-bottom: 1px solid #8b5cf6; padding-bottom: 5px; margin: 0 15px; font-size: 24px; } .ornament { font-size: 20px; color: #c4b5fd; } .highlight { color: #7c3aed; } .body-content { line-height: 1.9; font-size: 15px; } .details-elegant { background: #faf5ff; padding: 25px; text-align: center; border: 1px dashed #d8b4fe; margin: 30px 0; } .footer-elegant { text-align: center; margin-top: 60px; font-size: 11px; color: #a1a1aa; border-top: 1px solid #f4f4f5; padding-top: 20px; } .signature { max-height: 55px; margin: 10px 0; }`
  },

  'offer-corporate': {
    name: 'Corporate Offer',
    category: 'Offer Letter',
    description: 'Professional business style',
    html: `
      <div class="letter-corporate">
        <div class="sidebar">
          {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
          <div class="company-details">
            <h3>{{company_name}}</h3>
            <p>{{footer_text}}</p>
          </div>
        </div>
        <div class="main-content">
          <div class="top-bar"></div>
          <div class="content">
            <div class="meta-grid">
              <div><strong>Date:</strong> {{current_date}}</div>
              <div><strong>Ref:</strong> {{reference_number}}</div>
            </div>
            
            <h1 class="doc-title">OFFER LETTER</h1>
            
            <p class="to-address"><strong>To:</strong> {{candidate_name}}<br><strong>Role:</strong> {{designation}}</p>
            
            <div class="body-content">
              {{body_content}}
            </div>
            
            {{#if salary}}
            <table class="offer-table">
              <tr>
                <td>Position</td>
                <td>{{designation}}</td>
              </tr>
              <tr>
                <td>Total CTC</td>
                <td>{{ctc}}</td>
              </tr>
              <tr>
                <td>Start Date</td>
                <td>{{joining_date}}</td>
              </tr>
            </table>
            {{/if}}
            
            <div class="signature-section">
              <p>Authorized Signatory</p>
              {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
              <p><strong>{{hr_name}}</strong><br>HR Manager</p>
            </div>
          </div>
        </div>
      </div>
    `,
    css: `.letter-corporate { display: flex; font-family: 'Arial', sans-serif; min-height: 1000px; color: #334155; } .sidebar { width: 250px; background: #0f172a; color: white; padding: 40px 30px; display: flex; flex-direction: column; } .logo { max-width: 100%; margin-bottom: 30px; background: white; padding: 10px; border-radius: 4px; } .company-details { margin-top: auto; font-size: 11px; opacity: 0.8; } .company-details h3 { margin-bottom: 10px; font-size: 16px; } .main-content { flex: 1; position: relative; } .top-bar { height: 20px; background: #334155; } .content { padding: 40px 50px; } .meta-grid { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 40px; font-size: 12px; } .doc-title { color: #0f172a; font-size: 28px; letter-spacing: 2px; margin-bottom: 30px; } .to-address { margin-bottom: 40px; line-height: 1.6; background: #f1f5f9; padding: 15px; border-left: 4px solid #334155; } .offer-table { width: 100%; border-collapse: collapse; margin: 30px 0; } .offer-table td { border: 1px solid #e2e8f0; padding: 12px; } .offer-table tr:nth-child(even) { background: #f8fafc; } .offer-table td:first-child { font-weight: 600; width: 40%; } .signature { max-height: 50px; margin: 15px 0; }`
  },

  'offer-vibrant': {
    name: 'Vibrant Offer',
    category: 'Offer Letter',
    description: 'Energetic and dynamic',
    html: `
      <div class="letter-vibrant">
        <div class="header-vibrant">
           <div class="header-text">
             <h1>{{company_name}}</h1>
             <p>WELCOME TO THE TEAM</p>
           </div>
           {{#if logo}}<div class="logo-box"><img src="{{logo}}" class="logo" /></div>{{/if}}
        </div>
        <div class="content-vibrant">
          <p class="date"><strong>Date:</strong> {{current_date}}</p>
          <p class="hello">Hello {{candidate_name}}!</p>
          
          <div class="offer-msg">
            We are super excited to offer you the role of <span>{{designation}}</span>!
          </div>
          
          <div class="body-content">
            {{body_content}}
          </div>
          
          {{#if salary}}
          <div class="stats-grid">
            <div class="stat-box">
              <span class="label">CTC</span>
              <span class="value">{{ctc}}</span>
            </div>
            <div class="stat-box">
              <span class="label">Joining</span>
              <span class="value">{{joining_date}}</span>
            </div>
          </div>
          {{/if}}
          
          <div class="signature-block">
            <p>Cheers,</p>
            {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
            <p><strong>{{hr_name}}</strong></p>
            <p>HR Team</p>
          </div>
        </div>
        <div class="footer-vibrant">{{footer_text}}</div>
      </div>
    `,
    css: `.letter-vibrant { font-family: 'Verdana', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; overflow: hidden; } .header-vibrant { background: #be123c; color: white; padding: 50px; position: relative; clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%); } .header-text h1 { margin: 0; font-size: 32px; text-transform: uppercase; } .header-text p { margin: 5px 0 0; font-weight: bold; opacity: 0.8; letter-spacing: 2px; } .logo-box { position: absolute; right: 50px; top: 40px; background: white; padding: 15px; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); } .logo { max-width: 60px; max-height: 60px; } .content-vibrant { padding: 40px; } .hello { font-size: 24px; font-weight: 700; color: #be123c; margin: 20px 0; } .offer-msg { font-size: 18px; margin-bottom: 30px; line-height: 1.5; } .offer-msg span { background: #ffe4e6; color: #be123c; padding: 2px 8px; border-radius: 4px; font-weight: bold; } .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; } .stat-box { background: #fff1f2; border: 2px solid #be123c; padding: 20px; border-radius: 12px; text-align: center; } .label { display: block; font-size: 12px; text-transform: uppercase; color: #881337; font-weight: bold; } .value { font-size: 18px; font-weight: bold; color: #be123c; } .footer-vibrant { background: #1a1a1a; color: white; padding: 20px; text-align: center; font-size: 11px; margin-top: 50px; } .signature { max-height: 50px; margin: 10px 0; }`
  },

  'offer-fresh': {
    name: 'Fresh Offer',
    category: 'Offer Letter',
    description: 'Modern and clean',
    html: `
      <div class="letter-fresh">
        <div class="border-wrapper">
          <div class="header-fresh">
            {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
            <h1>{{company_name}}</h1>
          </div>
          <div class="content-fresh">
            <div class="status-badge">OFFER CONFIRMED</div>
            <p class="date">{{current_date}}</p>
            <p class="salutation">Dear {{candidate_name}},</p>
            
            <div class="body-content">
              <p>We are delighted to extend this offer of employment for the position of <strong>{{designation}}</strong>.</p>
              {{body_content}}
            </div>
            
            {{#if salary}}
            <div class="info-list">
              <div class="info-item"><span>Package:</span> {{ctc}}</div>
              <div class="info-item"><span>Start Date:</span> {{joining_date}}</div>
            </div>
            {{/if}}
            
            <div class="signature-block">
              <p>Warm Regards,</p>
              {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
              <p><strong>{{hr_name}}</strong></p>
              <p>HR Manager</p>
            </div>
          </div>
          <div class="footer-fresh">{{footer_text}}</div>
        </div>
      </div>
    `,
    css: `.letter-fresh { font-family: 'Lato', sans-serif; color: #064e3b; padding: 30px; max-width: 800px; margin: 0 auto; } .border-wrapper { border: 2px solid #059669; border-radius: 20px; overflow: hidden; height: 100%; min-height: 900px; display: flex; flex-direction: column; } .header-fresh { background: #ecfdf5; padding: 40px; text-align: center; border-bottom: 2px solid #059669; } .logo { max-height: 60px; margin-bottom: 10px; } .header-fresh h1 { margin: 0; color: #065f46; font-size: 26px; } .content-fresh { padding: 40px; flex: 1; position: relative; } .status-badge { position: absolute; top: 20px; right: 40px; background: #059669; color: white; padding: 5px 15px; border-radius: 20px; font-size: 10px; font-weight: bold; letter-spacing: 1px; } .salutation { font-size: 18px; font-weight: bold; margin: 20px 0; color: #065f46; } .body-content { line-height: 1.8; color: #374151; } .info-list { margin: 30px 0; background: #f0fdf4; padding: 20px; border-radius: 10px; } .info-item { padding: 10px 0; border-bottom: 1px dashed #059669; font-weight: bold; font-size: 15px; } .info-item:last-child { border-bottom: none; } .info-item span { font-weight: normal; color: #047857; margin-right: 10px; } .footer-fresh { text-align: center; font-size: 11px; color: #047857; padding: 20px; background: #ecfdf5; border-top: 1px solid #059669; } .signature { max-height: 50px; margin: 10px 0; }`
  },

  'offer-sunset': {
    name: 'Sunset Offer',
    category: 'Offer Letter',
    description: 'Warm and inviting',
    html: `
      <div class="letter-sunset">
        <div class="header-sunset">
          {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
          <h1>{{company_name}}</h1>
        </div>
        <div class="content-sunset">
          <p class="date">{{current_date}}</p>
          <h2>Offer Letter</h2>
          
          <div class="welcome-box">
             <p>Welcome, {{candidate_name}}!</p>
          </div>
          
          <div class="body-content">
             <p>We are pleased to offer you the <strong>{{designation}}</strong> role.</p>
             {{body_content}}
          </div>
          
          {{#if salary}}
          <div class="offer-details">
             <div class="detail-row"><span>CTC:</span> <strong>{{ctc}}</strong></div>
             <div class="detail-row"><span>Joining:</span> <strong>{{joining_date}}</strong></div>
          </div>
          {{/if}}
          
          <div class="signature-block">
             <p>Sincerely,</p>
             {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
             <p><strong>{{hr_name}}</strong></p>
          </div>
        </div>
        <div class="footer-sunset"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-sunset { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; color: #431407; } .header-sunset { background: linear-gradient(90deg, #ea580c, #fbbf24); padding: 40px; color: white; display: flex; align-items: center; justify-content: space-between; } .logo { max-height: 60px; background: rgba(255,255,255,0.2); padding: 5px; border-radius: 4px; } .header-sunset h1 { margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); } .content-sunset { padding: 40px; background: #fff7ed; min-height: 800px; } .welcome-box { font-size: 22px; font-weight: bold; color: #ea580c; margin: 20px 0; border-bottom: 2px solid #fdba74; padding-bottom: 10px; display: inline-block; } .body-content { line-height: 1.7; font-size: 15px; } .offer-details { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin: 30px 0; border-left: 5px solid #ea580c; } .detail-row { padding: 10px 0; border-bottom: 1px solid #fed7aa; } .detail-row:last-child { border-bottom: none; } .signature { max-height: 50px; margin: 10px 0; } .footer-sunset { background: #7c2d12; color: #ffedd5; padding: 20px; text-align: center; font-size: 11px; }`
  },
  // ==================== APPOINTMENT LETTER TEMPLATES ====================
  'appointment-classic': {
    name: 'Classic Appointment',
    category: 'Appointment Letter',
    description: 'Formal appointment letter',
    html: `
      <div class="letter-classic">
        <div class="header">
          {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
          <h1>{{company_name}}</h1>
          <p class="company-address">{{company_address}}</p>
        </div>
        <div class="content">
          <p class="date">Date: {{current_date}}</p>
          <p class="salutation">Dear {{candidate_name}},</p>
          <h2 class="subject">Subject: Letter of Appointment</h2>
          <div class="body-content">
            <p>We are pleased to appoint you as <strong>{{designation}}</strong> in <strong>{{department}}</strong> at <strong>{{company_name}}</strong>, effective from <strong>{{joining_date}}</strong>.</p>
            {{body_content}}
          </div>
          <div class="signature-block">
            <p>Sincerely,</p>
            {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
            <p><strong>{{hr_name}}</strong><br>HR Manager</p>
          </div>
        </div>
        <div class="footer"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-classic { font-family: 'Georgia', serif; color: #2c3e50; padding: 40px; max-width: 800px; margin: 0 auto; } .header { text-align: center; border-bottom: 3px double #2c3e50; padding-bottom: 20px; margin-bottom: 30px; } .logo { max-height: 80px; } .subject { text-decoration: underline; margin: 20px 0; } .footer { border-top: 1px solid #ccc; text-align: center; font-size: 11px; margin-top: 50px; padding-top: 20px; }`
  },

  'appointment-modern': {
    name: 'Modern Appointment',
    category: 'Appointment Letter',
    description: 'Modern appointment letter',
    html: `
      <div class="letter-modern">
        <div class="header-bar"></div>
        <div class="header">
          {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
          <h1>{{company_name}}</h1>
        </div>
        <div class="content">
          <p class="date">{{current_date}}</p>
          <p class="salutation">Dear {{candidate_name}},</p>
          <div class="banner">Appointment Letter</div>
          <div class="body-content">
            <p>Welcome to the team! We are excited to appoint you as <strong>{{designation}}</strong> starting on <strong>{{joining_date}}</strong>.</p>
            {{body_content}}
          </div>
          <div class="signature-block">
            <p>Best Regards,</p>
            {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
            <p><strong>{{hr_name}}</strong><br>HR Manager</p>
          </div>
        </div>
        <div class="footer"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-modern { font-family: 'Inter', sans-serif; color: #333; max-width: 800px; margin: 0 auto; } .header-bar { height: 8px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); } .header { padding: 30px; background: #f8fafc; display: flex; align-items: center; gap: 20px; } .banner { background: #3b82f6; color: white; padding: 15px; text-align: center; font-size: 20px; margin: 20px 0; border-radius: 8px; } .logo { max-height: 60px; } .footer { background: #1e293b; color: white; padding: 20px; text-align: center; font-size: 11px; margin-top: 40px; }`
  },

  'appointment-professional': {
    name: 'Professional Appointment',
    category: 'Appointment Letter',
    description: 'Corporate polished appointment letter',
    html: `
      <div class="letter-professional">
        <div class="header">
          <div class="header-left">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div>
          <div class="header-right"><h1>{{company_name}}</h1><p class="tagline">Excellence in Human Resources</p></div>
        </div>
        <div class="divider"></div>
        <div class="content">
          <div class="document-header"><h2>LETTER OF APPOINTMENT</h2></div>
          <div class="document-info">
            <table>
              <tr><td><strong>Date:</strong></td><td>{{current_date}}</td></tr>
              <tr><td><strong>To:</strong></td><td>{{candidate_name}}</td></tr>
              <tr><td><strong>Role:</strong></td><td>{{designation}}</td></tr>
            </table>
          </div>
          <div class="body-content">
            <p>We are pleased to confirm your appointment for the position of <strong>{{designation}}</strong> in <strong>{{department}}</strong> with <strong>{{company_name}}</strong>.</p>
            <p>Your employment will commence on <strong>{{joining_date}}</strong>.</p>
            {{{body_content}}}
          </div>
          <div class="signature-block">
            <div class="signature-line">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}</div>
            <div class="signatory-info"><p class="name">{{hr_name}}</p><p class="title">HR Manager</p></div>
          </div>
        </div>
        <div class="footer"><div class="footer-bar"></div><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-professional { font-family: 'Arial', sans-serif; color: #2d3748; max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; } .header { display: flex; justify-content: space-between; align-items: center; } .logo { max-height: 65px; } .header-right { text-align: right; } .header h1 { font-size: 24px; color: #1a202c; margin: 0; } .divider { height: 3px; background: linear-gradient(90deg, #2b6cb0, #4299e1); margin: 20px 0; } .document-header { text-align: center; margin: 30px 0; } .document-header h2 { font-size: 20px; color: #2b6cb0; letter-spacing: 2px; margin: 0; } .document-info { background: #f7fafc; padding: 20px; border-left: 4px solid #2b6cb0; margin-bottom: 30px; } .document-info table { width: 100%; border-collapse: collapse; } .document-info td { padding: 5px 0; font-size: 13px; } .signature { max-height: 50px; margin-bottom: 10px; } .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #a0aec0; } .footer-bar { height: 2px; background: #e2e8f0; margin-bottom: 15px; }`
  },

  'appointment-creative': {
    name: 'Creative Appointment',
    category: 'Appointment Letter',
    description: 'Bold and innovative appointment',
    html: `
      <div class="letter-creative">
        <div class="header-creative">
          <div class="header-content">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        </div>
        <div class="content-creative">
          <div class="greeting"><span class="greeting-text">Welcome,</span><span class="recipient-name">{{candidate_name}}</span></div>
          <div class="offer-title"><h2>You're Hired!</h2><p class="position-highlight">{{designation}}</p></div>
          <div class="body-content">
            <p>We are thrilled to bring you on board as <strong>{{designation}}</strong>.</p>
            <p>Your journey with us starts on <strong>{{joining_date}}</strong>.</p>
            {{{body_content}}}
          </div>
          <div class="signature-creative">
            <div class="signature-card">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="signer-name">{{hr_name}}</p><p class="signer-role">HR Team</p></div>
          </div>
        </div>
        <div class="footer-creative"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-creative { font-family: 'Poppins', sans-serif; color: #1a1a2e; max-width: 800px; margin: 0 auto; background: #fff; border: 1px solid #eee; } .header-creative { background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; color: white; } .logo { max-height: 60px; filter: brightness(0) invert(1); margin-bottom: 10px; } .greeting { margin: 30px 0; } .recipient-name { font-size: 24px; font-weight: 700; color: #667eea; display: block; } .offer-title { text-align: center; background: #ffecd2; padding: 20px; border-radius: 12px; margin: 20px 0; } .offer-title h2 { color: #555; margin: 0; } .position-highlight { color: #764ba2; font-weight: 700; font-size: 20px; margin: 5px 0; } .signature { max-height: 50px; } .signature-card { background: #fdfbf7; padding: 20px; border-radius: 12px; text-align: center; display: inline-block; } .footer-creative { padding: 20px; text-align: center; font-size: 11px; color: #999; }`
  },

  'appointment-minimal': {
    name: 'Minimal Appointment',
    category: 'Appointment Letter',
    description: 'Clean and simple appointment',
    html: `
      <div class="letter-minimal">
        <div class="header-minimal">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content-minimal">
          <p class="meta">{{current_date}}</p>
          <p class="to">{{candidate_name}}</p>
          <h2 class="subject">Appointment: {{designation}}</h2>
          <div class="body-content">
            <p>We confirm your appointment as <strong>{{designation}}</strong> effective <strong>{{joining_date}}</strong>.</p>
            {{{body_content}}}
          </div>
          <div class="signature-minimal">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="name">{{hr_name}}</p></div>
        </div>
        <div class="footer-minimal"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-minimal { font-family: 'Helvetica', sans-serif; color: #000; max-width: 750px; margin: 0 auto; padding: 50px; } .header-minimal { border-bottom: 1px solid #000; padding-bottom: 20px; margin-bottom: 40px; } .logo { max-height: 50px; margin-bottom: 10px; } .header-minimal h1 { font-size: 20px; text-transform: uppercase; letter-spacing: 2px; margin: 0; } .to { font-weight: 600; font-size: 16px; margin-bottom: 30px; } .subject { font-size: 16px; font-weight: 600; margin-bottom: 20px; } .signature { max-height: 50px; margin-bottom: 10px; } .footer-minimal { border-top: 1px solid #ddd; margin-top: 50px; padding-top: 20px; text-align: center; font-size: 10px; color: #999; }`
  },

  'appointment-executive': {
    name: 'Executive Appointment',
    category: 'Appointment Letter',
    description: 'Premium executive appointment',
    html: `
      <div class="letter-executive">
        <div class="header-executive">
          <div class="header-left">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div>
          <div class="header-right"><h1>{{company_name}}</h1><p class="tagline">Executive Appointment</p></div>
        </div>
        <div class="content-executive">
          <div class="confidential-banner">CONFIDENTIAL</div>
          <div class="document-title"><h2>Executive Appointment Order</h2></div>
          <div class="meta-executive">
            <div class="meta-item"><span class="label">Date</span><span class="value">{{current_date}}</span></div>
            <div class="meta-item"><span class="label">Appointee</span><span class="value">{{candidate_name}}</span></div>
          </div>
          <div class="body-content">
            <p>We are honored to appoint you as <strong>{{designation}}</strong> leading our team, starting <strong>{{joining_date}}</strong>.</p>
            {{{body_content}}}
          </div>
          <div class="signature-executive">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="name">{{hr_name}}</p><p class="title">Director - HR</p></div>
        </div>
        <div class="footer-executive"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-executive { font-family: 'Times New Roman', serif; max-width: 850px; margin: 0 auto; border: 1px solid #d4af37; padding: 50px; } .header-executive { border-bottom: 2px solid #d4af37; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; } .logo { max-height: 70px; } .header-right { text-align: right; } .header-right h1 { color: #111; margin: 0; } .tagline { color: #d4af37; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; margin: 5px 0; } .confidential-banner { background: #d4af37; color: white; text-align: center; font-size: 10px; letter-spacing: 3px; margin: 30px 0; padding: 5px; } .document-title { text-align: center; color: #111; margin-bottom: 30px; } .meta-executive { display: grid; grid-template-columns: 1fr 1fr; background: #f9f9f9; padding: 20px; border-left: 4px solid #d4af37; } .meta-item { display: flex; flex-direction: column; } .meta-item .label { font-size: 10px; text-transform: uppercase; color: #999; } .signature { max-height: 60px; margin-bottom: 10px; } .footer-executive { margin-top: 50px; border-top: 2px solid #d4af37; padding-top: 20px; text-align: center; font-size: 11px; color: #666; }`
  },

  'appointment-elegant': {
    name: 'Elegant Appointment',
    category: 'Appointment Letter',
    description: 'Sophisticated and refined appointment',
    html: `
      <div class="letter-elegant">
        <div class="header-elegant"><div class="logo-wrapper">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div><h1>{{company_name}}</h1></div>
        <div class="content-elegant">
          <p class="date">{{current_date}}</p>
          <div class="title-section"><span class="ornament">❧</span><h2>Appointment Letter</h2><span class="ornament">❧</span></div>
          <div class="body-content">
            <p>Dear <strong>{{candidate_name}}</strong>,</p>
            <p>We are delighted to appoint you as <strong class="highlight">{{designation}}</strong>.</p>
            {{body_content}}
          </div>
          <div class="signature-block"><p>Sincerely,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-elegant"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-elegant { font-family: 'Playfair Display', serif; color: #4a4a4a; max-width: 800px; margin: 0 auto; border: double 6px #e5e5e5; padding: 60px; } .header-elegant { text-align: center; margin-bottom: 40px; } .logo { max-height: 70px; margin-bottom: 10px; } .title-section { text-align: center; color: #8b5cf6; margin: 30px 0; } .title-section h2 { display: inline-block; font-style: italic; border-bottom: 1px solid #8b5cf6; padding-bottom: 5px; } .ornament { color: #c4b5fd; font-size: 20px; margin: 0 10px; } .highlight { color: #7c3aed; } .footer-elegant { text-align: center; margin-top: 60px; border-top: 1px solid #f4f4f5; padding-top: 20px; font-size: 11px; color: #a1a1aa; } .signature { max-height: 50px; }`
  },

  'appointment-corporate': {
    name: 'Corporate Appointment',
    category: 'Appointment Letter',
    description: 'Professional business appointment',
    html: `
      <div class="letter-corporate">
        <div class="sidebar">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<div class="company-details"><h3>{{company_name}}</h3><p>{{footer_text}}</p></div></div>
        <div class="main-content">
          <div class="top-bar"></div>
          <div class="content">
            <div class="meta-grid"><div><strong>Date:</strong> {{current_date}}</div><div><strong>Ref:</strong> APP/{{current_date}}</div></div>
            <h1 class="doc-title">APPOINTMENT ORDER</h1>
            <p class="to-address"><strong>To:</strong> {{candidate_name}}<br><strong>Role:</strong> {{designation}}</p>
            <div class="body-content">
              <p>We are pleased to confirm your appointment details below:</p>
              <table class="offer-table"><tr><td>Designation</td><td>{{designation}}</td></tr><tr><td>Effective Date</td><td>{{joining_date}}</td></tr></table>
              {{body_content}}
            </div>
            <div class="signature-section"><p>Authorized Signatory</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
          </div>
        </div>
      </div>
    `,
    css: `.letter-corporate { display: flex; font-family: 'Arial', sans-serif; min-height: 800px; } .sidebar { width: 220px; background: #0f172a; color: white; padding: 30px; display: flex; flex-direction: column; } .logo { background: white; padding: 10px; border-radius: 4px; margin-bottom: 20px; max-width: 100%; } .company-details { margin-top: auto; font-size: 11px; opacity: 0.8; } .main-content { flex: 1; } .top-bar { height: 15px; background: #334155; } .content { padding: 40px; } .doc-title { font-size: 24px; color: #0f172a; margin-bottom: 30px; } .to-address { background: #f1f5f9; padding: 15px; border-left: 4px solid #334155; margin-bottom: 30px; } .offer-table { width: 100%; border-collapse: collapse; margin: 20px 0; } .offer-table td { border: 1px solid #e2e8f0; padding: 10px; } .signature { max-height: 50px; margin: 10px 0; }`
  },

  'appointment-vibrant': {
    name: 'Vibrant Appointment',
    category: 'Appointment Letter',
    description: 'Energetic appointment letter',
    html: `
      <div class="letter-vibrant">
        <div class="header-vibrant"><div class="header-text"><h1>{{company_name}}</h1><p>OFFICIAL APPOINTMENT</p></div>{{#if logo}}<div class="logo-box"><img src="{{logo}}" class="logo" /></div>{{/if}}</div>
        <div class="content-vibrant">
          <p class="date"><strong>Date:</strong> {{current_date}}</p>
          <div class="offer-msg">We are thrilled to appoint <span>{{candidate_name}}</span> as <span>{{designation}}</span>!</div>
          <div class="body-content">
            <p>Your journey begins on <strong>{{joining_date}}</strong>.</p>
            {{body_content}}
          </div>
          <div class="signature-block"><p>Cheers,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-vibrant">{{footer_text}}</div>
      </div>
    `,
    css: `.letter-vibrant { font-family: 'Verdana', sans-serif; max-width: 800px; margin: 0 auto; overflow: hidden; } .header-vibrant { background: #be123c; color: white; padding: 40px; position: relative; clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%); } .header-text h1 { margin: 0; text-transform: uppercase; } .logo-box { position: absolute; right: 40px; top: 30px; background: white; padding: 10px; border-radius: 50%; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; } .logo { max-width: 50px; } .content-vibrant { padding: 40px; } .offer-msg { font-size: 18px; margin: 30px 0; font-weight: bold; color: #881337; } .offer-msg span { color: #be123c; border-bottom: 2px solid #be123c; } .footer-vibrant { background: #1a1a1a; color: white; padding: 20px; text-align: center; font-size: 11px; margin-top: 50px; } .signature { max-height: 50px; }`
  },

  'appointment-fresh': {
    name: 'Fresh Appointment',
    category: 'Appointment Letter',
    description: 'Modern and clean appointment',
    html: `
      <div class="letter-fresh">
        <div class="border-wrapper">
          <div class="header-fresh">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
          <div class="content-fresh">
            <div class="status-badge">APPOINTED</div>
            <p class="date">{{current_date}}</p>
            <p class="salutation">Dear {{candidate_name}},</p>
            <div class="body-content">
              <p>We confirm your appointment as <strong>{{designation}}</strong>.</p>
              {{body_content}}
            </div>
            <div class="info-list"><div class="info-item"><span>Effective Date:</span> {{joining_date}}</div></div>
            <div class="signature-block"><p>Regards,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
          </div>
          <div class="footer-fresh">{{footer_text}}</div>
        </div>
      </div>
    `,
    css: `.letter-fresh { font-family: 'Lato', sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; color: #064e3b; } .border-wrapper { border: 2px solid #059669; border-radius: 15px; height: 100%; display: flex; flex-direction: column; } .header-fresh { background: #ecfdf5; padding: 30px; text-align: center; border-bottom: 1px solid #059669; } .logo { max-height: 50px; margin-bottom: 5px; } .status-badge { float: right; background: #059669; color: white; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: bold; } .content-fresh { padding: 30px; flex: 1; } .info-list { margin: 20px 0; background: #f0fdf4; padding: 15px; border-radius: 8px; } .footer-fresh { background: #ecfdf5; color: #047857; text-align: center; font-size: 10px; padding: 15px; border-top: 1px solid #059669; } .signature { max-height: 50px; }`
  },

  'appointment-sunset': {
    name: 'Sunset Appointment',
    category: 'Appointment Letter',
    description: 'Warm appointment letter',
    html: `
      <div class="letter-sunset">
        <div class="header-sunset">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content-sunset">
          <p class="date">{{current_date}}</p>
          <h2>Appointment Letter</h2>
          <div class="welcome-box"><p>Welcome Aboard, {{candidate_name}}!</p></div>
          <div class="body-content">
             <p>This letter acts as official confirmation of your appointment as <strong>{{designation}}</strong>.</p>
             {{body_content}}
          </div>
          <div class="offer-details"><div class="detail-row"><span>Start Date:</span> <strong>{{joining_date}}</strong></div></div>
          <div class="signature-block"><p>Sincerely,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-sunset"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-sunset { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; color: #431407; } .header-sunset { background: linear-gradient(90deg, #ea580c, #fbbf24); padding: 30px; color: white; display: flex; align-items: center; justify-content: space-between; } .logo { max-height: 50px; background: rgba(255,255,255,0.2); padding: 5px; border-radius: 4px; } .content-sunset { padding: 30px; background: #fff7ed; min-height: 600px; } .welcome-box { font-size: 18px; font-weight: bold; color: #ea580c; border-bottom: 2px solid #fdba74; display: inline-block; margin: 20px 0; } .offer-details { background: white; padding: 15px; border-left: 4px solid #ea580c; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); } .footer-sunset { background: #7c2d12; color: #ffedd5; padding: 15px; text-align: center; font-size: 10px; } .signature { max-height: 50px; }`
  },

  'interview-classic': {
    name: 'Classic Interview',
    category: 'Interview Call',
    description: 'Formal interview invitation',
    html: `
      <div class="letter-classic">
        <div class="header">
          {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
          <h1>{{company_name}}</h1>
        </div>
        <div class="content">
          <p class="date">Date: {{current_date}}</p>
          <p class="salutation">Dear {{candidate_name}},</p>
          <h2 class="subject">Subject: Interview Call for {{designation}}</h2>
          <div class="body-content">
            <p>We are pleased to invite you for an interview for the position of <strong>{{designation}}</strong>.</p>
            <div class="details-box">
              <p><strong>Date:</strong> {{interview_date}}</p>
              <p><strong>Time:</strong> {{interview_time}}</p>
              <p><strong>Mode:</strong> {{interview_mode}}</p>
              <p><strong>Venue:</strong> {{interview_location}}</p>
            </div>
            {{{body_content}}}
          </div>
          <div class="signature-block">
            <p>Sincerely,</p>
            {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
            <p><strong>{{hr_name}}</strong><br>HR Team</p>
          </div>
        </div>
        <div class="footer"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-classic { display: flex; flex-direction: column; min-height: 100vh; font-family: 'Georgia', serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; } .header { border-bottom: 2px solid #333; padding-bottom: 20px; text-align: center; } .content { flex: 1; } .details-box { background: #f9f9f9; border: 1px solid #ddd; padding: 20px; margin: 20px 0; } .details-box p { margin: 10px 0; } .logo { max-height: 70px; } .footer { text-align: center; font-size: 12px; margin-top: auto; border-top: 1px solid #eee; padding-top: 20px; } .signature { max-height: 50px; display: block; margin: 10px 0; }`
  },

  'interview-modern': {
    name: 'Modern Interview',
    category: 'Interview Call',
    description: 'Contemporary interview invitation',
    html: `
      <div class="letter-modern">
        <div class="header">
          {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
          <h1>{{company_name}}</h1>
        </div>
        <div class="content">
          <p class="date">{{current_date}}</p>
          <p class="salutation">Hi {{candidate_name}},</p>
          <div class="highlight-bar">Interview Invitation: {{designation}}</div>
          <div class="body-content">
            <p>We shortlisted your profile and would love to meet you!</p>
            <div class="interview-card">
              <div class="card-item">
                <span class="label">Date & Time</span>
                <span class="value">{{interview_date}} <br>at {{interview_time}}</span>
              </div>
              <div class="card-item">
                <span class="label">Venue ({{interview_mode}})</span>
                <span class="value">{{interview_location}}</span>
              </div>
            </div>
            {{{body_content}}}
          </div>
          <div class="signature-block">
            <p>Cheers,</p>
            {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
            <p><strong>{{hr_name}}</strong><br>Recruitment Team</p>
          </div>
        </div>
        <div class="footer"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-modern { display: flex; flex-direction: column; min-height: 100vh; font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; color: #1a202c; } .header { padding: 30px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; align-items: center; gap: 20px; } .header h1 { margin: 0; } .logo { max-height: 50px; filter: brightness(0) invert(1); } .content { flex: 1; padding: 40px; } .highlight-bar { color: #764ba2; font-size: 24px; font-weight: bold; margin: 20px 0; } .interview-card { display: flex; gap: 20px; margin: 30px 0; } .card-item { flex: 1; background: #f7fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #764ba2; } .label { display: block; font-size: 11px; color: #718096; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; } .value { font-weight: 600; font-size: 15px; color: #2d3748; line-height: 1.4; } .footer { background: #2d3748; color: white; text-align: center; padding: 15px; font-size: 12px; margin-top: auto; } .signature { max-height: 50px; display: block; margin: 15px 0; }`
  },

  'interview-professional': {
    name: 'Professional Interview',
    category: 'Interview Call',
    description: 'Corporate interview invitation',
    html: `
      <div class="letter-professional">
        <div class="header"><div class="header-left">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div><div class="header-right"><h1>{{company_name}}</h1><p class="tagline">Talent Acquisition</p></div></div>
        <div class="divider"></div>
        <div class="content">
          <div class="document-header"><h2>INTERVIEW INVITATION</h2></div>
          <div class="document-info">
            <table>
              <tr><td><strong>Date:</strong></td><td>{{current_date}}</td></tr>
              <tr><td><strong>Candidate:</strong></td><td>{{candidate_name}}</td></tr>
              <tr><td><strong>Role:</strong></td><td>{{designation}}</td></tr>
            </table>
          </div>
          <div class="body-content">
            <p>We have reviewed your profile and are impressed with your background. We would like to invite you for an interview for the <strong>{{designation}}</strong> position.</p>
            <div class="compensation-section">
              <h3>Interview Schedule</h3>
              <div class="comp-grid">
                <div class="comp-item"><span class="comp-label">Date</span><span class="comp-value">{{interview_date}}</span></div>
                <div class="comp-item"><span class="comp-label">Time</span><span class="comp-value">{{interview_time}}</span></div>
                <div class="comp-item"><span class="comp-label">Mode</span><span class="comp-value">{{interview_mode}}</span></div>
                <div class="comp-item"><span class="comp-label">Venue</span><span class="comp-value">{{interview_location}}</span></div>
              </div>
            </div>
            {{{body_content}}}
          </div>
          <div class="signature-block"><div class="signature-line">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}</div><div class="signatory-info"><p class="name">{{hr_name}}</p><p class="title">Recruitment Manager</p></div></div>
        </div>
        <div class="footer"><div class="footer-bar"></div><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-professional { font-family: 'Arial', sans-serif; color: #2d3748; max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; } .header { display: flex; justify-content: space-between; align-items: center; } .logo { max-height: 65px; } .header-right { text-align: right; } .header h1 { font-size: 24px; color: #1a202c; margin: 0; } .divider { height: 3px; background: linear-gradient(90deg, #2b6cb0, #4299e1); margin: 20px 0; } .document-header { text-align: center; margin: 30px 0; } .document-header h2 { font-size: 20px; color: #2b6cb0; letter-spacing: 2px; margin: 0; } .document-info { background: #f7fafc; padding: 20px; border-left: 4px solid #2b6cb0; margin-bottom: 30px; } .document-info table { width: 100%; border-collapse: collapse; } .document-info td { padding: 5px 0; font-size: 13px; } .compensation-section { background: #edf2f7; padding: 25px; border-radius: 8px; margin: 30px 0; } .compensation-section h3 { margin: 0 0 20px 0; color: #2b6cb0; font-size: 16px; } .comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } .comp-item { background: white; padding: 10px; border-radius: 6px; text-align: center; } .comp-label { display: block; font-size: 11px; color: #718096; margin-bottom: 5px; } .comp-value { display: block; font-size: 14px; font-weight: 700; } .signature { max-height: 50px; margin-bottom: 10px; } .footer { margin-top: 50px; text-align: center; font-size: 11px; } .footer-bar { height: 2px; background: #e2e8f0; margin-bottom: 15px; }`
  },

  'interview-creative': {
    name: 'Creative Interview',
    category: 'Interview Call',
    description: 'Bold interview invitation',
    html: `
      <div class="letter-creative">
        <div class="header-creative">
          <div class="header-content">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        </div>
        <div class="content-creative">
          <div class="greeting"><span class="greeting-text">Hi,</span><span class="recipient-name">{{candidate_name}}</span></div>
          <div class="offer-title"><h2>Let's Talk!</h2><p class="position-highlight">{{designation}}</p></div>
          <div class="body-content">
            <p>We'd love to chat with you about joining our team.</p>
            <div class="highlight-box"><div class="detail"><span class="label">When?</span><span class="value">{{interview_date}} at {{interview_time}}</span></div></div>
            <div class="highlight-box"><div class="detail"><span class="label">Where?</span><span class="value">{{interview_location}} ({{interview_mode}})</span></div></div>
            {{{body_content}}}
          </div>
          <div class="signature-creative"><div class="signature-card">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="signer-name">{{hr_name}}</p><p class="signer-role">Talent Team</p></div></div>
        </div>
        <div class="footer-creative"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-creative { font-family: 'Poppins', sans-serif; color: #1a1a2e; max-width: 800px; margin: 0 auto; background: #fff; } .header-creative { background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; color: white; } .logo { max-height: 60px; filter: brightness(0) invert(1); margin-bottom: 10px; } .greeting { margin: 30px 0; } .recipient-name { font-size: 24px; font-weight: 700; color: #667eea; } .offer-title { text-align: center; background: #ffecd2; padding: 20px; border-radius: 12px; margin: 20px 0; } .offer-title h2 { color: #555; margin: 0; } .highlight-box { background: linear-gradient(135deg, #a8edea, #fed6e3); padding: 15px; border-radius: 12px; text-align: center; margin-bottom: 10px; } .label { font-size: 11px; text-transform: uppercase; color: #555; display: block; margin-bottom: 3px; } .value { font-weight: 700; font-size: 15px; } .signature { max-height: 50px; } .signature-card { background: #fdfbf7; padding: 20px; border-radius: 12px; display: inline-block; } .footer-creative { padding: 20px; text-align: center; font-size: 11px; color: #999; }`
  },

  'interview-minimal': {
    name: 'Minimal Interview',
    category: 'Interview Call',
    description: 'Clean interview invite',
    html: `
      <div class="letter-minimal">
        <div class="header-minimal">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content-minimal">
          <p class="meta">{{current_date}}</p>
          <p class="to">{{candidate_name}}</p>
          <h2 class="subject">Interview: {{designation}}</h2>
          <div class="body-content">
            <p>You are invited for an interview.</p>
            <div class="summary-row"><span>Date & Time:</span><span>{{interview_date}}, {{interview_time}}</span></div>
            <div class="summary-row"><span>Venue:</span><span>{{interview_location}} ({{interview_mode}})</span></div>
            {{{body_content}}}
          </div>
          <div class="signature-minimal">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="name">{{hr_name}}</p></div>
        </div>
        <div class="footer-minimal"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-minimal { font-family: 'Helvetica', sans-serif; color: #000; max-width: 750px; margin: 0 auto; padding: 50px; } .header-minimal { border-bottom: 1px solid #000; padding-bottom: 20px; margin-bottom: 40px; } .logo { max-height: 50px; margin-bottom: 10px; } .header-minimal h1 { font-size: 20px; text-transform: uppercase; letter-spacing: 2px; margin: 0; } .to { font-weight: 600; font-size: 16px; margin-bottom: 30px; } .subject { font-size: 16px; font-weight: 600; margin-bottom: 20px; } .summary-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; } .summary-row span:first-child { font-weight: 600; } .signature { max-height: 50px; margin-bottom: 10px; } .footer-minimal { border-top: 1px solid #ddd; margin-top: 50px; padding-top: 20px; text-align: center; font-size: 10px; color: #999; }`
  },

  'interview-executive': {
    name: 'Executive Interview',
    category: 'Interview Call',
    description: 'Premium interview invitation',
    html: `
      <div class="letter-executive">
        <div class="header-executive">
          <div class="header-left">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div>
          <div class="header-right"><h1>{{company_name}}</h1><p class="tagline">Executive Search</p></div>
        </div>
        <div class="content-executive">
          <div class="confidential-banner">PRIVATE & CONFIDENTIAL</div>
          <div class="document-title"><h2>Interview Invitation</h2><p class="subtitle">{{designation}}</p></div>
          <div class="meta-executive">
            <div class="meta-item"><span class="label">Candidate</span><span class="value">{{candidate_name}}</span></div>
            <div class="meta-item"><span class="label">Date</span><span class="value">{{interview_date}}</span></div>
            <div class="meta-item"><span class="label">Format</span><span class="value">{{interview_mode}}</span></div>
          </div>
          <div class="body-content">
            <p>We are requesting the pleasure of your company for a discussion regarding the <strong>{{designation}}</strong> role.</p>
            <p><strong>Venue:</strong> {{interview_location}}</p>
            <p><strong>Time:</strong> {{interview_time}}</p>
            {{{body_content}}}
          </div>
          <div class="signature-executive">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="name">{{hr_name}}</p><p class="title">Director - HR</p></div>
        </div>
        <div class="footer-executive"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-executive { font-family: 'Times New Roman', serif; max-width: 850px; margin: 0 auto; border: 1px solid #d4af37; padding: 50px; } .header-executive { border-bottom: 2px solid #d4af37; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; } .logo { max-height: 70px; } .header-right { text-align: right; } .header-right h1 { color: #111; margin: 0; } .tagline { color: #d4af37; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; margin: 5px 0; } .confidential-banner { background: #d4af37; color: white; text-align: center; font-size: 10px; letter-spacing: 3px; margin: 30px 0; padding: 5px; } .document-title { text-align: center; color: #111; margin-bottom: 30px; } .document-title h2 { margin-bottom: 5px; } .subtitle { color: #d4af37; font-size: 16px; margin: 0; } .meta-executive { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f9f9f9; padding: 20px; border-left: 4px solid #d4af37; } .meta-item { display: flex; flex-direction: column; } .meta-item .label { font-size: 10px; text-transform: uppercase; color: #999; } .signature { max-height: 60px; margin-bottom: 10px; } .footer-executive { margin-top: 50px; border-top: 2px solid #d4af37; padding-top: 20px; text-align: center; }`
  },

  'interview-elegant': {
    name: 'Elegant Interview',
    category: 'Interview Call',
    description: 'Sophisticated interview invitation',
    html: `
      <div class="letter-elegant">
        <div class="header-elegant">
           <div class="logo-wrapper">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div>
           <h1>{{company_name}}</h1>
        </div>
        <div class="content-elegant">
          <p class="date">{{current_date}}</p>
          <div class="title-section">
             <span class="ornament">❧</span><h2>Interview Invitation</h2><span class="ornament">❧</span>
          </div>
          <div class="body-content">
             <p>Dear <strong>{{candidate_name}}</strong>,</p>
             <p>Unless you have heard otherwise, we are pleased to invite you for an interview for the <strong class="highlight">{{designation}}</strong> position.</p>
             <div class="details-elegant">
                <p><strong>Date:</strong> {{interview_date}}</p>
                <p><strong>Time:</strong> {{interview_time}}</p>
                <p><strong>Venue:</strong> {{interview_location}}</p>
             </div>
             {{{body_content}}}
          </div>
          <div class="signature-block">
             <p>Sincerely,</p>
             {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
             <p><strong>{{hr_name}}</strong></p>
          </div>
        </div>
        <div class="footer-elegant"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-elegant { font-family: 'Playfair Display', serif; color: #4a4a4a; max-width: 800px; margin: 0 auto; border: double 6px #e5e5e5; padding: 60px; } .header-elegant { text-align: center; margin-bottom: 40px; } .logo { max-height: 70px; margin-bottom: 15px; } .title-section { text-align: center; color: #8b5cf6; margin: 30px 0; } .details-elegant { background: #faf5ff; padding: 20px; border: 1px dashed #d8b4fe; margin: 20px 0; text-align: center; } .footer-elegant { text-align: center; margin-top: 60px; border-top: 1px solid #f4f4f5; padding-top: 20px; font-size: 11px; } .signature { max-height: 50px; }`
  },

  'interview-corporate': {
    name: 'Corporate Interview',
    category: 'Interview Call',
    description: 'Professional interview invite',
    html: `
      <div class="letter-corporate">
        <div class="header-block">
            <div class="header-content">
                <h1>INTERVIEW CALL</h1>
                <p>OFFICIAL DOCUMENT</p>
            </div>
            {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
        </div>
        <div class="main-content">
            <div class="content-card">
                 <div class="meta-row">
                    <span><strong>Date:</strong> {{current_date}}</span>
                    <span><strong>To:</strong> {{candidate_name}}</span>
                 </div>
                 <h2 class="subject">Interview Invitation</h2>
                 <div class="body-content">
                    <p>Dear {{candidate_name}},</p>
                    <p>We are pleased to invite you for an interview for the <strong>{{designation}}</strong> position.</p>
                    <table class="details-table">
                        <tr><td>Date</td><td>{{interview_date}}</td></tr>
                        <tr><td>Time</td><td>{{interview_time}}</td></tr>
                        <tr><td>Location</td><td>{{interview_location}}</td></tr>
                        <tr><td>Mode</td><td>{{interview_mode}}</td></tr>
                    </table>
                    {{{body_content}}}
                 </div>
                 <div class="signature-section">
                    <p>Sincerely,</p>
                    {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
                    <p><strong>{{hr_name}}</strong><br>Recruitment Team</p>
                 </div>
            </div>
        </div>
        <div class="footer-block"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-corporate { font-family: 'Arial', sans-serif; background: #fff; } .header-block { background: #0f172a; padding: 40px 60px; color: white; display: flex; justify-content: space-between; align-items: center; } .header-content h1 { margin: 0; font-size: 24px; letter-spacing: 1px; } .header-content p { margin: 5px 0 0; opacity: 0.7; font-size: 11px; text-transform: uppercase; } .logo { max-height: 60px; filter: brightness(0) invert(1); } .main-content { padding: 40px 60px; background: #f8fafc; min-height: 600px; } .content-card { background: white; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 4px; } .meta-row { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; } .subject { color: #0f172a; font-size: 20px; margin-bottom: 20px; } .details-table { width: 100%; margin: 20px 0; border-collapse: collapse; } .details-table td { padding: 12px; border: 1px solid #e2e8f0; } .details-table td:first-child { font-weight: bold; width: 30%; background: #f8fafc; } .footer-block { padding: 20px; text-align: center; background: #f1f5f9; color: #64748b; font-size: 11px; border-top: 2px solid #0f172a; } .signature { max-height: 50px; margin: 10px 0; }`
  },

  'interview-vibrant': {
    name: 'Vibrant Interview',
    category: 'Interview Call',
    description: 'Energetic interview invite',
    html: `
      <div class="letter-vibrant">
        <div class="header-vibrant"><div class="header-text"><h1>{{company_name}}</h1><p>INTERVIEW CALL</p></div>{{#if logo}}<div class="logo-box"><img src="{{logo}}" class="logo" /></div>{{/if}}</div>
        <div class="content-vibrant">
          <p class="date"><strong>Date:</strong> {{current_date}}</p>
          <div class="offer-msg">Hey <span>{{candidate_name}}</span>! Let's meet.</div>
          <div class="body-content">
             <p>We loved your profile for <strong>{{designation}}</strong>.</p>
             <div class="stats-grid">
               <div class="stat-box"><span class="label">When</span><span class="value">{{interview_date}}</span></div>
               <div class="stat-box"><span class="label">Time</span><span class="value">{{interview_time}}</span></div>
             </div>
             <p><strong>Where:</strong> {{interview_location}} ({{interview_mode}})</p>
             {{body_content}}
          </div>
          <div class="signature-block"><p>Cheers,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-vibrant">{{footer_text}}</div>
      </div>
    `,
    css: `.letter-vibrant { display: flex; flex-direction: column; min-height: 100vh; font-family: 'Verdana', sans-serif; max-width: 800px; margin: 0 auto; overflow: hidden; } .header-vibrant { background: #be123c; color: white; padding: 40px; position: relative; clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%); } .header-text h1 { margin: 0; } .logo-box { position: absolute; right: 40px; top: 30px; background: white; padding: 10px; border-radius: 50%; } .logo { max-width: 50px; } .content-vibrant { flex: 1; padding: 40px; } .offer-msg { font-size: 20px; font-weight: bold; color: #be123c; margin: 20px 0; } .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; } .stat-box { border: 2px solid #be123c; padding: 15px; border-radius: 10px; text-align: center; } .label { display: block; font-size: 10px; color: #881337; font-weight: bold; text-transform: uppercase; } .footer-vibrant { background: #1a1a1a; color: white; padding: 20px; text-align: center; font-size: 11px; margin-top: auto; } .signature { max-height: 50px; }`
  },

  'interview-fresh': {
    name: 'Fresh Interview',
    category: 'Interview Call',
    description: 'Modern interview invite',
    html: `
      <div class="letter-fresh">
        <div class="border-wrapper">
          <div class="header-fresh">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
          <div class="content-fresh">
            <div class="status-badge">SHORTLISTED</div>
            <p class="date">{{current_date}}</p>
            <p class="salutation">Dear {{candidate_name}},</p>
            <div class="body-content">
               <p>You have been shortlisted for the <strong>{{designation}}</strong> role.</p>
               <div class="info-list">
                 <div class="info-item"><span>Date:</span> {{interview_date}}</div>
                 <div class="info-item"><span>Time:</span> {{interview_time}}</div>
                 <div class="info-item"><span>Venue:</span> {{interview_location}}</div>
               </div>
               {{{body_content}}}
            </div>
            <div class="signature-block"><p>Best,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
          </div>
          <div class="footer-fresh">{{footer_text}}</div>
        </div>
      </div>
    `,
    css: `.letter-fresh { font-family: 'Lato', sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; color: #064e3b; } .border-wrapper { border: 2px solid #059669; border-radius: 15px; height: 100%; display: flex; flex-direction: column; } .header-fresh { background: #ecfdf5; padding: 30px; text-align: center; border-bottom: 1px solid #059669; } .logo { max-height: 50px; } .status-badge { float: right; background: #059669; color: white; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: bold; } .info-list { start: 20px 0; background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; } .info-item { padding: 8px 0; border-bottom: 1px dashed #059669; } .footer-fresh { background: #ecfdf5; color: #047857; text-align: center; padding: 15px; border-top: 1px solid #059669; font-size: 10px; } .signature { max-height: 50px; }`
  },

  'interview-sunset': {
    name: 'Sunset Interview',
    category: 'Interview Call',
    description: 'Warm interview invite',
    html: `
      <div class="letter-sunset">
        <div class="header-sunset">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content-sunset">
          <p class="date">{{current_date}}</p>
          <h2>Interview Call</h2>
          <div class="welcome-box"><p>Hello {{candidate_name}}</p></div>
          <div class="body-content">
             <p>We would like to meet you for the <strong>{{designation}}</strong> position.</p>
             <div class="offer-details">
                <div class="detail-row"><span>Date:</span> <strong>{{interview_date}}</strong></div>
                <div class="detail-row"><span>Time:</span> <strong>{{interview_time}}</strong></div>
                <div class="detail-row"><span>Location:</span> <strong>{{interview_location}}</strong></div>
             </div>
             {{body_content}}
          </div>
          <div class="signature-block"><p>Sincerely,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-sunset"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-sunset { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; color: #431407; } .header-sunset { background: linear-gradient(90deg, #ea580c, #fbbf24); padding: 30px; color: white; display: flex; align-items: center; justify-content: space-between; } .logo { max-height: 50px; background: rgba(255,255,255,0.2); padding: 5px; border-radius: 4px; } .content-sunset { padding: 30px; background: #fff7ed; min-height: 600px; } .welcome-box { font-size: 18px; font-weight: bold; color: #ea580c; border-bottom: 2px solid #fdba74; display: inline-block; margin: 20px 0; } .offer-details { background: white; padding: 15px; border-left: 4px solid #ea580c; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); } .footer-sunset { background: #7c2d12; color: #ffedd5; padding: 15px; text-align: center; font-size: 10px; } .signature { max-height: 50px; }`
  },

  'experience-classic': {
    name: 'Classic Experience',
    category: 'Experience Letter',
    description: 'Formal experience certificate',
    html: `
      <div class="letter-classic">
        <div class="header">
          {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
          <h1>{{company_name}}</h1>
        </div>
        <div class="content">
          <p class="date">Date: {{current_date}}</p>
          <h2 class="subject">TO WHOMSOEVER IT MAY CONCERN</h2>
          <div class="body-content">
            <p>This is to certify that <strong>{{candidate_name}}</strong> was employed with <strong>{{company_name}}</strong> as <strong>{{designation}}</strong>.</p>
            <p>Tenure: <strong>{{joining_date}}</strong> to <strong>{{last_working_day}}</strong></p>
            {{{body_content}}}
            <p>We wish {{candidate_name}} success in future endeavors.</p>
          </div>
          <div class="signature-block">
            <p>Authorized Signatory,</p>
            {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
            <p><strong>{{hr_name}}</strong><br>Manager - Human Resources</p>
          </div>
        </div>
        <div class="footer"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-classic { font-family: 'Times New Roman', serif; padding: 50px; max-width: 800px; margin: 0 auto; line-height: 1.6; } .header { text-align: center; margin-bottom: 40px; } .logo { max-height: 80px; margin-bottom: 10px; } .subject { text-align: center; text-decoration: underline; margin: 30px 0; font-size: 18px; } .footer { border-top: 1px solid #000; margin-top: 50px; padding-top: 10px; text-align: center; font-size: 12px; } .signature { max-height: 50px; display: block; margin: 10px 0; }`
  },

  'experience-modern': {
    name: 'Modern Experience',
    category: 'Experience Letter',
    description: 'Modern experience certificate',
    html: `
      <div class="letter-modern">
        <div class="header-bar"></div>
        <div class="header">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content">
          <p class="date">{{current_date}}</p>
          <div class="banner">Certificate of Experience</div>
          <div class="body-content">
            <p>We proudly certify that <strong>{{candidate_name}}</strong> worked with us as <strong>{{designation}}</strong>.</p>
            <div class="interview-card"><div class="card-item"><span class="label">Tenure From</span><span class="value">{{joining_date}}</span></div><div class="card-item"><span class="label">To</span><span class="value">{{last_working_day}}</span></div></div>
            {{{body_content}}}
            <p>We wish you the very best.</p>
          </div>
          <div class="signature-block"><p>Best Regards,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong><br>HR Manager</p></div>
        </div>
        <div class="footer"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-modern { font-family: 'Inter', sans-serif; color: #333; max-width: 800px; margin: 0 auto; } .header-bar { height: 8px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); } .header { padding: 30px; background: #f8fafc; display: flex; align-items: center; gap: 20px; } .banner { background: #3b82f6; color: white; padding: 15px; text-align: center; font-size: 20px; margin: 20px 0; border-radius: 8px; } .logo { max-height: 60px; } .footer { background: #1e293b; color: white; padding: 20px; text-align: center; font-size: 11px; margin-top: 40px; } .interview-card { display: flex; gap: 20px; margin: 20px 0; } .card-item { flex: 1; background: #f7fafc; padding: 15px; border-radius: 8px; text-align: center; } .label { display: block; font-size: 11px; color: #888; text-transform: uppercase; } .value { font-weight: 700; }`
  },

  'experience-professional': {
    name: 'Professional Experience',
    category: 'Experience Letter',
    description: 'Corporate experience certificate',
    html: `
      <div class="letter-professional">
        <div class="header"><div class="header-left">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div><div class="header-right"><h1>{{company_name}}</h1><p class="tagline">Human Resources</p></div></div>
        <div class="divider"></div>
        <div class="content">
          <div class="document-header"><h2>SERVICE CERTIFICATE</h2></div>
          <div class="document-info"><table><tr><td><strong>Date:</strong></td><td>{{current_date}}</td></tr><tr><td><strong>Employee:</strong></td><td>{{candidate_name}}</td></tr><tr><td><strong>Designation:</strong></td><td>{{designation}}</td></tr></table></div>
          <div class="body-content">
            <p>This is to certify that <strong>{{candidate_name}}</strong> was associated with <strong>{{company_name}}</strong> from <strong>{{joining_date}}</strong> to <strong>{{last_working_day}}</strong>.</p>
            {{{body_content}}}
          </div>
          <div class="signature-block"><div class="signature-line">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}</div><div class="signatory-info"><p class="name">{{hr_name}}</p><p class="title">Authorized Signatory</p></div></div>
        </div>
        <div class="footer"><div class="footer-bar"></div><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-professional { font-family: 'Arial', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; } .header { display: flex; justify-content: space-between; } .logo { max-height: 60px; } .header-right h1 { margin: 0; font-size: 24px; } .divider { height: 3px; background: #2b6cb0; margin: 20px 0; } .document-header { text-align: center; color: #2b6cb0; margin: 30px 0; } .document-info { background: #f7fafc; padding: 20px; border-left: 4px solid #2b6cb0; } .document-info table { width: 100%; } .footer { text-align: center; font-size: 11px; margin-top: 50px; } .footer-bar { height: 2px; background: #ddd; margin-bottom: 10px; }`
  },

  'experience-creative': {
    name: 'Creative Experience',
    category: 'Experience Letter',
    description: 'Bold experience certificate',
    html: `
      <div class="letter-creative">
        <div class="header-creative"><div class="header-content">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div></div>
        <div class="content-creative">
          <div class="greeting"><span class="greeting-text">Certificate for</span><span class="recipient-name">{{candidate_name}}</span></div>
          <div class="offer-title"><h2>Experience Certificate</h2><p class="position-highlight">{{designation}}</p></div>
          <div class="body-content">
            <p>Thank you for your contribution from <strong>{{joining_date}}</strong> to <strong>{{last_working_day}}</strong>.</p>
            {{{body_content}}}
            <p>We wish you all the best!</p>
          </div>
          <div class="signature-creative"><div class="signature-card">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="signer-name">{{hr_name}}</p><p class="signer-role">HR Manager</p></div></div>
        </div>
        <div class="footer-creative"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-creative { font-family: 'Poppins', sans-serif; max-width: 800px; margin: 0 auto; color: #333; } .header-creative { background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; color: white; } .logo { filter: brightness(0) invert(1); max-height: 50px; } .recipient-name { font-size: 24px; color: #667eea; font-weight: 700; } .offer-title { background: #ffecd2; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; } .footer-creative { text-align: center; font-size: 11px; padding: 20px; } .signature { max-height: 50px; }`
  },

  'experience-minimal': {
    name: 'Minimal Experience',
    category: 'Experience Letter',
    description: 'Clean experience certificate',
    html: `
      <div class="letter-minimal">
        <div class="header-minimal">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content-minimal">
          <p class="meta">{{current_date}}</p>
          <p class="to">{{candidate_name}}</p>
          <h2 class="subject">Experience Certificate</h2>
          <div class="body-content">
            <p>Certifying that <strong>{{candidate_name}}</strong> worked as <strong>{{designation}}</strong> from <strong>{{joining_date}}</strong> to <strong>{{last_working_day}}</strong>.</p>
            {{{body_content}}}
          </div>
          <div class="signature-minimal">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="name">{{hr_name}}</p></div>
        </div>
        <div class="footer-minimal"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-minimal { font-family: 'Helvetica', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #000; } .header-minimal { border-bottom: 1px solid #000; padding-bottom: 20px; } .header-minimal h1 { text-transform: uppercase; letter-spacing: 2px; font-size: 20px; } .to { font-weight: 700; font-size: 16px; margin: 20px 0; } .footer-minimal { border-top: 1px solid #ddd; padding-top: 20px; text-align: center; font-size: 10px; margin-top: 40px; }`
  },

  'experience-executive': {
    name: 'Executive Experience',
    category: 'Experience Letter',
    description: 'Premium experience certificate',
    html: `
      <div class="letter-executive">
        <div class="header-executive"><div class="header-left">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div><div class="header-right"><h1>{{company_name}}</h1></div></div>
        <div class="content-executive">
          <div class="document-title"><h2>Certificate of Service</h2><p class="subtitle">{{designation}}</p></div>
          <div class="meta-executive">
            <div class="meta-item"><span class="label">Name</span><span class="value">{{candidate_name}}</span></div>
            <div class="meta-item"><span class="label">Joined</span><span class="value">{{joining_date}}</span></div>
            <div class="meta-item"><span class="label">Relieved</span><span class="value">{{last_working_day}}</span></div>
          </div>
          <div class="body-content">
            <p>This document certifies the employment tenure of <strong>{{candidate_name}}</strong> with <strong>{{company_name}}</strong>.</p>
            {{{body_content}}}
          </div>
          <div class="signature-executive">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="name">{{hr_name}}</p><p class="title">Director - HR</p></div>
        </div>
        <div class="footer-executive"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-executive { font-family: 'Times New Roman', serif; max-width: 850px; margin: 0 auto; border: 1px solid #d4af37; padding: 50px; } .header-executive { border-bottom: 2px solid #d4af37; padding-bottom: 20px; display: flex; justify-content: space-between; } .logo { max-height: 70px; } .document-title { text-align: center; margin: 30px 0; } .meta-executive { display: grid; grid-template-columns: repeat(3, 1fr); background: #f9f9f9; padding: 20px; border-left: 4px solid #d4af37; margin-bottom: 30px; } .meta-item { display: flex; flex-direction: column; } .meta-item .label { font-size: 10px; text-transform: uppercase; color: #999; } .footer-executive { text-align: center; font-size: 11px; margin-top: 50px; border-top: 2px solid #d4af37; padding-top: 20px; }`
  },

  'experience-elegant': {
    name: 'Elegant Experience',
    category: 'Experience Letter',
    description: 'Sophisticated experience certificate',
    html: `
      <div class="letter-elegant">
        <div class="header-elegant"><div class="logo-wrapper">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div><h1>{{company_name}}</h1></div>
        <div class="content-elegant">
          <p class="date">{{current_date}}</p>
          <div class="title-section"><span class="ornament">❧</span><h2>Experience Certificate</h2><span class="ornament">❧</span></div>
          <div class="body-content">
            <p>This certificate is awarded to <strong>{{candidate_name}}</strong>.</p>
            <p>They served as <strong class="highlight">{{designation}}</strong> from <strong>{{joining_date}}</strong> to <strong>{{last_working_day}}</strong>.</p>
            {{body_content}}
          </div>
          <div class="signature-block"><p>Authorized Signatory,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-elegant"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-elegant { font-family: 'Playfair Display', serif; color: #4a4a4a; max-width: 800px; margin: 0 auto; border: double 6px #e5e5e5; padding: 60px; } .header-elegant { text-align: center; margin-bottom: 40px; } .logo { max-height: 70px; margin-bottom: 15px; } .title-section { text-align: center; color: #8b5cf6; margin: 30px 0; } .title-section h2 { border-bottom: 1px solid #8b5cf6; padding-bottom: 5px; display: inline-block; font-style: italic; } .footer-elegant { text-align: center; margin-top: 60px; border-top: 1px solid #f4f4f5; padding-top: 20px; font-size: 11px; } .signature { max-height: 50px; }`
  },

  'experience-corporate': {
    name: 'Corporate Experience',
    category: 'Experience Letter',
    description: 'Professional service certificate',
    html: `
      <div class="letter-corporate">
        <div class="header-block">
            <div class="header-content">
                <h1>SERVICE CERTIFICATE</h1>
                <p>OFFICIAL DOCUMENT</p>
            </div>
            {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
        </div>
        <div class="main-content">
            <div class="content-card">
                 <div class="meta-row">
                    <span><strong>Date:</strong> {{current_date}}</span>
                    <span><strong>Ref:</strong> EXP/{{current_date}}</span>
                 </div>
                 <h2 class="subject">Experience Certificate</h2>
                 <div class="body-content">
                    <p>This is to certify that <strong>{{candidate_name}}</strong> was employed with us.</p>
                    <table class="details-table">
                        <tr><td>Employee Name</td><td>{{candidate_name}}</td></tr>
                        <tr><td>Designation</td><td>{{designation}}</td></tr>
                        <tr><td>Date of Joining</td><td>{{joining_date}}</td></tr>
                        <tr><td>Date of Relieving</td><td>{{last_working_day}}</td></tr>
                    </table>
                    {{{body_content}}}
                 </div>
                 <div class="signature-section">
                    <p>Authorized Signatory</p>
                    {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
                    <p><strong>{{hr_name}}</strong></p>
                 </div>
            </div>
        </div>
        <div class="footer-block"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-corporate { font-family: 'Arial', sans-serif; background: #fff; } .header-block { background: #0f172a; padding: 40px 60px; color: white; display: flex; justify-content: space-between; align-items: center; } .header-content h1 { margin: 0; font-size: 24px; letter-spacing: 1px; } .header-content p { margin: 5px 0 0; opacity: 0.7; font-size: 11px; text-transform: uppercase; } .logo { max-height: 60px; filter: brightness(0) invert(1); } .main-content { padding: 40px 60px; background: #f8fafc; min-height: 600px; } .content-card { background: white; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 4px; } .meta-row { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; } .subject { color: #0f172a; font-size: 20px; margin-bottom: 20px; } .details-table { width: 100%; margin: 20px 0; border-collapse: collapse; } .details-table td { padding: 12px; border: 1px solid #e2e8f0; } .details-table td:first-child { font-weight: bold; width: 30%; background: #f8fafc; } .footer-block { padding: 20px; text-align: center; background: #f1f5f9; color: #64748b; font-size: 11px; border-top: 2px solid #0f172a; } .signature { max-height: 50px; margin: 10px 0; }`
  },

  'experience-vibrant': {
    name: 'Vibrant Experience',
    category: 'Experience Letter',
    description: 'Energetic experience certificate',
    html: `
      <div class="letter-vibrant">
        <div class="header-vibrant"><div class="header-text"><h1>{{company_name}}</h1><p>EXPERIENCE CERTIFICATE</p></div>{{#if logo}}<div class="logo-box"><img src="{{logo}}" class="logo" /></div>{{/if}}</div>
        <div class="content-vibrant">
          <p class="date"><strong>Date:</strong> {{current_date}}</p>
          <div class="offer-msg">Certifying <span>{{candidate_name}}</span>'s tenure.</div>
          <div class="body-content">
            <p>We certify that <strong>{{candidate_name}}</strong> served as <strong>{{designation}}</strong> from <strong>{{joining_date}}</strong> to <strong>{{last_working_day}}</strong>.</p>
            {{body_content}}
          </div>
          <div class="signature-block"><p>Best Wishes,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-vibrant">{{footer_text}}</div>
      </div>
    `,
    css: `.letter-vibrant { font-family: 'Verdana', sans-serif; max-width: 800px; margin: 0 auto; overflow: hidden; } .header-vibrant { background: #be123c; color: white; padding: 40px; position: relative; clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%); } .header-text h1 { margin: 0; } .logo-box { position: absolute; right: 40px; top: 30px; background: white; padding: 10px; border-radius: 50%; } .logo { max-width: 50px; } .offer-msg { font-size: 18px; color: #881337; margin: 20px 0; font-weight: bold; } .footer-vibrant { background: #1a1a1a; color: white; padding: 20px; text-align: center; font-size: 11px; margin-top: 40px; } .signature { max-height: 50px; }`
  },

  'experience-fresh': {
    name: 'Fresh Experience',
    category: 'Experience Letter',
    description: 'Modern experience certificate',
    html: `
      <div class="letter-fresh">
        <div class="border-wrapper">
          <div class="header-fresh">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
          <div class="content-fresh">
            <div class="status-badge">CERTIFIED</div>
            <p class="date">{{current_date}}</p>
            <p class="salutation">To Whomsoever It May Concern,</p>
            <div class="body-content">
              <p>This certifies that <strong>{{candidate_name}}</strong> was a valued employee.</p>
              <div class="info-list">
                 <div class="info-item"><span>Role:</span> {{designation}}</div>
                 <div class="info-item"><span>Joined:</span> {{joining_date}}</div>
                 <div class="info-item"><span>Relieved:</span> {{last_working_day}}</div>
              </div>
              {{body_content}}
            </div>
            <div class="signature-block"><p>Regards,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
          </div>
          <div class="footer-fresh">{{footer_text}}</div>
        </div>
      </div>
    `,
    css: `.letter-fresh { font-family: 'Lato', sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; color: #064e3b; } .border-wrapper { border: 2px solid #059669; border-radius: 15px; height: 100%; display: flex; flex-direction: column; } .header-fresh { background: #ecfdf5; padding: 30px; text-align: center; border-bottom: 1px solid #059669; } .logo { max-height: 50px; } .status-badge { float: right; background: #059669; color: white; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: bold; } .info-list { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; } .info-item { padding: 8px 0; border-bottom: 1px dashed #059669; } .footer-fresh { background: #ecfdf5; color: #047857; text-align: center; padding: 15px; border-top: 1px solid #059669; font-size: 10px; } .signature { max-height: 50px; }`
  },

  'experience-sunset': {
    name: 'Sunset Experience',
    category: 'Experience Letter',
    description: 'Warm experience certificate',
    html: `
      <div class="letter-sunset">
        <div class="header-sunset">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content-sunset">
          <p class="date">{{current_date}}</p>
          <h2>Experience Certificate</h2>
          <div class="welcome-box"><p>{{candidate_name}}</p></div>
          <div class="body-content">
             <p>Certified that the above individual worked as <strong>{{designation}}</strong>.</p>
             <div class="offer-details">
                <div class="detail-row"><span>From:</span> <strong>{{joining_date}}</strong></div>
                <div class="detail-row"><span>To:</span> <strong>{{last_working_day}}</strong></div>
             </div>
             {{body_content}}
          </div>
          <div class="signature-block"><p>Sincerely,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-sunset"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-sunset { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; color: #431407; } .header-sunset { background: linear-gradient(90deg, #ea580c, #fbbf24); padding: 30px; color: white; display: flex; align-items: center; justify-content: space-between; } .logo { max-height: 50px; background: rgba(255,255,255,0.2); padding: 5px; border-radius: 4px; } .content-sunset { padding: 30px; background: #fff7ed; min-height: 600px; } .welcome-box { font-size: 20px; font-weight: bold; color: #ea580c; border-bottom: 2px solid #fdba74; display: inline-block; margin: 20px 0; } .offer-details { background: white; padding: 15px; border-left: 4px solid #ea580c; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); } .footer-sunset { background: #7c2d12; color: #ffedd5; padding: 15px; text-align: center; font-size: 10px; } .signature { max-height: 50px; }`
  },

  // ==================== RELIEVING LETTER TEMPLATES ====================
  'relieving-classic': {
    name: 'Classic Relieving',
    category: 'Relieving Letter',
    description: 'Formal relieving order',
    html: `
      <div class="letter-classic">
        <div class="header">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content">
          <p class="date">Date: {{current_date}}</p>
          <h2 class="subject">Subject: Relieving Letter</h2>
          <div class="body-content">
            <p>Dear {{candidate_name}},</p>
            <p>This has reference to your resignation. You are relieved from your duties as <strong>{{designation}}</strong> effective close of business hours on <strong>{{last_working_day}}</strong>.</p>
            {{{body_content}}}
            <p>We wish you success in your future endeavors.</p>
          </div>
          <div class="signature-block"><p>Sincerely,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong><br>HR Manager</p></div>
        </div>
        <div class="footer"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-classic { font-family: 'Georgia', serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; } .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 20px; } .logo { max-height: 70px; } .footer { text-align: center; margin-top: 40px; font-size: 11px; border-top: 1px solid #eee; padding-top: 20px; } .signature { max-height: 50px; }`
  },

  'relieving-modern': {
    name: 'Modern Relieving',
    category: 'Relieving Letter',
    description: 'Modern relieving letter',
    html: `
      <div class="letter-modern">
        <div class="header-bar"></div><div class="header">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content">
          <p class="date">{{current_date}}</p>
          <div class="banner">Relieving Order</div>
          <div class="body-content">
            <p>Dear {{candidate_name}},</p>
            <p>We hereby accept your resignation and relieve you from the position of <strong>{{designation}}</strong> on <strong>{{last_working_day}}</strong>.</p>
            {{{body_content}}}
          </div>
          <div class="signature-block"><p>Best Wishes,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong><br>HR</p></div>
        </div>
        <div class="footer"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-modern { font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; color: #333; } .header-bar { height: 8px; background: linear-gradient(90deg, #3b82f6, #8B5CF6); } .header { padding: 30px; background: #f8fafc; display: flex; align-items: center; gap: 20px; } .banner { background: #fee2e2; color: #ef4444; padding: 15px; text-align: center; font-size: 20px; font-weight: 700; margin: 20px 0; border-radius: 8px; } .footer { background: #1e293b; color: white; padding: 20px; text-align: center; }`
  },

  'relieving-professional': {
    name: 'Professional Relieving',
    category: 'Relieving Letter',
    description: 'Corporate relieving letter',
    html: `
      <div class="letter-professional">
        <div class="header"><div class="header-left">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div><div class="header-right"><h1>{{company_name}}</h1></div></div>
        <div class="divider"></div>
        <div class="content">
          <div class="document-header"><h2>RELIEVING LETTER</h2></div>
          <div class="document-info"><table><tr><td><strong>Date:</strong></td><td>{{current_date}}</td></tr><tr><td><strong>Name:</strong></td><td>{{candidate_name}}</td></tr><tr><td><strong>LWD:</strong></td><td>{{last_working_day}}</td></tr></table></div>
          <div class="body-content">
            <p>This is to confirm that <strong>{{candidate_name}}</strong> has been relieved from their services as <strong>{{designation}}</strong> w.e.f. close of business on <strong>{{last_working_day}}</strong>.</p>
            {{{body_content}}}
          </div>
          <div class="signature-block"><div class="signature-line">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}</div><div class="signatory-info"><p class="name">{{hr_name}}</p><p class="title">Authorized Signatory</p></div></div>
        </div>
        <div class="footer"><div class="footer-bar"></div><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-professional { font-family: 'Arial', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; } .header { display: flex; justify-content: space-between; } .divider { height: 3px; background: #2b6cb0; margin: 20px 0; } .document-info { background: #f7fafc; padding: 20px; border-left: 4px solid #2b6cb0; } .footer { margin-top: 50px; text-align: center; font-size: 11px; }`
  },

  'relieving-creative': {
    name: 'Creative Relieving',
    category: 'Relieving Letter',
    description: 'Bold relieving letter',
    html: `
      <div class="letter-creative">
        <div class="header-creative"><div class="header-content">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div></div>
        <div class="content-creative">
          <div class="greeting"><span class="greeting-text">Farewell,</span><span class="recipient-name">{{candidate_name}}</span></div>
          <div class="offer-title"><h2>Relieving Letter</h2><p class="position-highlight">{{designation}}</p></div>
          <div class="body-content">
            <p>We appreciate your time with us. You are successfully relieved effective <strong>{{last_working_day}}</strong>.</p>
            {{{body_content}}}
          </div>
          <div class="signature-creative"><div class="signature-card">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="signer-name">{{hr_name}}</p><p class="signer-role">HR Team</p></div></div>
        </div>
        <div class="footer-creative"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-creative { font-family: 'Poppins', sans-serif; max-width: 800px; margin: 0 auto; } .header-creative { background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; color: white; } .recipient-name { font-size: 24px; color: #667eea; font-weight: 700; } .offer-title { background: #fee2e2; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; } .offer-title h2 { color: #ef4444; } .footer-creative { text-align: center; font-size: 11px; padding: 20px; }`
  },

  'relieving-minimal': {
    name: 'Minimal Relieving',
    category: 'Relieving Letter',
    description: 'Clean relieving letter',
    html: `
      <div class="letter-minimal">
        <div class="header-minimal">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content-minimal">
          <p class="meta">{{current_date}}</p>
          <p class="to">{{candidate_name}}</p>
          <h2 class="subject">Relieving Order</h2>
          <div class="body-content">
            <p>You are relieved from your duties as <strong>{{designation}}</strong> on <strong>{{last_working_day}}</strong>.</p>
            {{{body_content}}}
          </div>
          <div class="signature-minimal">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="name">{{hr_name}}</p></div>
        </div>
        <div class="footer-minimal"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-minimal { font-family: 'Helvetica', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #000; } .header-minimal { border-bottom: 1px solid #000; padding-bottom: 20px; } .header-minimal h1 { text-transform: uppercase; letter-spacing: 2px; font-size: 20px; } .footer-minimal { border-top: 1px solid #ddd; padding-top: 20px; text-align: center; font-size: 10px; margin-top: 40px; }`
  },

  'relieving-executive': {
    name: 'Executive Relieving',
    category: 'Relieving Letter',
    description: 'Premium relieving letter',
    html: `
      <div class="letter-executive">
        <div class="header-executive"><div class="header-left">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div><div class="header-right"><h1>{{company_name}}</h1></div></div>
        <div class="content-executive">
          <div class="document-title"><h2>Relieving & Experience Letter</h2><p class="subtitle">{{designation}}</p></div>
          <div class="meta-executive">
            <div class="meta-item"><span class="label">Name</span><span class="value">{{candidate_name}}</span></div>
            <div class="meta-item"><span class="label">Relieved On</span><span class="value">{{last_working_day}}</span></div>
          </div>
          <div class="body-content">
            <p>We certify that <strong>{{candidate_name}}</strong> has been relieved from the services of <strong>{{company_name}}</strong>.</p>
            {{{body_content}}}
          </div>
          <div class="signature-executive">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="name">{{hr_name}}</p><p class="title">Director - HR</p></div>
        </div>
        <div class="footer-executive"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-executive { font-family: 'Times New Roman', serif; max-width: 850px; margin: 0 auto; border: 1px solid #d4af37; padding: 50px; } .header-executive { border-bottom: 2px solid #d4af37; padding-bottom: 20px; display: flex; justify-content: space-between; } .logo { max-height: 70px; } .document-title { text-align: center; margin: 30px 0; } .meta-executive { display: grid; grid-template-columns: repeat(2, 1fr); background: #f9f9f9; padding: 20px; border-left: 4px solid #d4af37; margin-bottom: 30px; } .meta-item { display: flex; flex-direction: column; } .meta-item .label { font-size: 10px; text-transform: uppercase; color: #999; } .footer-executive { text-align: center; font-size: 11px; margin-top: 50px; border-top: 2px solid #d4af37; padding-top: 20px; }`
  },

  'relieving-elegant': {
    name: 'Elegant Relieving',
    category: 'Relieving Letter',
    description: 'Sophisticated relieving letter',
    html: `
      <div class="letter-elegant">
        <div class="header-elegant"><div class="logo-wrapper">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div><h1>{{company_name}}</h1></div>
        <div class="content-elegant">
          <p class="date">{{current_date}}</p>
          <div class="title-section"><span class="ornament">❧</span><h2>Relieving Order</h2><span class="ornament">❧</span></div>
          <div class="body-content">
            <p>Dear <strong>{{candidate_name}}</strong>,</p>
            <p>You are hereby relieved from your services as <strong class="highlight">{{designation}}</strong>.</p>
            <p>Your last working day is noted as <strong>{{last_working_day}}</strong>.</p>
            {{body_content}}
          </div>
          <div class="signature-block"><p>Sincerely,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-elegant"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-elegant { font-family: 'Playfair Display', serif; color: #4a4a4a; max-width: 800px; margin: 0 auto; border: double 6px #e5e5e5; padding: 60px; } .header-elegant { text-align: center; margin-bottom: 40px; } .logo { max-height: 70px; margin-bottom: 15px; } .title-section { text-align: center; color: #8b5cf6; margin: 30px 0; } .title-section h2 { border-bottom: 1px solid #8b5cf6; padding-bottom: 5px; display: inline-block; font-style: italic; } .footer-elegant { text-align: center; margin-top: 60px; border-top: 1px solid #f4f4f5; padding-top: 20px; font-size: 11px; } .signature { max-height: 50px; }`
  },

  'relieving-corporate': {
    name: 'Corporate Relieving',
    category: 'Relieving Letter',
    description: 'Professional relieving letter',
    html: `
      <div class="letter-corporate">
        <div class="header-block">
            <div class="header-content">
                <h1>RELIEVING LETTER</h1>
                <p>OFFICIAL DOCUMENT</p>
            </div>
            {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
        </div>
        <div class="main-content">
            <div class="content-card">
                 <div class="meta-row">
                    <span><strong>Date:</strong> {{current_date}}</span>
                    <span><strong>Ref:</strong> REL/{{current_date}}</span>
                 </div>
                 <h2 class="subject">Relieving Order</h2>
                 <div class="body-content">
                    <p>We accept the resignation of <strong>{{candidate_name}}</strong> from the position of <strong>{{designation}}</strong>.</p>
                    <table class="details-table">
                        <tr><td>Employee Name</td><td>{{candidate_name}}</td></tr>
                        <tr><td>Designation</td><td>{{designation}}</td></tr>
                        <tr><td>Relieving Date</td><td>{{last_working_day}}</td></tr>
                    </table>
                    {{{body_content}}}
                 </div>
                 <div class="signature-section">
                    <p>Authorized Signatory</p>
                    {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
                    <p><strong>{{hr_name}}</strong></p>
                 </div>
            </div>
        </div>
        <div class="footer-block"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-corporate { font-family: 'Arial', sans-serif; background: #fff; } .header-block { background: #0f172a; padding: 40px 60px; color: white; display: flex; justify-content: space-between; align-items: center; } .header-content h1 { margin: 0; font-size: 24px; letter-spacing: 1px; } .header-content p { margin: 5px 0 0; opacity: 0.7; font-size: 11px; text-transform: uppercase; } .logo { max-height: 60px; filter: brightness(0) invert(1); } .main-content { padding: 40px 60px; background: #f8fafc; min-height: 600px; } .content-card { background: white; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 4px; } .meta-row { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; } .subject { color: #0f172a; font-size: 20px; margin-bottom: 20px; } .details-table { width: 100%; margin: 20px 0; border-collapse: collapse; } .details-table td { padding: 12px; border: 1px solid #e2e8f0; } .details-table td:first-child { font-weight: bold; width: 30%; background: #f8fafc; } .footer-block { padding: 20px; text-align: center; background: #f1f5f9; color: #64748b; font-size: 11px; border-top: 2px solid #0f172a; } .signature { max-height: 50px; margin: 10px 0; }`
  },

  'relieving-vibrant': {
    name: 'Vibrant Relieving',
    category: 'Relieving Letter',
    description: 'Energetic relieving letter',
    html: `
      <div class="letter-vibrant">
        <div class="header-vibrant"><div class="header-text"><h1>{{company_name}}</h1><p>RELIEVING ORDER</p></div>{{#if logo}}<div class="logo-box"><img src="{{logo}}" class="logo" /></div>{{/if}}</div>
        <div class="content-vibrant">
          <p class="date"><strong>Date:</strong> {{current_date}}</p>
          <div class="offer-msg">Farewell, <span>{{candidate_name}}</span>.</div>
          <div class="body-content">
            <p>You have been officially relieved from your duties as <strong>{{designation}}</strong>.</p>
            <div class="stat-box"><span class="label">Last Working Day</span><span class="value">{{last_working_day}}</span></div>
            {{body_content}}
            <p>We wish you luck!</p>
          </div>
          <div class="signature-block"><p>Cheers,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-vibrant">{{footer_text}}</div>
      </div>
    `,
    css: `.letter-vibrant { font-family: 'Verdana', sans-serif; max-width: 800px; margin: 0 auto; overflow: hidden; } .header-vibrant { background: #be123c; color: white; padding: 40px; position: relative; clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%); } .header-text h1 { margin: 0; } .logo-box { position: absolute; right: 40px; top: 30px; background: white; padding: 10px; border-radius: 50%; } .logo { max-width: 50px; } .offer-msg { font-size: 18px; color: #881337; margin: 20px 0; font-weight: bold; } .stat-box { border: 2px solid #be123c; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0; width: 50%; } .label { font-weight: bold; display: block; font-size: 10px; text-transform: uppercase; color: #be123c; } .footer-vibrant { background: #1a1a1a; color: white; padding: 20px; text-align: center; font-size: 11px; margin-top: 40px; } .signature { max-height: 50px; }`
  },

  'relieving-fresh': {
    name: 'Fresh Relieving',
    category: 'Relieving Letter',
    description: 'Modern relieving letter',
    html: `
      <div class="letter-fresh">
        <div class="border-wrapper">
          <div class="header-fresh">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
          <div class="content-fresh">
            <div class="status-badge">RELIEVED</div>
            <p class="date">{{current_date}}</p>
            <p class="salutation">Dear {{candidate_name}},</p>
            <div class="body-content">
              <p>You have been relieved from the services of our company.</p>
              <div class="info-list">
                 <div class="info-item"><span>Effective Date:</span> {{last_working_day}}</div>
              </div>
              {{body_content}}
            </div>
            <div class="signature-block"><p>Best,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
          </div>
          <div class="footer-fresh">{{footer_text}}</div>
        </div>
      </div>
    `,
    css: `.letter-fresh { font-family: 'Lato', sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; color: #064e3b; } .border-wrapper { border: 2px solid #059669; border-radius: 15px; height: 100%; display: flex; flex-direction: column; } .header-fresh { background: #ecfdf5; padding: 30px; text-align: center; border-bottom: 1px solid #059669; } .logo { max-height: 50px; } .status-badge { float: right; background: #059669; color: white; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: bold; } .info-list { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; } .info-item { padding: 8px 0; border-bottom: 1px dashed #059669; } .footer-fresh { background: #ecfdf5; color: #047857; text-align: center; padding: 15px; border-top: 1px solid #059669; font-size: 10px; } .signature { max-height: 50px; }`
  },

  'relieving-sunset': {
    name: 'Sunset Relieving',
    category: 'Relieving Letter',
    description: 'Warm relieving letter',
    html: `
      <div class="letter-sunset">
        <div class="header-sunset">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content-sunset">
          <p class="date">{{current_date}}</p>
          <h2>Relieving Letter</h2>
          <div class="welcome-box"><p>{{candidate_name}}</p></div>
          <div class="body-content">
             <p>This confirms that you are relieved from your duties.</p>
             <div class="offer-details">
                <div class="detail-row"><span>Relieving Date:</span> <strong>{{last_working_day}}</strong></div>
             </div>
             {{body_content}}
          </div>
          <div class="signature-block"><p>Sincerely,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-sunset"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-sunset { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; color: #431407; } .header-sunset { background: linear-gradient(90deg, #ea580c, #fbbf24); padding: 30px; color: white; display: flex; align-items: center; justify-content: space-between; } .logo { max-height: 50px; background: rgba(255,255,255,0.2); padding: 5px; border-radius: 4px; } .content-sunset { padding: 30px; background: #fff7ed; min-height: 600px; } .welcome-box { font-size: 20px; font-weight: bold; color: #ea580c; border-bottom: 2px solid #fdba74; display: inline-block; margin: 20px 0; } .offer-details { background: white; padding: 15px; border-left: 4px solid #ea580c; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); } .footer-sunset { background: #7c2d12; color: #ffedd5; padding: 15px; text-align: center; font-size: 10px; } .signature { max-height: 50px; }`
  },

  // ==================== REJECTION LETTER TEMPLATES ====================
  'rejection-classic': {
    name: 'Classic Rejection',
    category: 'Rejection Letter',
    description: 'Formal rejection letter',
    html: `
      <div class="letter-classic">
        <div class="header">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content">
          <p class="date">Date: {{current_date}}</p>
          <h2 class="subject">Status of Application for {{designation}}</h2>
          <div class="body-content">
            <p>Dear {{candidate_name}},</p>
            <p>Thank you for giving us the opportunity to review your application.</p>
            <p>We appreciate your interest in <strong>{{company_name}}</strong>. However, after careful consideration, we have decided to move forward with other candidates who more closely align with our current requirements.</p>
            {{{body_content}}}
            <p>We will keep your resume on file for future openings.</p>
          </div>
          <div class="signature-block"><p>Sincerely,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong><br>Recruitment Team</p></div>
        </div>
        <div class="footer"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-classic { font-family: 'Georgia', serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; } .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; } .logo { max-height: 70px; } .footer { text-align: center; margin-top: 40px; font-size: 11px; border-top: 1px solid #eee; padding-top: 20px; } .signature { max-height: 50px; }`
  },

  'rejection-modern': {
    name: 'Modern Rejection',
    category: 'Rejection Letter',
    description: 'Modern rejection letter',
    html: `
      <div class="letter-modern">
        <div class="header-bar"></div><div class="header">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content">
          <p class="date">{{current_date}}</p>
          <div class="banner">Application Update</div>
          <div class="body-content">
            <p>Hi {{candidate_name}},</p>
            <p>Thank you for applying to the <strong>{{designation}}</strong> position.</p>
            <p>While we were impressed with your background, we have chosen to proceed with other candidates at this time.</p>
            {{{body_content}}}
            <p>We wish you the best in your job search.</p>
          </div>
          <div class="signature-block"><p>Best Regards,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong><br>Hiring Team</p></div>
        </div>
        <div class="footer"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-modern { font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; color: #333; } .header-bar { height: 8px; background: linear-gradient(90deg, #9ca3af, #4b5563); } .header { padding: 30px; background: #f8fafc; display: flex; align-items: center; gap: 20px; } .banner { background: #f3f4f6; color: #374151; padding: 15px; text-align: center; font-size: 18px; font-weight: 600; margin: 20px 0; border-radius: 8px; } .footer { background: #1f2937; color: white; padding: 20px; text-align: center; }`
  },

  'rejection-professional': {
    name: 'Professional Rejection',
    category: 'Rejection Letter',
    description: 'Corporate rejection letter',
    html: `
      <div class="letter-professional">
        <div class="header"><div class="header-left">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div><div class="header-right"><h1>{{company_name}}</h1></div></div>
        <div class="divider"></div>
        <div class="content">
          <div class="document-header"><h2>Candidate Status Update</h2></div>
          <div class="document-info"><table><tr><td><strong>Date:</strong></td><td>{{current_date}}</td></tr><tr><td><strong>Position:</strong></td><td>{{designation}}</td></tr></table></div>
          <div class="body-content">
            <p>We permit this letter to inform you that we will not be moving forward with your candidacy for the <strong>{{designation}}</strong> role.</p>
            {{{body_content}}}
            <p>We encourage you to apply for future openings.</p>
          </div>
          <div class="signature-block"><div class="signature-line">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}</div><div class="signatory-info"><p class="name">{{hr_name}}</p><p class="title">Talent Acquisition</p></div></div>
        </div>
        <div class="footer"><div class="footer-bar"></div><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-professional { font-family: 'Arial', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; } .header { display: flex; justify-content: space-between; } .divider { height: 3px; background: #475569; margin: 20px 0; } .document-info { background: #f8fafc; padding: 20px; border-left: 4px solid #475569; } .footer { margin-top: 50px; text-align: center; font-size: 11px; }`
  },

  'rejection-creative': {
    name: 'Creative Rejection',
    category: 'Rejection Letter',
    description: 'Polite creative rejection',
    html: `
      <div class="letter-creative">
        <div class="header-creative"><div class="header-content">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div></div>
        <div class="content-creative">
          <div class="greeting"><span class="greeting-text">Hello,</span><span class="recipient-name">{{candidate_name}}</span></div>
          <div class="offer-title"><h2>Application Update</h2></div>
          <div class="body-content">
            <p>Thank you for reaching out to us. Although your skills are impressive, we decided to pursue other candidates for the <strong>{{designation}}</strong> position.</p>
            {{{body_content}}}
            <p>Let's stay connected!</p>
          </div>
          <div class="signature-creative"><div class="signature-card">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="signer-name">{{hr_name}}</p><p class="signer-role">HR Team</p></div></div>
        </div>
        <div class="footer-creative"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-creative { font-family: 'Poppins', sans-serif; max-width: 800px; margin: 0 auto; } .header-creative { background: linear-gradient(135deg, #a855f7, #ec4899); padding: 30px; color: white; } .recipient-name { font-size: 24px; color: #a855f7; font-weight: 700; } .offer-title { background: #f3e8ff; padding: 15px; text-align: center; border-radius: 10px; margin: 20px 0; } .offer-title h2 { color: #6b21a8; margin: 0; font-size: 20px; } .footer-creative { text-align: center; font-size: 11px; padding: 20px; }`
  },

  'rejection-minimal': {
    name: 'Minimal Rejection',
    category: 'Rejection Letter',
    description: 'Direct rejection letter',
    html: `
      <div class="letter-minimal">
        <div class="header-minimal">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content-minimal">
          <p class="meta">{{current_date}}</p>
          <p class="to">{{candidate_name}}</p>
          <h2 class="subject">Regarding your application</h2>
          <div class="body-content">
            <p>We are writing to let you know that we have selected another candidate for the <strong>{{designation}}</strong> role.</p>
            {{{body_content}}}
            <p>Thank you for your time.</p>
          </div>
          <div class="signature-minimal">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="name">{{hr_name}}</p></div>
        </div>
        <div class="footer-minimal"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-minimal { font-family: 'Helvetica', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #000; } .header-minimal { border-bottom: 1px solid #000; padding-bottom: 20px; } .header-minimal h1 { text-transform: uppercase; letter-spacing: 2px; font-size: 20px; } .footer-minimal { border-top: 1px solid #ddd; padding-top: 20px; text-align: center; font-size: 10px; margin-top: 40px; }`
  },

  'rejection-executive': {
    name: 'Executive Rejection',
    category: 'Rejection Letter',
    description: 'Executive rejection letter',
    html: `
      <div class="letter-executive">
        <div class="header-executive"><div class="header-left">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div><div class="header-right"><h1>{{company_name}}</h1></div></div>
        <div class="content-executive">
          <div class="document-title"><h2>Application Status</h2></div>
          <div class="meta-executive">
            <div class="meta-item"><span class="label">Candidate</span><span class="value">{{candidate_name}}</span></div>
            <div class="meta-item"><span class="label">Role</span><span class="value">{{designation}}</span></div>
          </div>
          <div class="body-content">
            <p>We have completed our evaluation for the <strong>{{designation}}</strong> position.</p>
            <p>We regret to inform you that we will not be proceeding with your application at this stage.</p>
            {{{body_content}}}
          </div>
          <div class="signature-executive">{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p class="name">{{hr_name}}</p><p class="title">Director - HR</p></div>
        </div>
        <div class="footer-executive"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-executive { font-family: 'Times New Roman', serif; max-width: 850px; margin: 0 auto; border: 1px solid #666; padding: 50px; } .header-executive { border-bottom: 2px solid #666; padding-bottom: 20px; display: flex; justify-content: space-between; } .logo { max-height: 70px; } .document-title { text-align: center; margin: 30px 0; } .meta-executive { display: grid; grid-template-columns: repeat(2, 1fr); background: #f5f5f5; padding: 20px; border-left: 4px solid #666; margin-bottom: 30px; } .meta-item { display: flex; flex-direction: column; } .meta-item .label { font-size: 10px; text-transform: uppercase; color: #999; } .footer-executive { text-align: center; font-size: 11px; margin-top: 50px; border-top: 2px solid #666; padding-top: 20px; }`
  },

  'rejection-elegant': {
    name: 'Elegant Rejection',
    category: 'Rejection Letter',
    description: 'Refined rejection letter',
    html: `
      <div class="letter-elegant">
        <div class="header-elegant"><div class="logo-wrapper">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}</div><h1>{{company_name}}</h1></div>
        <div class="content-elegant">
          <p class="date">{{current_date}}</p>
          <div class="title-section"><span class="ornament">❧</span><h2>Application Update</h2><span class="ornament">❧</span></div>
          <div class="body-content">
            <p>Dear <strong>{{candidate_name}}</strong>,</p>
            <p>Thank you for your interest in the <strong class="highlight">{{designation}}</strong> position.</p>
            <p>We have decided to move forward with other candidates.</p>
            {{{body_content}}}
          </div>
          <div class="signature-block"><p>Sincerely,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-elegant"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-elegant { font-family: 'Playfair Display', serif; color: #4a4a4a; max-width: 800px; margin: 0 auto; border: double 6px #e5e5e5; padding: 60px; } .header-elegant { text-align: center; margin-bottom: 40px; } .logo { max-height: 70px; margin-bottom: 15px; } .title-section { text-align: center; color: #8b5cf6; margin: 30px 0; } .title-section h2 { border-bottom: 1px solid #8b5cf6; padding-bottom: 5px; display: inline-block; font-style: italic; } .footer-elegant { text-align: center; margin-top: 60px; border-top: 1px solid #f4f4f5; padding-top: 20px; font-size: 11px; } .signature { max-height: 50px; }`
  },

  'rejection-corporate': {
    name: 'Corporate Rejection',
    category: 'Rejection Letter',
    description: 'Corporate rejection',
    html: `
      <div class="letter-corporate">
        <div class="header-block">
            <div class="header-content">
                <h1>STATUS UPDATE</h1>
                <p>OFFICIAL DOCUMENT</p>
            </div>
            {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
        </div>
        <div class="main-content">
            <div class="content-card">
                 <div class="meta-row">
                    <span><strong>Date:</strong> {{current_date}}</span>
                    <span><strong>Ref:</strong> APP-STATUS</span>
                 </div>
                 <h2 class="subject">Application Status</h2>
                 <div class="body-content">
                    <p>Dear {{candidate_name}},</p>
                    <p>We are writing to inform you that we will not be moving forward with your application for <strong>{{designation}}</strong>.</p>
                    <table class="details-table">
                        <tr><td>Candidate Name</td><td>{{candidate_name}}</td></tr>
                        <tr><td>Position</td><td>{{designation}}</td></tr>
                    </table>
                    {{{body_content}}}
                 </div>
                 <div class="signature-section">
                    <p>Recruitment Department</p>
                    {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
                    <p><strong>{{hr_name}}</strong></p>
                 </div>
            </div>
        </div>
        <div class="footer-block"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-corporate { font-family: 'Arial', sans-serif; background: #fff; } .header-block { background: #0f172a; padding: 40px 60px; color: white; display: flex; justify-content: space-between; align-items: center; } .header-content h1 { margin: 0; font-size: 24px; letter-spacing: 1px; } .header-content p { margin: 5px 0 0; opacity: 0.7; font-size: 11px; text-transform: uppercase; } .logo { max-height: 60px; filter: brightness(0) invert(1); } .main-content { padding: 40px 60px; background: #f8fafc; min-height: 600px; } .content-card { background: white; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 4px; } .meta-row { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; } .subject { color: #0f172a; font-size: 20px; margin-bottom: 20px; } .details-table { width: 100%; margin: 20px 0; border-collapse: collapse; } .details-table td { padding: 12px; border: 1px solid #e2e8f0; } .details-table td:first-child { font-weight: bold; width: 30%; background: #f8fafc; } .footer-block { padding: 20px; text-align: center; background: #f1f5f9; color: #64748b; font-size: 11px; border-top: 2px solid #0f172a; } .signature { max-height: 50px; margin: 10px 0; }`
  },

  'rejection-vibrant': {
    name: 'Vibrant Rejection',
    category: 'Rejection Letter',
    description: 'Energetic rejection',
    html: `
      <div class="letter-vibrant">
        <div class="header-vibrant"><div class="header-text"><h1>{{company_name}}</h1><p>APPLICATION UPDATE</p></div>{{#if logo}}<div class="logo-box"><img src="{{logo}}" class="logo" /></div>{{/if}}</div>
        <div class="content-vibrant">
          <p class="date"><strong>Date:</strong> {{current_date}}</p>
          <div class="offer-msg">Regarding your application...</div>
          <div class="body-content">
            <p>Hey <strong>{{candidate_name}}</strong>, thanks for applying for <strong>{{designation}}</strong>.</p>
            <p>We've decided to go with another candidate this time.</p>
            {{body_content}}
            <p>Keep improving!</p>
          </div>
          <div class="signature-block"><p>Best,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-vibrant">{{footer_text}}</div>
      </div>
    `,
    css: `.letter-vibrant { font-family: 'Verdana', sans-serif; max-width: 800px; margin: 0 auto; overflow: hidden; } .header-vibrant { background: #db2777; color: white; padding: 40px; position: relative; clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%); } .header-text h1 { margin: 0; } .logo-box { position: absolute; right: 40px; top: 30px; background: white; padding: 10px; border-radius: 50%; } .logo { max-width: 50px; } .offer-msg { font-size: 18px; color: #9d174d; margin: 20px 0; font-weight: bold; } .footer-vibrant { background: #1a1a1a; color: white; padding: 20px; text-align: center; font-size: 11px; margin-top: 40px; } .signature { max-height: 50px; }`
  },

  'rejection-fresh': {
    name: 'Fresh Rejection',
    category: 'Rejection Letter',
    description: 'Modern rejection',
    html: `
      <div class="letter-fresh">
        <div class="border-wrapper">
          <div class="header-fresh">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
          <div class="content-fresh">
            <div class="status-badge" style="background: #6b7280;">CLOSED</div>
            <p class="date">{{current_date}}</p>
            <p class="salutation">Dear {{candidate_name}},</p>
            <div class="body-content">
              <p>We appreciate your interest in the <strong>{{designation}}</strong> role.</p>
              <p>However, we have filled the vacancy with another candidate.</p>
              {{body_content}}
            </div>
            <div class="signature-block"><p>Regards,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
          </div>
          <div class="footer-fresh">{{footer_text}}</div>
        </div>
      </div>
    `,
    css: `.letter-fresh { font-family: 'Lato', sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; color: #374151; } .border-wrapper { border: 2px solid #9ca3af; border-radius: 15px; height: 100%; display: flex; flex-direction: column; } .header-fresh { background: #f3f4f6; padding: 30px; text-align: center; border-bottom: 1px solid #9ca3af; } .logo { max-height: 50px; } .status-badge { float: right; color: white; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: bold; } .footer-fresh { background: #f3f4f6; color: #4b5563; text-align: center; padding: 15px; border-top: 1px solid #9ca3af; font-size: 10px; } .signature { max-height: 50px; }`
  },

  'rejection-sunset': {
    name: 'Sunset Rejection',
    category: 'Rejection Letter',
    description: 'Warm rejection',
    html: `
      <div class="letter-sunset">
        <div class="header-sunset">{{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}<h1>{{company_name}}</h1></div>
        <div class="content-sunset">
          <p class="date">{{current_date}}</p>
          <h2>Application Outcome</h2>
          <div class="welcome-box"><p>{{candidate_name}}</p></div>
          <div class="body-content">
             <p>We are grateful for your application for <strong>{{designation}}</strong>.</p>
             <p>At this time, we will not be proceeding further.</p>
             {{body_content}}
          </div>
          <div class="signature-block"><p>Sincerely,</p>{{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}<p><strong>{{hr_name}}</strong></p></div>
        </div>
        <div class="footer-sunset"><p>{{footer_text}}</p></div>
      </div>
    `,
    css: `.letter-sunset { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; color: #431407; } .header-sunset { background: linear-gradient(90deg, #fdba74, #fed7aa); padding: 30px; color: #7c2d12; display: flex; align-items: center; justify-content: space-between; } .logo { max-height: 50px; background: rgba(255,255,255,0.4); padding: 5px; border-radius: 4px; } .content-sunset { padding: 30px; background: #fff7ed; min-height: 600px; } .welcome-box { font-size: 20px; font-weight: bold; color: #c2410c; border-bottom: 2px solid #fdba74; display: inline-block; margin: 20px 0; } .footer-sunset { background: #7c2d12; color: #ffedd5; padding: 15px; text-align: center; font-size: 10px; } .signature { max-height: 50px; }`
  },

  // ==================== EXPERIENCE LETTER TEMPLATES ====================
  'experience-classic': {
    name: 'Classic Experience',
    category: 'Experience Letter',
    description: 'Formal experience certificate',
    html: `
      <div class="letter-experience-classic">
        <div class="header">
          {{#if logo}}
          <img src="{{logo}}" class="logo" alt="Company Logo" />
          {{/if}}
          <h1>{{company_name}}</h1>
        </div>
        
        <div class="content">
          <h2 class="document-title">TO WHOMSOEVER IT MAY CONCERN</h2>
          
          <p class="date">Date: {{current_date}}</p>
          
          <div class="body-content">
            <p>This is to certify that <strong>{{candidate_name}}</strong> was associated with <strong>{{company_name}}</strong> as <strong>{{designation}}</strong>.</p>
            
            <p>Their employment details are as follows:</p>
            
            <div class="details-table">
              <table>
                 <tr>
                   <td><strong>Date of Joining:</strong></td>
                   <td>{{joining_date}}</td>
                 </tr>
                 <tr>
                   <td><strong>Last Working Day:</strong></td>
                   <td>{{last_working_day}}</td>
                 </tr>
                 <tr>
                   <td><strong>Total Duration:</strong></td>
                   <td>{{experience_duration}}</td>
                 </tr>
              </table>
            </div>

            <p>During their tenure with us, we found them to be sincere, hardworking, and dedicated. They have performed their duties to our satisfaction.</p>
            
            <p>We wish them all the best in their future endeavors.</p>
            
            {{body_content}}
          </div>
          
          <div class="signature-block">
            <p>For {{company_name}}</p>
            {{#if signature}}
            <img src="{{signature}}" class="signature" alt="Signature" />
            {{/if}}
            <p><strong>{{hr_name}}</strong><br>Authorized Signatory</p>
          </div>
        </div>
        
        <div class="footer">
          <p>{{footer_text}}</p>
        </div>
      </div>
    `,
    css: `
      .letter-experience-classic { font-family: 'Times New Roman', serif; color: #000; max-width: 800px; margin: 0 auto; padding: 50px; background: #fff; }
      .letter-experience-classic .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
      .letter-experience-classic .logo { max-height: 70px; margin-bottom: 15px; }
      .letter-experience-classic h1 { font-size: 26px; font-weight: bold; margin: 0; text-transform: uppercase; }
      .letter-experience-classic .document-title { text-align: center; text-decoration: underline; margin: 40px 0; font-size: 18px; font-weight: bold; letter-spacing: 1px; }
      .letter-experience-classic .date { text-align: right; font-weight: bold; margin-bottom: 30px; }
      .letter-experience-classic .body-content { line-height: 1.8; font-size: 16px; text-align: justify; }
      .letter-experience-classic .body-content p { margin: 20px 0; }
      .letter-experience-classic .details-table { margin: 30px auto; width: 80%; }
      .letter-experience-classic .details-table table { width: 100%; border-collapse: collapse; }
      .letter-experience-classic .details-table td { padding: 8px; font-size: 16px; }
      .letter-experience-classic .signature-block { margin-top: 60px; }
      .letter-experience-classic .signature { max-height: 50px; margin: 10px 0; }
      .letter-experience-classic .footer { margin-top: 60px; text-align: center; font-size: 12px; border-top: 1px solid #ccc; padding-top: 20px; }
    `
  },

  'experience-modern': {
    name: 'Modern Experience',
    category: 'Experience Letter',
    description: 'Clean and modern service certificate',
    html: `
      <div class="letter-experience-modern">
        <div class="header-band"></div>
        <div class="header">
          <div class="logo-area">
             {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
          </div>
          <div class="company-area">
             <h1>{{company_name}}</h1>
             <p>Experience Certificate</p>
          </div>
        </div>
        
        <div class="content">
          <div class="info-grid">
             <div class="info-item">
               <span class="label">Employee Name</span>
               <span class="value">{{candidate_name}}</span>
             </div>
             <div class="info-item">
               <span class="label">Date</span>
               <span class="value">{{current_date}}</span>
             </div>
          </div>
          
          <div class="body-content">
             <p>This is to certify that <strong>{{candidate_name}}</strong> has worked with <strong>{{company_name}}</strong> as <strong>{{designation}}</strong>.</p>
             <p>The details of their employment are as follows:</p>
             
             <div class="highlight-box">
                <div class="h-row">
                   <span>Joining Date</span>
                   <strong>{{joining_date}}</strong>
                </div>
                <div class="h-row">
                   <span>Last Working Day</span>
                   <strong>{{last_working_day}}</strong>
                </div>
                <div class="h-row">
                   <span>Total Experience</span>
                   <strong>{{experience_duration}}</strong>
                </div>
             </div>
             
             <p>During their tenure, they demonstrated professional competence and good conduct. We thank them for their contribution and wish them success in future endeavors.</p>
             {{body_content}}
          </div>
          
          <div class="signature-section">
             {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
             <div class="details">
                <p class="h-name">{{hr_name}}</p>
                <p class="h-role">Human Resources</p>
             </div>
          </div>
        </div>
        
        <div class="footer">
           {{footer_text}}
        </div>
      </div>
    `,
    css: `
      .letter-experience-modern { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2d3748; max-width: 800px; margin: 0 auto; background: white; }
      .header-band { height: 10px; background: linear-gradient(90deg, #4299e1, #667eea); }
      .header { display: flex; align-items: center; justify-content: space-between; padding: 40px 50px; background: #f7fafc; border-bottom: 1px solid #edf2f7; }
      .company-area { text-align: right; }
      .company-area h1 { margin: 0; font-size: 24px; color: #2b6cb0; }
      .company-area p { margin: 5px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #718096; }
      .logo { max-height: 60px; }
      .content { padding: 50px; }
      .info-grid { display: flex; gap: 40px; margin-bottom: 40px; }
      .info-item { display: flex; flex-direction: column; }
      .label { font-size: 11px; text-transform: uppercase; color: #a0aec0; font-weight: bold; margin-bottom: 4px; }
      .value { font-size: 16px; font-weight: 600; }
      .body-content { line-height: 1.8; font-size: 15px; color: #4a5568; }
      .highlight-box { background: #ebf8ff; border-left: 4px solid #4299e1; padding: 25px; margin: 30px 0; border-radius: 4px; }
      .h-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #bee3f8; padding-bottom: 8px; }
      .h-row:last-child { margin: 0; border: none; padding: 0; }
      .h-row span { color: #5a67d8; font-weight: 500; }
      .signature-section { margin-top: 60px; display: flex; flex-direction: column; align-items: flex-start; }
      .signature { max-height: 50px; margin-bottom: 10px; }
      .h-name { margin: 0; font-weight: bold; font-size: 16px; color: #2d3748; }
      .h-role { margin: 2px 0 0; font-size: 13px; color: #718096; }
      .footer { background: #2d3748; color: #cbd5e1; padding: 20px; text-align: center; font-size: 12px; }
    `
  },

  // ==================== RELIEVING LETTER TEMPLATES ====================
  'relieving-classic': {
    name: 'Classic Relieving',
    category: 'Relieving Letter',
    description: 'Formal relieving letter',
    html: `
      <div class="letter-relieving">
        <div class="header">
          {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
          <h1>{{company_name}}</h1>
        </div>
        
        <div class="content">
          <p class="date">Date: {{current_date}}</p>
          
          <h2 class="subject">Subject: Relieving Letter</h2>
          
          <p class="salutation">Dear {{candidate_name}},</p>
          
          <div class="body">
            <p>This has reference to your resignation letter based on which you have been relieved from the services of the company at the close of working hours on <strong>{{last_working_day}}</strong>.</p>
            
            <p>We certify that you have served the company from <strong>{{joining_date}}</strong> to <strong>{{last_working_day}}</strong> as <strong>{{designation}}</strong>.</p>
            
            <p>We would like to thank you for your service and contribution to the organization.</p>
            
            <p>We wish you all the best in your future career endeavors.</p>
            
            {{body_content}}
          </div>
          
          <div class="signature-block">
            <p>Sincerely,</p>
            {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
            <p class="hr-name">{{hr_name}}</p>
            <p class="hr-title">Manager - Human Resources</p>
            <p class="company">{{company_name}}</p>
          </div>
        </div>
        
        <div class="footer">
          {{footer_text}}
        </div>
      </div>
    `,
    css: `
      .letter-relieving { font-family: 'Georgia', serif; color: #000; max-width: 800px; margin: 0 auto; padding: 50px; background: white; }
      .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #555; padding-bottom: 20px; }
      .logo { max-height: 70px; margin-bottom: 15px; }
      .header h1 { font-size: 28px; margin: 0; font-weight: normal; text-transform: uppercase; letter-spacing: 1px; }
      .date { text-align: right; margin-bottom: 40px; }
      .subject { text-decoration: underline; font-size: 16px; margin: 20px 0; }
      .salutation { font-weight: bold; margin-bottom: 20px; }
      .body { line-height: 1.8; font-size: 15px; text-align: justify; }
      .body p { margin: 15px 0; }
      .signature-block { margin-top: 60px; }
      .signature { max-height: 50px; margin: 10px 0; }
      .hr-name { font-weight: bold; margin: 5px 0 0; }
      .hr-title, .company { margin: 2px 0; font-size: 13px; color: #555; }
      .footer { margin-top: 60px; border-top: 1px solid #ccc; padding-top: 15px; text-align: center; font-size: 11px; color: #666; }
    `
  },

  'relieving-modern': {
    name: 'Modern Relieving',
    category: 'Relieving Letter',
    description: 'Professional Clean Relieving Letter',
    html: `
      <div class="letter-relieving-modern">
         <div class="header">
            <div class="brand">
               {{#if logo}}<img src="{{logo}}" class="logo" />{{/if}}
               <h1>{{company_name}}</h1>
            </div>
            <div class="doc-type">RELIEVING LETTER</div>
         </div>
         
         <div class="content">
            <div class="meta-row">
               <div>
                  <span class="m-label">To</span>
                  <div class="m-val">{{candidate_name}}</div>
                  <div class="m-sub">{{designation}}</div>
               </div>
               <div style="text-align: right;">
                  <span class="m-label">Date</span>
                  <div class="m-val">{{current_date}}</div>
               </div>
            </div>
            
            <div class="body-text">
               <p>This letter acknowledges the acceptance of your resignation. You have been relieved of your duties at <strong>{{company_name}}</strong> effective from the close of business on <strong>{{last_working_day}}</strong>.</p>
               
               <div class="service-box">
                  <div class="s-head">Service Record</div>
                  <div class="s-grid">
                     <div class="s-item">
                        <span class="s-lbl">Joined On</span>
                        <span class="s-val">{{joining_date}}</span>
                     </div>
                     <div class="s-item">
                        <span class="s-lbl">Relieved On</span>
                        <span class="s-val">{{last_working_day}}</span>
                     </div>
                     <div class="s-item">
                        <span class="s-lbl">Designation</span>
                        <span class="s-val">{{designation}}</span>
                     </div>
                  </div>
               </div>
               
               <p>We confirm that you have handed over all company assets and cleared all dues.</p>
               <p>We appreciate your contributions during your tenure and wish you the very best for your future.</p>
               
               {{body_content}}
            </div>
            
            <div class="signatures">
               <div class="sign-box">
                  {{#if signature}}<img src="{{signature}}" class="signature" />{{/if}}
                  <div class="s-name">{{hr_name}}</div>
                  <div class="s-role">Authorized Signatory</div>
               </div>
            </div>
         </div>
         
         <div class="footer">
            {{footer_text}}
         </div>
      </div>
    `,
    css: `
      .letter-relieving-modern { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; max-width: 800px; margin: 0 auto; background: white; }
      .header { padding: 40px; background: #111827; color: white; display: flex; justify-content: space-between; align-items: center; }
      .brand { display: flex; align-items: center; gap: 15px; }
      .logo { max-height: 50px; background: white; padding: 5px; border-radius: 4px; }
      .brand h1 { margin: 0; font-size: 22px; font-weight: 500; letter-spacing: 0.5px; }
      .doc-type { font-size: 14px; font-weight: bold; letter-spacing: 2px; color: #9ca3af; border: 1px solid #374151; padding: 8px 15px; border-radius: 4px; }
      .content { padding: 50px; }
      .meta-row { display: flex; justify-content: space-between; margin-bottom: 50px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }
      .m-label { text-transform: uppercase; font-size: 10px; color: #9ca3af; letter-spacing: 1px; display: block; margin-bottom: 5px; }
      .m-val { font-size: 18px; font-weight: bold; color: #111827; }
      .m-sub { font-size: 14px; color: #6b7280; }
      .body-text { font-size: 15px; line-height: 1.7; color: #374151; }
      .body-text p { margin-bottom: 20px; }
      .service-box { background: #f3f4f6; padding: 25px; border-radius: 8px; margin: 30px 0; border: 1px solid #e5e7eb; }
      .s-head { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #4b5563; margin-bottom: 15px; border-bottom: 1px solid #d1d5db; padding-bottom: 10px; }
      .s-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
      .s-item { display: flex; flex-direction: column; }
      .s-lbl { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
      .s-val { font-size: 15px; font-weight: bold; color: #111827; }
      .signatures { margin-top: 60px; display: flex; justify-content: flex-end; }
      .sign-box { text-align: right; }
      .signature { max-height: 50px; margin-bottom: 10px; }
      .s-name { font-weight: bold; font-size: 16px; }
      .s-role { font-size: 13px; color: #6b7280; }
      .footer { background: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 11px; border-top: 1px solid #e5e7eb; }
    `
  }
};

module.exports = letterDesigns;
