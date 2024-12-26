import { reactive } from 'vue'
import { TreeStore } from '@/classes/TreeStore'
import { ITreeItem } from '@/interfaces/ITreeItem'

interface HistoryState {
  snapshot: ITreeItem[]
}

export const historyStore = reactive({
  past: [] as HistoryState[],
  present: null as HistoryState | null,
  future: [] as HistoryState[],

  init(treeStore: TreeStore) {
    this.past = []
    this.future = []
    this.present = {
      snapshot: treeStore.getAll()
    }
  },

  pushNewState(treeStore: TreeStore) {
    if (this.present) {
      this.past.push(this.present)
    }
    this.present = {
      snapshot: treeStore.getAll()
    }
    this.future = []
  },

  undo(treeStore: TreeStore) {
    if (this.past.length === 0) return
    if (this.present) {
      this.future.unshift(this.present)
    }
    const state = this.past.pop()!
    this.present = state
    // Восстанавливаем состояние в TreeStore
    restoreTreeStore(treeStore, state.snapshot)
  },

  redo(treeStore: TreeStore) {
    if (this.future.length === 0) return
    if (this.present) {
      this.past.push(this.present)
    }
    const state = this.future.shift()!
    this.present = state
    restoreTreeStore(treeStore, state.snapshot)
  }
})

function restoreTreeStore(treeStore: TreeStore, snapshot: ITreeItem[]) {
  snapshotAllIds(treeStore).forEach((id) => treeStore.removeItem(id))
  snapshot.forEach((item) => treeStore.addItem({ ...item }))
}

function snapshotAllIds(treeStore: TreeStore) {
  return treeStore.getAll().map((item) => item.id)
}
