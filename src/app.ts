import './styles.css';
import { CHECKOUT_URL, cachedUnlock, captureLicense, restoreLicense, verifyLicense } from './license';
import { id, isAppData, linkedPanelCount, makePanel, makeProject, normalizePanels, type AppData, type Panel, type Project, type Reference } from './model';
import { loadData, saveData } from './storage';

const root = document.querySelector<HTMLDivElement>('#app')!;
let data: AppData = { version: 1, activeProjectId: '', projects: [] };
let unlocked = cachedUnlock();
let saveQueue: Promise<void> = Promise.resolve();
let saveRevision = 0;

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
const activeProject = () => data.projects.find((project) => project.id === data.activeProjectId);

function announce(message: string, error = false) {
  const status = document.querySelector<HTMLElement>('#save-status');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-error', error);
}

function scheduleSave(message = 'Saved locally') {
  const project = activeProject();
  if (project) project.updatedAt = new Date().toISOString();
  const snapshot = structuredClone(data);
  const revision = ++saveRevision;
  announce('Saving…');
  saveQueue = saveQueue.catch(() => undefined).then(() => saveData(snapshot));
  void saveQueue.then(
    () => { if (revision === saveRevision) announce(message); },
    () => { if (revision === saveRevision) announce('Could not save. Export a backup and check browser storage.', true); }
  );
}

function button(label: string, action: string, className = 'button secondary') {
  return `<button class="${className}" type="button" data-action="${action}">${label}</button>`;
}

