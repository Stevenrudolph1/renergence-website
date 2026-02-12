/**
 * Encounter Surface - Client-side logic
 * Handles form submission, API calls, and rendering encounter responses
 */

(function () {
  const API_BASE = 'https://mcp.xavigate.com';

  const form = document.getElementById('encounter-form');
  const textarea = document.getElementById('encounter-textarea');
  const errorDiv = document.getElementById('encounter-error');
  const inputSection = document.getElementById('encounter-input');
  const loadingSection = document.getElementById('encounter-loading');
  const resultSection = document.getElementById('encounter-result');
  const resultContent = document.getElementById('encounter-result-content');

  // Form submission
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const situation = textarea.value.trim();

    // Basic validation
    if (situation.length < 20) {
      showError('Please describe your situation in at least a few sentences.');
      return;
    }

    if (situation.length > 2000) {
      showError('Please keep your description under 2000 characters.');
      return;
    }

    // Hide input, show loading
    hideError();
    inputSection.style.display = 'none';
    loadingSection.style.display = 'block';

    try {
      // Call API
      const response = await fetch(`${API_BASE}/api/encounter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ situation }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("You've used this a few times recently. Come back in an hour.");
        }
        throw new Error('Something went wrong. Try again.');
      }

      const data = await response.json();

      // Hide loading, show result
      loadingSection.style.display = 'none';
      resultSection.style.display = 'block';

      // Set dynamic accent color
      if (data.area_color) {
        document.documentElement.style.setProperty('--encounter-accent', data.area_color);
      }

      // Render based on response type
      if (data.safety_redirect) {
        renderSafetyResult(data);
      } else if (!data.detected) {
        renderNotDetected(data);
      } else if (data.rhetorical_mode === 'reflection') {
        renderReflectionResult(data);
      } else {
        renderQuestionLedResult(data);
      }
    } catch (error) {
      // Hide loading, show error
      loadingSection.style.display = 'none';
      inputSection.style.display = 'block';
      showError(error.message || 'Something went wrong. Try again.');
    }
  });

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  function hideError() {
    errorDiv.style.display = 'none';
  }

  // Reset to input state
  function renderResetLink() {
    const resetLink = document.createElement('a');
    resetLink.href = '#';
    resetLink.className = 'encounter-reset';
    resetLink.textContent = 'Describe something else';
    resetLink.addEventListener('click', function (e) {
      e.preventDefault();
      resultSection.style.display = 'none';
      inputSection.style.display = 'block';
      textarea.value = '';
      resultContent.innerHTML = '';
    });
    return resetLink;
  }

  // Safety redirect rendering
  function renderSafetyResult(data) {
    const html = `
      <div class="encounter-safety">
        <h2 style="font-family: var(--font-serif); font-size: 1.75rem; margin-bottom: 1.5rem; line-height: 1.3;">
          This goes beyond what I can help with
        </h2>
        <div style="line-height: 1.7; white-space: pre-line;">
          ${data.safety_message}
        </div>
      </div>
    `;
    resultContent.innerHTML = html;
    resultContent.appendChild(renderResetLink());
  }

  // Not detected rendering
  function renderNotDetected(data) {
    const html = `
      <div class="encounter-not-detected">
        <h2 class="encounter-reframe-headline">${data.reframe.headline}</h2>
        <p class="encounter-reframe-body">${data.reframe.body}</p>
        <div class="encounter-next" style="margin-top: 2rem;">
          <strong>Next step:</strong> ${data.next_step.text}
        </div>
      </div>
    `;
    resultContent.innerHTML = html;
    resultContent.appendChild(renderResetLink());
  }

  // Reflection mode rendering (high confidence)
  function renderReflectionResult(data) {
    let html = `<div class="encounter-accent-bar"></div>`;

    // Headline + body
    html += `
      <h2 class="encounter-reframe-headline">${data.reframe.headline}</h2>
      <p class="encounter-reframe-body">${data.reframe.body}</p>
    `;

    // Personalization error callout
    if (data.reframe.personalization_error?.detected) {
      html += `
        <div class="encounter-callout">
          ${data.reframe.personalization_error.message}
        </div>
      `;
    }

    // Observations
    if (data.observations && data.observations.length > 0) {
      html += `
        <div class="encounter-section-label" style="margin-top: 2rem; font-weight: var(--weight-semibold); font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.75rem;">What I'm noticing</div>
        <ul class="encounter-observations">
          ${data.observations.map(obs => `<li>${obs}</li>`).join('')}
        </ul>
      `;
    }

    // Distinguishing question
    if (data.distinguishing_question) {
      html += `
        <div class="encounter-question">
          ${data.distinguishing_question}
        </div>
      `;
    }

    // Next step
    if (data.next_step) {
      html += `<div class="encounter-next">`;
      html += `<strong>Next step:</strong> ${data.next_step.text}`;
      if (data.next_step.book_title && data.next_step.book_url) {
        html += ` <a href="${data.next_step.book_url}" style="color: var(--encounter-accent); text-decoration: underline;">${data.next_step.book_title}</a>`;
      }
      html += `</div>`;
    }

    resultContent.innerHTML = html;
    resultContent.appendChild(renderResetLink());
  }

  // Question-led mode rendering (moderate/low confidence)
  function renderQuestionLedResult(data) {
    let html = `<div class="encounter-accent-bar"></div>`;

    // Distinguishing question first
    if (data.distinguishing_question) {
      html += `
        <div class="encounter-question" style="margin-bottom: 1.5rem;">
          ${data.distinguishing_question}
        </div>
      `;
    }

    // Observations
    if (data.observations && data.observations.length > 0) {
      html += `
        <div class="encounter-section-label" style="font-weight: var(--weight-semibold); font-size: var(--text-sm); text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.75rem;">What I'm noticing</div>
        <ul class="encounter-observations">
          ${data.observations.map(obs => `<li>${obs}</li>`).join('')}
        </ul>
      `;
    }

    // Headline + body
    html += `
      <h2 class="encounter-reframe-headline" style="margin-top: 1.5rem;">${data.reframe.headline}</h2>
      <p class="encounter-reframe-body">${data.reframe.body}</p>
    `;

    // Personalization error callout
    if (data.reframe.personalization_error?.detected) {
      html += `
        <div class="encounter-callout">
          ${data.reframe.personalization_error.message}
        </div>
      `;
    }

    // Next step
    if (data.next_step) {
      html += `<div class="encounter-next">`;
      html += `<strong>Next step:</strong> ${data.next_step.text}`;
      if (data.next_step.book_title && data.next_step.book_url) {
        html += ` <a href="${data.next_step.book_url}" style="color: var(--encounter-accent); text-decoration: underline;">${data.next_step.book_title}</a>`;
      }
      html += `</div>`;
    }

    resultContent.innerHTML = html;
    resultContent.appendChild(renderResetLink());
  }

  // Animated dots for "Listening..."
  if (loadingSection) {
    const dots = loadingSection.querySelector('.dots');
    if (dots) {
      let count = 0;
      setInterval(() => {
        count = (count + 1) % 4;
        dots.textContent = '.'.repeat(count);
      }, 500);
    }
  }
})();
