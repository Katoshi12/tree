<template>
  <div class="category-cell">
    <span>{{ category }}</span>
    <template v-if="isEditMode">
      <button @click="addChild" style="margin-left: 10px;">+</button>
      <button @click="removeItem" style="margin-left: 5px;">x</button>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ActionButtons',
  props: {
    node: {
      type: Object,
      required: true,
    },
    isEditMode: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['add-child', 'remove-item'],
  setup(props, { emit }) {
    const category = props.node.data?.hasChildren ? 'Группа' : 'Элемент'
    console.log(category)

    function addChild() {
      emit('add-child', props.node.data)
    }

    function removeItem() {
      emit('remove-item', props.node.data)
    }

    return {
      category,
      addChild,
      removeItem,
    }
  },
})
</script>

<style scoped>
.category-cell {
  display: flex;
  align-items: center;
}
button {
  cursor: pointer;
  padding: 2px 5px;
}
</style>