function renderReference(reference: Reference, project: Project) {
  const linked = project.panels.filter((panel) => panel.referenceIds.includes(reference.id)).length;
  const image = reference.image
    ? `<img src="${escapeHtml(reference.image)}" alt="User-created reference for ${escapeHtml(reference.name)}" width="480" height="360" />`
    : `<div class="reference-placeholder" aria-hidden="true"><span>REF</span></div>`;
  const attributes = reference.attributes.length
    ? `<ul class="attribute-list">${reference.attributes.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '<p class="muted">No locked details yet.</p>';
  return `<article class="reference-card" data-enter>
    <div class="reference-art">${image}<span class="user-label">User-created reference</span></div>
    <div class="card-copy">
      <p class="eyebrow">${escapeHtml(reference.role || 'Character / place')}</p>
      <h3>${escapeHtml(reference.name)}</h3>
      ${attributes}
      <p class="attribution"><strong>Source / credit:</strong> ${escapeHtml(reference.attribution || 'Not supplied')}</p>
      <p class="usage-count">Linked in ${linked} ${linked === 1 ? 'panel' : 'panels'}</p>
      <div class="card-actions">
        <button class="text-button" type="button" data-action="edit-reference" data-id="${reference.id}">Edit reference</button>
        <button class="text-button danger" type="button" data-action="delete-reference" data-id="${reference.id}">Remove</button>
      </div>
    </div>
  </article>`;
}

function renderPanel(panel: Panel, project: Project) {
  const refs = panel.referenceIds.map((refId) => project.references.find((ref) => ref.id === refId)?.name).filter(Boolean);
  const props = panel.propIds.map((propId) => project.props.find((prop) => prop.id === propId)?.name).filter(Boolean);
  return `<article class="panel-card ${refs.length ? 'is-linked' : 'needs-link'}" data-enter>
    <div class="panel-number" aria-label="Panel ${panel.number}"><span>${String(panel.number).padStart(2, '0')}</span></div>
    <div class="panel-copy">
      <p class="eyebrow">${escapeHtml(panel.shot || 'Shot not set')}</p>
      <h3>${escapeHtml(panel.action || 'Describe the panel action')}</h3>
      ${panel.continuity ? `<p>${escapeHtml(panel.continuity)}</p>` : '<p class="muted">No continuity note yet.</p>'}
      <div class="link-row" aria-label="Linked continuity">
        ${refs.length ? refs.map((name) => `<span class="chip ref-chip">${escapeHtml(name!)}</span>`).join('') : '<span class="chip warning-chip">Needs a reference</span>'}
        ${props.map((name) => `<span class="chip prop-chip">${escapeHtml(name!)}</span>`).join('')}
      </div>
      <div class="card-actions">
        <button class="text-button" type="button" data-action="edit-panel" data-id="${panel.id}">Edit shot</button>
        ${panel.number > 1 ? `<button class="text-button" type="button" data-action="move-panel-up" data-id="${panel.id}">Move earlier</button>` : ''}
        ${panel.number < project.panels.length ? `<button class="text-button" type="button" data-action="move-panel-down" data-id="${panel.id}">Move later</button>` : ''}
        ${project.panels.length > 4 ? `<button class="text-button danger" type="button" data-action="delete-panel" data-id="${panel.id}">Remove</button>` : ''}
      </div>
    </div>
  </article>`;
}

function renderEmpty() {
  return `<main id="main" class="empty-layout" tabindex="-1">
    <section class="empty-copy" aria-labelledby="welcome-title">
      <p class="kicker">Continuity before the first line</p>
      <h2 id="welcome-title">Keep the coat, key, and camera angle straight.</h2>
      <p>Collect your own references, lock the details that matter, and connect every shot before anyone starts drawing.</p>
      <button class="button primary" type="button" data-action="new-project">Start a four-panel board</button>
      <p class="privacy-note">No account. Images and notes stay in this browser unless you export them.</p>
    </section>
    <figure class="hero-art">
      <img src="/assets/continuity-desk.webp" alt="Risograph collage of invented reference cutouts, a key, and four storyboard frames" width="960" height="640" fetchpriority="high" />
      <figcaption>A planning still, printed in three imperfect inks.</figcaption>
    </figure>
  </main>`;
}

function renderBoard(project: Project) {
  const linked = linkedPanelCount(project);
  const complete = linked === project.panels.length;
  return `<main id="main" class="board-shell" tabindex="-1">
    <aside class="project-rail" aria-label="Projects">
      <div>
        <p class="rail-label">Your projects</p>
        <nav aria-label="Project list"><ul>${data.projects.map((item) => `<li><button type="button" data-action="switch-project" data-id="${item.id}" ${item.id === project.id ? 'aria-current="page"' : ''}><span>${escapeHtml(item.name)}</span><small>${item.panels.length} shots</small></button></li>`).join('')}</ul></nav>
      </div>
      <div class="rail-actions">
        ${button('New project', 'new-project', 'button secondary full')}
        ${unlocked ? button('Duplicate project', 'duplicate-project', 'text-button') : `<button class="text-button" type="button" data-action="open-unlock">Duplicate with Studio</button>`}
        <button class="text-button danger" type="button" data-action="delete-project">Delete project</button>
      </div>
    </aside>
    <div class="board">
      <header class="project-heading">
        <div><p class="kicker">Continuity proof · ${project.panels.length} shots</p><h2>${escapeHtml(project.name)}</h2><p>${escapeHtml(project.logline || 'Add a short story note so everyone draws toward the same beat.')}</p></div>
        <button class="button secondary" type="button" data-action="edit-project">Edit project</button>
      </header>
      <section class="continuity-meter ${complete ? 'is-complete' : ''}" aria-labelledby="coverage-title">
        <div><p class="eyebrow" id="coverage-title">Reference coverage</p><strong>${linked} of ${project.panels.length} shots linked</strong></div>
        <progress class="meter" max="${project.panels.length}" value="${linked}" aria-label="Panels linked to a reference">${linked} of ${project.panels.length}</progress>
        <p>${complete ? 'Every shot has a visual anchor. This sheet is ready to hand off.' : 'Link at least one reference to each shot before export.'}</p>
      </section>
      <section class="board-section references" aria-labelledby="references-title">
        <div class="section-heading"><div><p class="section-number">A</p><h2 id="references-title">Reference locks</h2><p>Characters, places, and objects whose appearance must not drift.</p></div>${button('Add reference', 'add-reference', 'button cyan')}</div>
        ${project.references.length ? `<div class="reference-grid">${project.references.map((reference) => renderReference(reference, project)).join('')}</div>` : `<div class="section-empty"><div class="empty-mark" aria-hidden="true">A</div><div><h3>Give the story a visual anchor.</h3><p>Add your own image, credit its source, and name details that must survive each redraw.</p>${button('Add first reference', 'add-reference', 'text-button')}</div></div>`}
      </section>
      <section class="board-section props" aria-labelledby="props-title">
        <div class="section-heading"><div><p class="section-number">B</p><h2 id="props-title">Prop ledger</h2><p>A tactile checklist for what enters, changes, or leaves the scene.</p></div>${button('Add prop', 'add-prop', 'button mustard')}</div>
        ${project.props.length ? `<ul class="prop-list">${project.props.map((prop) => `<li class="${prop.checked ? 'is-checked' : ''}"><label><input type="checkbox" data-action="toggle-prop" data-id="${prop.id}" ${prop.checked ? 'checked' : ''}/><span><strong>${escapeHtml(prop.name)}</strong>${prop.details ? `<small>${escapeHtml(prop.details)}</small>` : ''}</span></label><div><button class="text-button" type="button" data-action="edit-prop" data-id="${prop.id}">Edit</button><button class="text-button danger" type="button" data-action="delete-prop" data-id="${prop.id}">Remove</button></div></li>`).join('')}</ul>` : '<p class="section-empty-line">No tracked props yet. Add only the objects that matter between shots.</p>'}
      </section>
      <section class="board-section panels" aria-labelledby="panels-title">
        <div class="section-heading"><div><p class="section-number">C</p><h2 id="panels-title">Shot strip</h2><p>Order the intent, then link the proof.</p></div>${project.panels.length < 12 ? button(project.panels.length >= 4 && !unlocked ? 'Add shots with Studio' : 'Add shot', project.panels.length >= 4 && !unlocked ? 'open-unlock' : 'add-panel', 'button tomato') : '<span class="limit-note">12-shot limit</span>'}</div>
        <div class="panel-grid">${project.panels.map((panel) => renderPanel(panel, project)).join('')}</div>
      </section>
    </div>
  </main>`;
}

function dialogs() {
  return `<dialog id="project-dialog"><form method="dialog" id="project-form"><div class="dialog-heading"><p class="kicker">Story card</p><h2 id="project-dialog-title">New project</h2></div><input type="hidden" name="projectId" /><label>Project name<input name="name" required maxlength="70" autocomplete="off" /></label><label>One-line story intent<textarea name="logline" maxlength="180" rows="3"></textarea></label><div class="dialog-actions"><button class="button secondary" value="cancel">Cancel</button><button class="button primary" value="save">Save project</button></div></form></dialog>
  <dialog id="reference-dialog"><form method="dialog" id="reference-form"><div class="dialog-heading"><p class="kicker">Visual anchor</p><h2 id="reference-dialog-title">Add reference</h2></div><input type="hidden" name="referenceId"/><div class="form-grid"><label>Name<input name="name" required maxlength="70" autocomplete="off" /></label><label>Role or kind<input name="role" maxlength="60" autocomplete="off" placeholder="Character, location, object…" /></label></div><label>Reference image <span class="optional">optional · stored locally</span><input name="image" type="file" accept="image/png,image/jpeg,image/webp"/><small class="field-help" id="image-help">PNG, JPEG, or WebP up to 4 MB. Choose a new file to replace the current image.</small></label><label>Source / attribution<input name="attribution" maxlength="180" autocomplete="off" placeholder="Made by me, photo by…, public domain…" /><small class="field-help">Printed and exported with this board.</small></label><label>Locked attributes <span class="optional">one per line</span><textarea name="attributes" rows="5" maxlength="500" placeholder="Teal coat with brass buttons&#10;Scar above left eyebrow&#10;Always carries the folding map"></textarea></label><p class="form-error" id="reference-error" role="alert"></p><div class="dialog-actions"><button class="button secondary" value="cancel">Cancel</button><button class="button cyan" value="save">Save reference</button></div></form></dialog>
  <dialog id="prop-dialog"><form method="dialog" id="prop-form"><div class="dialog-heading"><p class="kicker">Continuity object</p><h2 id="prop-dialog-title">Add prop</h2></div><input type="hidden" name="propId"/><label>Prop name<input name="name" required maxlength="70" autocomplete="off"/></label><label>Continuity note<textarea name="details" rows="3" maxlength="180" placeholder="Where it starts, how it changes, who holds it…"></textarea></label><div class="dialog-actions"><button class="button secondary" value="cancel">Cancel</button><button class="button mustard" value="save">Save prop</button></div></form></dialog>
  <dialog id="panel-dialog"><form method="dialog" id="panel-form"><div class="dialog-heading"><p class="kicker">Shot card</p><h2 id="panel-dialog-title">Edit panel</h2></div><input type="hidden" name="panelId"/><label>Shot / framing<input name="shot" maxlength="70" autocomplete="off" placeholder="Wide establishing, over-shoulder…"/></label><label>Action or panel intent<textarea name="action" rows="3" maxlength="240" placeholder="What changes in this beat?"></textarea></label><label>Continuity note<textarea name="continuity" rows="3" maxlength="240" placeholder="What must match the prior or next shot?"></textarea></label><fieldset><legend>Link references <span class="optional">at least one recommended</span></legend><div id="panel-reference-options" class="check-options"></div></fieldset><fieldset><legend>Props in this shot</legend><div id="panel-prop-options" class="check-options"></div></fieldset><div class="dialog-actions"><button class="button secondary" value="cancel">Cancel</button><button class="button tomato" value="save">Save shot</button></div></form></dialog>
  <dialog id="unlock-dialog"><form method="dialog" id="unlock-form"><button class="dialog-close" type="button" data-action="close-unlock" aria-label="Close Studio unlock">×</button><div class="unlock-stamp" aria-hidden="true">12</div><div class="dialog-heading"><p class="kicker">One-time Studio unlock</p><h2>Let the short story breathe.</h2><p>Pay $12 once to expand every local project from 4 to 12 shots and duplicate project structures. Your core JSON backup and print/PDF export always stay free.</p></div><a class="button primary full" href="${CHECKOUT_URL}">Buy Studio for $12</a><div class="restore"><label>Have a license? Paste it here<input name="license" autocomplete="off" required/></label><button class="button secondary full" value="restore">Restore purchase</button><p id="license-status" role="status"></p></div><p class="legal-line">Hosted checkout by Sociobot / Dodo, the merchant of record. Refunds revoke the license. <a href="/terms/">Terms</a> · <a href="/privacy/">Privacy</a></p></form></dialog>
  <input id="import-input" class="visually-hidden" type="file" accept="application/json,.json" aria-label="Choose Continuity Board backup" />`;
}

function render() {
  const project = activeProject();
  root.innerHTML = `<header class="masthead"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true">CB</span><span><h1>Continuity Board</h1><small>Local reference & shot planner</small></span></a><div class="masthead-actions"><span id="network-state" class="network-state">${navigator.onLine ? 'Local-first' : 'Offline · local changes work'}</span>${project ? `<button class="text-button" type="button" data-action="export-json">Export backup</button><button class="text-button" type="button" data-action="import-json">Import</button><button class="button primary print-button" type="button" data-action="print">Print / PDF</button>` : '<button class="text-button" type="button" data-action="import-json">Import board</button>'}<button class="studio-button ${unlocked ? 'is-unlocked' : ''}" type="button" data-action="open-unlock">${unlocked ? 'Studio unlocked' : 'Studio · $12 once'}</button></div></header>${project ? renderBoard(project) : renderEmpty()}<footer><p>Made for original stories. Your files stay on this device.</p><nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><span>Original generated illustration</span></nav></footer><div class="status-dock"><span id="save-status" role="status" aria-live="polite">${project ? 'Saved locally' : 'Ready'}</span></div><div id="toast" class="toast" role="status" aria-live="polite" hidden></div>${dialogs()}`;
  bindForms();
}

