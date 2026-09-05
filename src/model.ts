export type Reference = {
  id: string;
  name: string;
  role: string;
  image?: string;
  imageName?: string;
  attribution: string;
  attributes: string[];
};

export type Prop = { id: string; name: string; details: string; checked: boolean };

export type Panel = {
  id: string;
  number: number;
  shot: string;
  action: string;
  continuity: string;
  referenceIds: string[];
  propIds: string[];
};

export type Project = {
  id: string;
  name: string;
  logline: string;
  createdAt: string;
  updatedAt: string;
  references: Reference[];
  props: Prop[];
  panels: Panel[];
};

export type AppData = { version: 1; activeProjectId: string; projects: Project[] };

export const id = () => crypto.randomUUID();

export function makePanel(number: number): Panel {
  return { id: id(), number, shot: '', action: '', continuity: '', referenceIds: [], propIds: [] };
}

export function makeProject(name: string, logline = ''): Project {
  const now = new Date().toISOString();
  return {
    id: id(), name: name.trim() || 'Untitled story', logline: logline.trim(), createdAt: now, updatedAt: now,
    references: [], props: [], panels: Array.from({ length: 4 }, (_, index) => makePanel(index + 1))
  };
}

export function normalizePanels(project: Project): Project {
  project.panels = project.panels.map((panel, index) => ({ ...panel, number: index + 1 }));
  return project;
}

export function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<AppData>;
  if (item.version !== 1 || typeof item.activeProjectId !== 'string' || !Array.isArray(item.projects)) return false;
  if (item.projects.length && !item.projects.some((project) => project.id === item.activeProjectId)) return false;
  return item.projects.every((project) => project && typeof project.id === 'string' && typeof project.name === 'string' &&
    typeof project.logline === 'string' && typeof project.createdAt === 'string' && typeof project.updatedAt === 'string' &&
    Array.isArray(project.references) && project.references.every((reference) => reference && typeof reference.id === 'string' &&
      typeof reference.name === 'string' && typeof reference.role === 'string' && typeof reference.attribution === 'string' &&
      Array.isArray(reference.attributes) && reference.attributes.every((attribute) => typeof attribute === 'string') &&
      (reference.image === undefined || /^data:image\/(?:png|jpeg|webp);base64,/.test(reference.image))) &&
    Array.isArray(project.props) && project.props.every((prop) => prop && typeof prop.id === 'string' && typeof prop.name === 'string' && typeof prop.details === 'string' && typeof prop.checked === 'boolean') &&
    Array.isArray(project.panels) && project.panels.length >= 4 && project.panels.length <= 12 && project.panels.every((panel) => panel &&
      typeof panel.id === 'string' && typeof panel.number === 'number' && typeof panel.shot === 'string' && typeof panel.action === 'string' &&
      typeof panel.continuity === 'string' && Array.isArray(panel.referenceIds) && panel.referenceIds.every((refId) => typeof refId === 'string') &&
      Array.isArray(panel.propIds) && panel.propIds.every((propId) => typeof propId === 'string')));
}

export function linkedPanelCount(project: Project): number {
  return project.panels.filter((panel) => panel.referenceIds.length > 0).length;
}

export function makeSampleData(): AppData {
  const references: Reference[] = [
    {
      id: 'demo-ref-mara',
      name: 'Mara Vale',
      role: 'Courier',
      attribution: 'Original character notes for the sample story',
      attributes: ['Teal coat with brass buttons', 'Short dark curls', 'Red cord holds the brass key']
    },
    {
      id: 'demo-ref-station',
      name: 'North Gate station',
      role: 'Location',
      attribution: 'Original location notes for the sample story',
      attributes: ['Green tile wall', 'Clock stopped at 8:17', 'Platform sign has a chipped corner']
    }
  ];
  const props: Prop[] = [
    { id: 'demo-prop-key', name: 'Brass key', details: 'Starts on Mara’s red cord; ends in Ivo’s hand.', checked: true },
    { id: 'demo-prop-ticket', name: 'Blue ticket', details: 'Folded once before panel 3.', checked: true },
    { id: 'demo-prop-bag', name: 'Canvas bag', details: 'Stays on Mara’s left shoulder.', checked: false }
  ];
  const panels: Panel[] = [
    {
      id: 'demo-panel-1', number: 1, shot: 'Wide view', action: 'Mara waits alone under the stopped station clock.',
      continuity: 'Bag on left shoulder. Key visible against the teal coat.', referenceIds: ['demo-ref-mara', 'demo-ref-station'], propIds: ['demo-prop-key', 'demo-prop-bag']
    },
    {
      id: 'demo-panel-2', number: 2, shot: 'Close-up', action: 'She compares the brass key with the number on her ticket.',
      continuity: 'Ticket is still flat. Red cord crosses the second coat button.', referenceIds: ['demo-ref-mara'], propIds: ['demo-prop-key', 'demo-prop-ticket']
    },
    {
      id: 'demo-panel-3', number: 3, shot: 'Over Mara’s shoulder', action: 'Ivo reaches across the chipped platform sign for the key.',
      continuity: 'Ticket is now folded once. Mara still holds the key.', referenceIds: ['demo-ref-mara', 'demo-ref-station'], propIds: ['demo-prop-key', 'demo-prop-ticket']
    },
    {
      id: 'demo-panel-4', number: 4, shot: 'Medium two-shot', action: 'Ivo holds the key while Mara watches the arriving train.',
      continuity: 'Key has changed hands. Bag remains on Mara’s left shoulder.', referenceIds: ['demo-ref-mara', 'demo-ref-station'], propIds: ['demo-prop-key', 'demo-prop-bag']
    }
  ];
  const project: Project = {
    id: 'demo-project-lantern',
    name: 'The Lantern Exchange',
    logline: 'A courier discovers that the handoff key opens the wrong station locker.',
    createdAt: '2026-09-05T12:00:00.000Z',
    updatedAt: '2026-09-05T12:00:00.000Z',
    references,
    props,
    panels
  };
  return { version: 1, activeProjectId: project.id, projects: [project] };
}
