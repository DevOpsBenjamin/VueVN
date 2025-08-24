# TODO: File Tree Explorer Improvements

## Current Status ✅
- Custom FileTree.vue and FileTreeNode.vue components created
- @he-tree/vue dependency removed successfully  
- Basic file/folder navigation working
- Selected file highlighting implemented
- Expandable directories with SVG icons

## Future Enhancements

### Priority 1 - Essential Features
- [ ] **Context Menu**: Right-click menu for files/folders
  - New File/Folder
  - Rename
  - Delete
  - Copy/Paste

- [ ] **Drag & Drop**: Reorder and move files between directories
  - File to folder drag support
  - Visual feedback during drag operations
  - Prevent invalid drops

- [ ] **Keyboard Navigation**: 
  - Arrow keys for navigation
  - Enter to open files
  - Delete key for file removal
  - F2 for rename

### Priority 2 - Enhanced UX
- [ ] **File Type Icons**: Different icons for .ts, .vue, .json, etc.
- [ ] **Search/Filter**: Quick file search within tree
- [ ] **Breadcrumb Navigation**: Show current path
- [ ] **Collapsible Sections**: Remember expanded/collapsed state

### Priority 3 - Advanced Features  
- [ ] **File Watcher**: Auto-refresh tree when files change externally
- [ ] **Multiple Selection**: Ctrl+Click for multi-select operations
- [ ] **Git Integration**: Show git status indicators (modified, staged, etc.)
- [ ] **Virtual Scrolling**: Performance for large project trees

### Priority 4 - Developer Experience
- [ ] **File Templates**: Quick create from templates
- [ ] **Syntax Validation**: Visual indicators for TypeScript errors
- [ ] **Project Structure Validation**: Warn about missing required files
- [ ] **Auto-organization**: Suggest better file organization

## Technical Implementation Notes

### Context Menu Implementation
```vue
<!-- Example context menu structure -->
<div v-if="showContextMenu" class="context-menu">
  <div @click="createFile">New File</div>
  <div @click="createFolder">New Folder</div>
  <div @click="rename">Rename</div>
  <div @click="delete">Delete</div>
</div>
```

### Drag & Drop API
- Use HTML5 Drag & Drop API
- Implement `ondragstart`, `ondragover`, `ondrop` handlers
- Visual feedback with CSS classes during drag operations

### File Type Detection
```typescript
const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch(ext) {
    case 'ts': return 'typescript-icon';
    case 'vue': return 'vue-icon';
    case 'json': return 'json-icon';
    default: return 'file-icon';
  }
}
```

## Dependencies Needed
- None! Keep it dependency-free like current implementation
- All features can be implemented with Vue 3 built-ins + CSS

## Estimated Effort
- **Priority 1**: 1-2 days development
- **Priority 2**: 1 day development  
- **Priority 3**: 2-3 days development
- **Priority 4**: 1-2 days development

**Total**: ~1 week for full-featured file tree explorer

---
**Created**: 23 August 2025  
**Last Updated**: 23 August 2025