function showDialog(idValue: string) {
  const dialog = document.querySelector<HTMLDialogElement>(`#${idValue}`)!;
  dialog.showModal();
}

function bindForms() {
  const projectForm = document.querySelector<HTMLFormElement>('#project-form')!;
  projectForm.addEventListener('submit', (event) => {
    const submitter = (event as SubmitEvent).submitter as HTMLButtonElement;
    if (submitter.value !== 'save') return;
    event.preventDefault();
    const form = new FormData(projectForm);
    const projectId = String(form.get('projectId') || '');
    const name = String(form.get('name') || '').trim();
    if (!name) { projectForm.reportValidity(); return; }
    const existing = data.projects.find((project) => project.id === projectId);
    if (existing) { existing.name = name; existing.logline = String(form.get('logline') || '').trim(); }
    else { const project = makeProject(name, String(form.get('logline') || '')); data.projects.push(project); data.activeProjectId = project.id; }
    (projectForm.closest('dialog') as HTMLDialogElement).close(); render(); scheduleSave();
  });

  const referenceForm = document.querySelector<HTMLFormElement>('#reference-form')!;
  referenceForm.addEventListener('submit', async (event) => {
    const submitter = (event as SubmitEvent).submitter as HTMLButtonElement;
    if (submitter.value !== 'save') return;
    event.preventDefault();
    const project = activeProject(); if (!project) return;
    const form = new FormData(referenceForm);
    const file = form.get('image') as File;
    const error = document.querySelector<HTMLElement>('#reference-error')!;
    if (file?.size > 4_000_000) { error.textContent = 'That image is over 4 MB. Compress it, then try again.'; return; }
    if (file?.size && !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { error.textContent = 'Use a PNG, JPEG, or WebP image.'; return; }
    const referenceId = String(form.get('referenceId') || '');
    const existing = project.references.find((reference) => reference.id === referenceId);
    const image = file?.size ? await readFile(file) : existing?.image;
    const reference: Reference = { id: existing?.id || id(), name: String(form.get('name')).trim(), role: String(form.get('role')).trim(), attribution: String(form.get('attribution')).trim(), attributes: String(form.get('attributes')).split('\n').map((item) => item.trim()).filter(Boolean), image, imageName: file?.size ? file.name : existing?.imageName };
    if (existing) Object.assign(existing, reference); else project.references.push(reference);
    (referenceForm.closest('dialog') as HTMLDialogElement).close(); render(); scheduleSave();
  });

  const propForm = document.querySelector<HTMLFormElement>('#prop-form')!;
  propForm.addEventListener('submit', (event) => {
    const submitter = (event as SubmitEvent).submitter as HTMLButtonElement;
    if (submitter.value !== 'save') return;
    event.preventDefault(); const project = activeProject(); if (!project) return;
    const form = new FormData(propForm); const propId = String(form.get('propId') || ''); const existing = project.props.find((prop) => prop.id === propId);
    const prop = { id: existing?.id || id(), name: String(form.get('name')).trim(), details: String(form.get('details')).trim(), checked: existing?.checked || false };
    if (existing) Object.assign(existing, prop); else project.props.push(prop);
    (propForm.closest('dialog') as HTMLDialogElement).close(); render(); scheduleSave();
  });

  const panelForm = document.querySelector<HTMLFormElement>('#panel-form')!;
  panelForm.addEventListener('submit', (event) => {
    const submitter = (event as SubmitEvent).submitter as HTMLButtonElement; if (submitter.value !== 'save') return;
    event.preventDefault(); const project = activeProject(); if (!project) return; const form = new FormData(panelForm);
    const panel = project.panels.find((item) => item.id === String(form.get('panelId'))); if (!panel) return;
    panel.shot = String(form.get('shot')).trim(); panel.action = String(form.get('action')).trim(); panel.continuity = String(form.get('continuity')).trim(); panel.referenceIds = form.getAll('referenceIds').map(String); panel.propIds = form.getAll('propIds').map(String);
    (panelForm.closest('dialog') as HTMLDialogElement).close(); render(); scheduleSave();
  });

  const unlockForm = document.querySelector<HTMLFormElement>('#unlock-form')!;
  unlockForm.addEventListener('submit', async (event) => {
    const submitter = (event as SubmitEvent).submitter as HTMLButtonElement; if (submitter.value !== 'restore') return;
    event.preventDefault(); const token = new FormData(unlockForm).get('license'); const status = document.querySelector<HTMLElement>('#license-status')!;
    status.textContent = 'Checking license…';
    try { unlocked = await restoreLicense(String(token)); status.textContent = unlocked ? 'Studio unlocked on this device.' : 'That license is not active for Continuity Board.'; if (unlocked) window.setTimeout(() => { (unlockForm.closest('dialog') as HTMLDialogElement).close(); render(); }, 650); }
    catch { status.textContent = 'Could not reach the license service. Check your connection and try again.'; }
  });

  document.querySelector<HTMLInputElement>('#import-input')!.addEventListener('change', importJson);
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); });
}

