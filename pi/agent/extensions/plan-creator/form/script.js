/**
 * Plan Review - Client Script
 */

(function() {
  'use strict';

  // Get plan data injected by server
  const data = window.__PLAN_DATA__;
  if (!data || !data.plan) {
    console.error('No plan data found');
    return;
  }

  const { plan, cwd, sessionToken, timeout } = data;

  // State
  let heartbeatInterval = null;

  // DOM Elements
  const elements = {
    title: document.getElementById('plan-title'),
    projectPath: document.getElementById('project-path'),
    overview: document.getElementById('plan-overview'),
    currentStateBlock: document.getElementById('current-state-block'),
    currentState: document.getElementById('plan-current-state'),
    desiredStateBlock: document.getElementById('desired-state-block'),
    desiredState: document.getElementById('plan-desired-state'),
    outOfScopeBlock: document.getElementById('out-of-scope-block'),
    outOfScope: document.getElementById('plan-out-of-scope'),
    phasesContainer: document.getElementById('phases-container'),
    testingBlock: document.getElementById('testing-block'),
    testingContent: document.getElementById('testing-content'),
    referencesBlock: document.getElementById('references-block'),
    references: document.getElementById('plan-references'),
    phaseCheckboxes: document.getElementById('phase-checkboxes'),
    phaseSelectionBlock: document.getElementById('phase-selection-block'),
    prioritySelect: document.getElementById('priority-select'),
    approachSelect: document.getElementById('approach-select'),
    notesTextarea: document.getElementById('notes-textarea'),
    submitBtn: document.getElementById('submit-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    successOverlay: document.getElementById('success-overlay'),
    cancelOverlay: document.getElementById('cancel-overlay'),
  };

  // Initialize the page
  function init() {
    renderPlan();
    setupPhaseCheckboxes();
    setupEventListeners();
    startHeartbeat();
  }

  // Simple markdown parser
  function parseMarkdown(text) {
    if (!text) return '';
    
    let html = escapeHtml(text);
    
    // Code blocks (```code```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
    });
    
    // Inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Headers (### h3, ## h2, # h1)
    html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^# (.+)$/gm, '<h4>$1</h4>');
    
    // Bold (**text** or __text__)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Italic (*text* or _text_)
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Unordered lists (- item or * item)
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Ordered lists (1. item)
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    
    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Tables (simple support)
    html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
      const cells = content.split('|').map(cell => cell.trim());
      const isHeader = cells.every(cell => /^-+$/.test(cell));
      if (isHeader) return ''; // Skip separator row
      const cellTag = 'td';
      return '<tr>' + cells.map(cell => `<${cellTag}>${cell}</${cellTag}>`).join('') + '</tr>';
    });
    html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>');
    
    // Paragraphs (double newlines)
    html = html.replace(/\n\n+/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p>(<(?:ul|ol|pre|table|h[1-6]))/g, '$1');
    html = html.replace(/(<\/(?:ul|ol|pre|table|h[1-6])>)<\/p>/g, '$1');
    
    // Single newlines to <br> within paragraphs
    html = html.replace(/([^>])\n([^<])/g, '$1<br>$2');
    
    return html;
  }

  // Render the plan content
  function renderPlan() {
    // Title and meta
    elements.title.textContent = plan.title;
    elements.projectPath.textContent = cwd.replace(/^\/Users\/[^/]+/, '~');

    // Overview (with markdown support)
    elements.overview.innerHTML = parseMarkdown(plan.overview);

    // Current State (with markdown support)
    if (plan.currentState) {
      elements.currentStateBlock.style.display = 'block';
      elements.currentState.innerHTML = parseMarkdown(plan.currentState);
    }

    // Desired End State (with markdown support)
    if (plan.desiredEndState) {
      elements.desiredStateBlock.style.display = 'block';
      elements.desiredState.innerHTML = parseMarkdown(plan.desiredEndState);
    }

    // Out of Scope
    if (plan.outOfScope && plan.outOfScope.length > 0) {
      elements.outOfScopeBlock.style.display = 'block';
      elements.outOfScope.innerHTML = plan.outOfScope
        .map(item => `<li>${escapeHtml(item)}</li>`)
        .join('');
    }

    // Phases
    renderPhases();

    // Testing Strategy
    if (plan.testingStrategy) {
      renderTestingStrategy();
    }

    // References
    if (plan.references && plan.references.length > 0) {
      elements.referencesBlock.style.display = 'block';
      elements.references.innerHTML = plan.references
        .map(ref => `<li>${escapeHtml(ref)}</li>`)
        .join('');
    }
  }

  // Render phases
  function renderPhases() {
    elements.phasesContainer.innerHTML = plan.phases.map(phase => `
      <div class="phase-card" data-phase="${phase.number}">
        <div class="phase-header">
          <span class="phase-number">${phase.number}</span>
          <span class="phase-name">${escapeHtml(phase.name)}</span>
        </div>
        <div class="phase-description markdown-content">${parseMarkdown(phase.description)}</div>
        ${phase.tasks && phase.tasks.length > 0 ? `
          <div class="phase-tasks">
            <div class="phase-tasks-title">Tasks</div>
            <ul class="phase-tasks-list">
              ${phase.tasks.map(task => `<li>${parseMarkdown(task)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <div class="phase-criteria">
          ${phase.successCriteria && phase.successCriteria.automated && phase.successCriteria.automated.length > 0 ? `
            <div class="criteria-section">
              <div class="criteria-title">Automated Verification</div>
              <ul class="criteria-list">
                ${phase.successCriteria.automated.map(c => `<li>${parseMarkdown(c)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${phase.successCriteria && phase.successCriteria.manual && phase.successCriteria.manual.length > 0 ? `
            <div class="criteria-section">
              <div class="criteria-title">Manual Verification</div>
              <ul class="criteria-list">
                ${phase.successCriteria.manual.map(c => `<li>${parseMarkdown(c)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        ${phase.implementationNotes ? `
          <div class="phase-notes markdown-content">
            <strong>Implementation Note:</strong> ${parseMarkdown(phase.implementationNotes)}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // Render testing strategy
  function renderTestingStrategy() {
    const ts = plan.testingStrategy;
    const sections = [];

    if (ts.unit && ts.unit.length > 0) {
      sections.push(`
        <div class="testing-section">
          <h4>Unit Tests</h4>
          <ul class="plan-list">
            ${ts.unit.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      `);
    }

    if (ts.integration && ts.integration.length > 0) {
      sections.push(`
        <div class="testing-section">
          <h4>Integration Tests</h4>
          <ul class="plan-list">
            ${ts.integration.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      `);
    }

    if (ts.manual && ts.manual.length > 0) {
      sections.push(`
        <div class="testing-section">
          <h4>Manual Testing</h4>
          <ul class="plan-list">
            ${ts.manual.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      `);
    }

    if (sections.length > 0) {
      elements.testingBlock.style.display = 'block';
      elements.testingContent.innerHTML = sections.join('');
    }
  }

  // Setup phase selection checkboxes
  function setupPhaseCheckboxes() {
    if (plan.phases.length <= 1) {
      elements.phaseSelectionBlock.style.display = 'none';
      return;
    }

    elements.phaseCheckboxes.innerHTML = plan.phases.map(phase => `
      <label class="checkbox-item">
        <input type="checkbox" name="phases" value="${phase.number}" checked>
        <span>Phase ${phase.number}: ${escapeHtml(phase.name)}</span>
      </label>
    `).join('');
  }

  // Setup event listeners
  function setupEventListeners() {
    // Submit button
    elements.submitBtn.addEventListener('click', handleSubmit);

    // Cancel button
    elements.cancelBtn.addEventListener('click', handleCancel);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }

      // Escape to cancel
      if (e.key === 'Escape') {
        handleCancel();
      }
    });
  }

  // Handle form submission
  async function handleSubmit() {
    const decision = document.querySelector('input[name="decision"]:checked')?.value || 'approve';
    
    const selectedPhases = Array.from(document.querySelectorAll('input[name="phases"]:checked'))
      .map(cb => parseInt(cb.value, 10));
    
    // If no phases selected, use all phases
    const phases = selectedPhases.length > 0 ? selectedPhases : plan.phases.map(p => p.number);

    const requirements = Array.from(document.querySelectorAll('input[name="requirements"]:checked'))
      .map(cb => cb.value);

    const constraints = Array.from(document.querySelectorAll('input[name="constraints"]:checked'))
      .map(cb => cb.value);

    const result = {
      decision,
      selectedPhases: phases,
      priority: elements.prioritySelect.value,
      approach: elements.approachSelect.value,
      requirements,
      constraints,
      notes: elements.notesTextarea.value.trim(),
    };

    try {
      const response = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      if (response.ok) {
        showOverlay('success');
        stopTimers();
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  }

  // Handle cancel
  async function handleCancel() {
    try {
      await fetch('/cancel', { method: 'POST' });
      showOverlay('cancel');
      stopTimers();
    } catch (err) {
      console.error('Cancel error:', err);
    }
  }

  // Show overlay
  function showOverlay(type) {
    if (type === 'success') {
      elements.successOverlay.classList.remove('hidden');
    } else {
      elements.cancelOverlay.classList.remove('hidden');
    }
  }

  // Heartbeat to keep server alive
  function startHeartbeat() {
    heartbeatInterval = setInterval(async () => {
      try {
        await fetch('/heartbeat');
      } catch (err) {
        // Server might be gone
      }
    }, 10000);
  }

  function stopTimers() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  // Utility: Escape HTML
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Start the app
  init();
})();
