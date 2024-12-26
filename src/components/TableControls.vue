<template>
  <div class="controls">
    <button @click="switchMode">
      {{ isEditMode ? 'Перейти в просмотр' : 'Перейти в редактирование' }}
    </button>

    <template v-if="isEditMode">
        <svg @click="$emit('undo')" style="margin-right: 15px; cursor: pointer" xmlns="http://www.w3.org/2000/svg" fill="#000000" width="25px" height="25px" viewBox="0 0 16 16">
          <path class="cls-1" d="M6,3.6V0L0,6l6,6V8c6-.27,7.53,3.76,7.88,5.77a.27.27,0,0,0,.53,0C17.08,2.86,6,3.6,6,3.6Z"/>
        </svg>
        <svg @click="$emit('redo')" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer" fill="#000000" width="25px" height="25px" viewBox="0 0 16 16">
          <path class="cls-1" d="M16,6,10,0V3.6S-1.08,2.86,1.59,13.78a.27.27,0,0,0,.53,0c.35-2,1.9-6,7.88-5.77v4Z"/>
        </svg>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TableControls',
  props: {
    isEditMode: {
      type: Boolean,
      required: true
    },
    canUndo: {
      type: Boolean,
      default: true
    },
    canRedo: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:is-edit-mode', 'undo', 'redo'],
  setup(props, { emit }) {
    function switchMode() {
      emit('update:is-edit-mode', !props.isEditMode)
    }

    return {
      switchMode
    }
  }
})
</script>

<style scoped>
.controls {
  margin-bottom: 1rem;
}
button {
  margin-right: 8px;
}
</style>