function openProjectForm(project?: Project) {
  const form = document.querySelector<HTMLFormElement>('#project-form')!; form.reset();
  (form.elements.namedItem('projectId') as HTMLInputElement).value = project?.id || '';
  (form.elements.namedItem('name') as HTMLInputElement).value = project?.name || '';
  (form.elements.namedItem('logline') as HTMLTextAreaElement).value = project?.logline || '';
  document.querySelector('#project-dialog-title')!.textContent = project ? 'Edit project' : 'New project'; showDialog('project-dialog');
}

function openReferenceForm(reference?: Reference) {
  const form = document.querySelector<HTMLFormElement>('#reference-form')!; form.reset();
  (form.elements.namedItem('referenceId') as HTMLInputElement).value = reference?.id || '';
  (form.elements.namedItem('name') as HTMLInputElement).value = reference?.name || '';
  (form.elements.namedItem('role') as HTMLInputElement).value = reference?.role || '';
  (form.elements.namedItem('attribution') as HTMLInputElement).value = reference?.attribution || '';
  (form.elements.namedItem('attributes') as HTMLTextAreaElement).value = reference?.attributes.join('\n') || '';
  document.querySelector('#reference-dialog-title')!.textContent = reference ? 'Edit reference' : 'Add reference'; showDialog('reference-dialog');
}

