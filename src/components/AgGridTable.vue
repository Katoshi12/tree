<template>
  <ag-grid-vue
    ref="gridRef"
    :rowData="rowData"
    :columnDefs="columnDefs"
    :treeData="true"
    :getDataPath="getDataPath"
    :groupDefaultExpanded="groupDefaultExpanded"
    :gridOptions="gridOptions"
    style="width: 100%; height: 600px"
    class="ag-theme-alpine"
    @grid-ready="onGridReady"
    @cell-value-changed="onCellValueChanged"
    @cell-clicked="onCellClicked"
  />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { ITreeItem } from '@/interfaces/ITreeItem';

export default defineComponent({
  name: 'TreeAgGrid',
  components: { AgGridVue },
  props: {
    treeStore: {
      type: Object,
      required: true,
    },
    isEditMode: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['commit-change'],
  setup(props, { emit }) {
    const gridRef = ref<InstanceType<typeof AgGridVue> | null>(null);
    const rowData = ref<ITreeItem[]>(props.treeStore.getAll());

    const getDataPath = (data: ITreeItem) => {
      const path: string[] = [];
      let current = data;
      while (current) {
        path.unshift(current.label);
        current = props.treeStore.getItem(current.parent as string | number);
      }
      return path.length ? path : ['root']; // Убеждаемся, что путь не пустой
    };

    const columnDefs = ref([
      {
        headerName: '№ п/п',
        valueGetter: (params: any) => {
          const rowIndex = params.node.rowIndex;
          return rowIndex !== undefined ? rowIndex + 1 : '';
        },
      },
      {
        headerName: 'Категория',
        valueGetter: (params: any) => {
          const hasChildren = props.treeStore.getChildren(params.data.id).length > 0;
          return hasChildren ? 'Группа' : 'Элемент';
        },
        cellRenderer: 'agGroupCellRenderer',
      },
      {
        headerName: 'Наименование',
        field: 'label',
        editable: () => props.isEditMode,
      },
      {
        headerName: 'Действия',
        cellRenderer: (params: any) => {
          if (!props.isEditMode) return '';
          return `
            <button data-action="addChild" style="margin-right:4px;">+</button>
            <button data-action="remove">x</button>
          `;
        },
      },
    ]);

    const groupDefaultExpanded = -1;
    const gridOptions = {
      autoGroupColumnDef: {
        headerName: '',
        width: 0,
        suppressSizeToFit: true,
        hide: false,
      },
    };

    function onGridReady(params: any) {
      gridRef.value = params.api;
    }

    function onCellValueChanged(event: any) {
      const updatedItem = { ...event.data, label: event.newValue };
      props.treeStore.updateItem(updatedItem);
      emit('commit-change');
    }

    function onCellClicked(event: any) {
      const action = event.event.target.dataset.action;
      if (!action) return;

      const clickedItem = event.data;
      if (action === 'addChild') {
        props.treeStore.addItem({
          id: Date.now(),
          parent: clickedItem.id,
          label: 'Новый элемент',
        });
      } else if (action === 'remove') {
        props.treeStore.removeItem(clickedItem.id);
      }
      rowData.value = props.treeStore.getAll();
      emit('commit-change');
    }

    watch(
      () => props.treeStore.getAll(),
      (newData) => {
        rowData.value = newData;
        gridRef.value?.setRowData(newData); // Обновляем данные в таблице
      },
      { deep: true }
    );

    return {
      gridRef,
      rowData,
      columnDefs,
      getDataPath,
      groupDefaultExpanded,
      gridOptions,
      onGridReady,
      onCellValueChanged,
      onCellClicked,
    };
  },
});
</script>

<style scoped>
button {
  margin: 2px;
  padding: 2px 5px;
  cursor: pointer;
}
</style>
