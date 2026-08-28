import { describe, expect, it } from 'vitest';
import { isAppData, linkedPanelCount, makeProject, normalizePanels } from '../src/model';

describe('continuity board model', () => {
  it('starts a useful four-panel board', () => {
    const project = makeProject(' Lantern Run ', 'A courier finds the truth.');
    expect(project.name).toBe('Lantern Run');
    expect(project.panels).toHaveLength(4);
    expect(project.panels.map((panel) => panel.number)).toEqual([1, 2, 3, 4]);
  });

  it('counts only panels linked to a reference', () => {
    const project = makeProject('Linked proof');
    project.panels[0].referenceIds = ['ref-1'];
    project.panels[2].referenceIds = ['ref-1', 'ref-2'];
    expect(linkedPanelCount(project)).toBe(2);
  });

  it('renumbers panels after removal and rejects malformed imports', () => {
    const project = makeProject('Renumber');
    project.panels.splice(1, 1);
    project.panels.push({ ...project.panels[0], id: 'another', number: 9 });
    expect(normalizePanels(project).panels.map((panel) => panel.number)).toEqual([1, 2, 3, 4]);
    expect(isAppData({ version: 1, activeProjectId: '', projects: [{ id: 'bad' }] })).toBe(false);
  });
});