function openPropForm(propId?: string) {
  const project = activeProject(); const prop = project?.props.find((item) => item.id === propId); const form = document.querySelector<HTMLFormElement>('#prop-form')!; form.reset();
  (form.elements.namedItem('propId') as HTMLInputElement).value = prop?.id || '';
  (form.elements.namedItem('name') as HTMLInputElement).value = prop?.name || '';
  (form.elements.namedItem('details') as HTMLTextAreaElement).value = prop?.details || '';
  document.querySelector('#prop-dialog-title')!.textContent = prop ? 'Edit prop' : 'Add prop'; showDialog('prop-dialog');
}

function openPanelForm(panel: Panel) {
  const project = activeProject()!; const form = document.querySelector<HTMLFormElement>('#panel-form')!; form.reset();
  (form.elements.namedItem('panelId') as HTMLInputElement).value = panel.id;
  (form.elements.namedItem('shot') as HTMLInputElement).value = panel.shot;
  (form.elements.namedItem('action') as HTMLTextAreaElement).value = panel.action;
  (form.elements.namedItem('continuity') as HTMLTextAreaElement).value = panel.continuity;
  document.querySelector('#panel-dialog-title')!.textContent = `Edit panel ${panel.number}`;
  document.querySelector('#panel-reference-options')!.innerHTML = project.references.length ? project.references.map((reference) => `<label><input type="checkbox" name="referenceIds" value="${reference.id}" ${panel.referenceIds.includes(reference.id) ? 'checked' : ''}/><span>${escapeHtml(reference.name)}</span></label>`).join('') : '<p>Add a reference first, then return to link it.</p>';
  document.querySelector('#panel-prop-options')!.innerHTML = project.props.length ? project.props.map((prop) => `<label><input type="checkbox" name="propIds" value="${prop.id}" ${panel.propIds.includes(prop.id) ? 'checked' : ''}/><span>${escapeHtml(prop.name)}</span></label>`).join('') : '<p>No props are tracked yet.</p>';
  showDialog('panel-dialog');
}

