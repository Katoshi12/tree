<template>
  <div>
    <!-- Компонент управления -->
    <TableControls
      :isEditMode="isEditMode"
      @update:is-edit-mode="val => isEditMode = val"
      @undo="undoAction"
      @redo="redoAction"
    />

    <!-- Таблица -->
    <TreeAgGrid
      :tree-store="treeStore"
      :is-edit-mode="isEditMode"
      @commit-change="onCommitChange"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from 'vue'
import TableControls from '@/components/TableControls.vue'
import TreeAgGrid from '@/components/AgGridTable.vue'
import { TreeStore } from '@/services/TreeStore'
import { ITreeItem } from '@/interfaces/ITreeItem'

export default defineComponent({
  name: 'App',
  components: { TableControls, TreeAgGrid },
  setup() {
    const treeStore = new TreeStore([
      { id: 1, parent: null, label: 'Айтем 1' },
      { id: 2, parent: 1, label: 'Айтем 2' },
      { id: 3, parent: 1, label: 'Айтем 3' },
    ])

    const isEditMode = ref(false)
    const rowData = ref<ITreeItem[]>(treeStore.getAll())

    const history = reactive({
      past: [] as ITreeItem[][],
      present: treeStore.getAll(),
      future: [] as ITreeItem[][],
    })

    const canUndo = computed(() => history.past.length > 0)
    const canRedo = computed(() => history.future.length > 0)

    function onCommitChange() {
      history.past.push([...history.present])
      history.present = treeStore.getAll()
      history.future = []
      rowData.value = history.present // Синхронизация данных
    }

    function undoAction() {
      if (!canUndo.value) return;
      history.future.unshift([...history.present]);
      const previous = history.past.pop();
      if (!previous) return;

      restore(previous);
      history.present = previous;
      rowData.value = treeStore.getAll();
    }


    function redoAction() {
      if (!canRedo.value) return
      history.past.push([...history.present])
      const next = history.future.shift()!
      restore(next)
      history.present = next
    }

    function restore(snapshot: ITreeItem[]) {
      treeStore.clear();
      snapshot.forEach((item) => treeStore.addItem(item));
    }


    return {
      treeStore,
      isEditMode,
      canUndo,
      canRedo,
      onCommitChange,
      undoAction,
      redoAction,
    }
  },
})
</script>
