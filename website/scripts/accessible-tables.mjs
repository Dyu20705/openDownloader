import { visit } from 'unist-util-visit';

// Starlight tables scroll at narrow widths; keyboard users need a focus target.
export default function accessibleTables() {
  return tree => {
    visit(tree, 'element', node => {
      if (node.tagName !== 'table') return;
      node.properties ??= {};
      node.properties.tabIndex = 0;
      node.properties.ariaLabel = 'Reference table; scroll horizontally for additional columns';
    });
  };
}