async function importJson(event: Event) {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
  try { const parsed: unknown = JSON.parse(await file.text()); if (!isAppData(parsed)) throw new Error('shape'); data = parsed; await saveData(data); render(); announce(`Imported ${data.projects.length} project${data.projects.length === 1 ? '' : 's'}`); }
  catch { announce('That file is not a valid Continuity Board backup.', true); }
  input.value = '';
}

function exportJson() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = `continuity-board-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); announce('Backup exported');
}

root.addEventListener('click', (event) => {
  const control = (event.target as HTMLElement).closest<HTMLElement>('[data-action]'); if (!control) return; const action = control.dataset.action; const project = activeProject();
  if (action === 'new-project') openProjectForm();
  if (action === 'edit-project' && project) openProjectForm(project);
  if (action === 'switch-project') { data.activeProjectId = control.dataset.id!; render(); scheduleSave(); }
  if (action === 'delete-project' && project && confirm(`Delete “${project.name}” and all of its local references and shots? Export a backup first if you may need it.`)) { data.projects = data.projects.filter((item) => item.id !== project.id); data.activeProjectId = data.projects[0]?.id || ''; render(); scheduleSave('Project deleted'); }
  if (action === 'add-reference') openReferenceForm();
  if (action === 'edit-reference' && project) openReferenceForm(project.references.find((reference) => reference.id === control.dataset.id));
  if (action === 'delete-reference' && project) { const ref = project.references.find((item) => item.id === control.dataset.id); if (ref && confirm(`Remove “${ref.name}”? It will be unlinked from every panel.`)) { project.references = project.references.filter((item) => item.id !== ref.id); project.panels.forEach((panel) => panel.referenceIds = panel.referenceIds.filter((item) => item !== ref.id)); render(); scheduleSave(); } }
  if (action === 'add-prop') openPropForm();
  if (action === 'edit-prop') openPropForm(control.dataset.id);
  if (action === 'delete-prop' && project) { const prop = project.props.find((item) => item.id === control.dataset.id); if (prop && confirm(`Remove “${prop.name}”? It will be unlinked from every shot.`)) { project.props = project.props.filter((item) => item.id !== prop.id); project.panels.forEach((panel) => panel.propIds = panel.propIds.filter((item) => item !== prop.id)); render(); scheduleSave(); } }
  if (action === 'toggle-prop' && project) { const prop = project.props.find((item) => item.id === control.dataset.id); if (prop) { prop.checked = (control as HTMLInputElement).checked; scheduleSave(); control.closest('li')?.classList.toggle('is-checked', prop.checked); } }
  if (action === 'edit-panel' && project) { const panel = project.panels.find((item) => item.id === control.dataset.id); if (panel) openPanelForm(panel); }
  if (action === 'add-panel' && project && project.panels.length < 12) { project.panels.push(makePanel(project.panels.length + 1)); render(); scheduleSave(); }
  if ((action === 'move-panel-up' || action === 'move-panel-down') && project) { const index = project.panels.findIndex((item) => item.id === control.dataset.id); const target = action === 'move-panel-up' ? index - 1 : index + 1; if (index >= 0 && target >= 0 && target < project.panels.length) { [project.panels[index], project.panels[target]] = [project.panels[target], project.panels[index]]; normalizePanels(project); render(); scheduleSave('Shot order updated'); } }
  if (action === 'delete-panel' && project) { const panel = project.panels.find((item) => item.id === control.dataset.id); if (panel && project.panels.length > 4 && confirm(`Remove panel ${panel.number}?`)) { project.panels = project.panels.filter((item) => item.id !== panel.id); normalizePanels(project); render(); scheduleSave(); } }
  if (action === 'open-unlock') showDialog('unlock-dialog');
  if (action === 'close-unlock') document.querySelector<HTMLDialogElement>('#unlock-dialog')?.close();
  if (action === 'duplicate-project' && project && unlocked) { const duplicate = structuredClone(project); duplicate.id = id(); duplicate.name = `${project.name} copy`; duplicate.createdAt = duplicate.updatedAt = new Date().toISOString(); duplicate.references.forEach((item) => item.id = id()); duplicate.props.forEach((item) => item.id = id()); duplicate.panels.forEach((item) => { item.id = id(); item.referenceIds = []; item.propIds = []; }); data.projects.push(duplicate); data.activeProjectId = duplicate.id; render(); scheduleSave('Project duplicated'); }
  if (action === 'export-json') exportJson();
  if (action === 'import-json') document.querySelector<HTMLInputElement>('#import-input')!.click();
  if (action === 'print') window.print();
});

function setNetworkState() {
  const state = document.querySelector<HTMLElement>('#network-state'); if (state) state.textContent = navigator.onLine ? 'Local-first' : 'Offline · local changes work';
}
window.addEventListener('online', setNetworkState); window.addEventListener('offline', setNetworkState);

async function start() {
  const token = captureLicense(); unlocked = cachedUnlock(); render(); registerServiceWorker();
  let storageWarning = '';
  let hasStoredData = false;
  try { const stored = await loadData(); if (stored && isAppData(stored)) { data = stored; hasStoredData = true; } else if (stored) storageWarning = 'Stored board data was unreadable. Import a valid backup to recover it.'; }
  catch { root.innerHTML = '<main id="main" class="fatal-state"><h1>Continuity Board</h1><h2>Local storage is unavailable.</h2><p>Allow site storage or leave private browsing, then reload.</p><button class="button primary" onclick="location.reload()">Reload</button></main>'; return; }
  if (hasStoredData) render(); if (storageWarning) announce(storageWarning, true);
  if (token && navigator.onLine) verifyLicense(token).then((valid) => { if (valid !== unlocked) { unlocked = valid; render(); if (!valid) announce('License no longer active. The free board is still available.', true); } }).catch(() => undefined);
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  let reloadForAcceptedUpdate = false;
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) { const toast = document.querySelector<HTMLElement>('#toast')!; toast.hidden = false; toast.innerHTML = 'A fresh proof is ready. <button type="button">Update now</button>'; toast.querySelector('button')!.addEventListener('click', () => { reloadForAcceptedUpdate = true; worker.postMessage('SKIP_WAITING'); }); } }); });
  }).catch(() => undefined);
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloadForAcceptedUpdate) location.reload(); });
}

start();
