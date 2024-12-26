import { ITreeItem } from '@/interfaces/ITreeItem'

export class TreeStore {
  private itemsMap = new Map<string | number, ITreeItem>()
  private childrenMap = new Map<string | number, Set<string | number>>()

  constructor(items: ITreeItem[]) {
    this.buildStore(items)
  }

  private buildStore(items: ITreeItem[]) {
    items.forEach((item) => {
      this.itemsMap.set(item.id, item)
      if (!this.childrenMap.has(item.id)) {
        this.childrenMap.set(item.id, new Set())
      }
    })

    items.forEach((item) => {
      const parentId = item.parent
      if (parentId !== null) {
        if (!this.childrenMap.has(parentId)) {
          this.childrenMap.set(parentId, new Set())
        }
        this.childrenMap.get(parentId)?.add(item.id)
      }
    })
  }

  /**
   * Возвращает все элементы хранилища в виде массива
   */
  public getAll(): ITreeItem[] {
    return Array.from(this.itemsMap.values())
  }

  /**
   * Возвращает конкретный элемент по id
   */
  public getItem(id: string | number): ITreeItem | undefined {
    return this.itemsMap.get(id)
  }

  /**
   * Возвращает прямых детей элемента по id
   */
  public getChildren(id: string | number): ITreeItem[] {
    const childrenIds = this.childrenMap.get(id)
    if (!childrenIds) return []
    return Array.from(childrenIds).map((childId) => this.itemsMap.get(childId)!)
  }

  /**
   * Возвращает всех потомков (многоуровневый обход)
   */
  public getAllChildren(id: string | number): ITreeItem[] {
    const result: ITreeItem[] = []
    const stack = [...this.getChildren(id)]

    while (stack.length) {
      const current = stack.pop()!
      result.push(current)
      const children = this.getChildren(current.id)
      for (const child of children) {
        stack.push(child)
      }
    }

    return result
  }

  /**
   * Возвращает всех родителей (цепочку наверх)
   */
  public getAllParents(id: string | number): ITreeItem[] {
    const path: ITreeItem[] = []
    let current = this.itemsMap.get(id)
    while (current) {
      path.push(current)
      if (current.parent === null) {
        break
      }
      current = this.itemsMap.get(current.parent as string | number)
    }
    return path
  }

  /**
   * Добавляет новый элемент. Если элемент с таким label уже есть,
   * показываем alert и ничего не добавляем
   */
  public addItem(item: ITreeItem): void {
    // 1. Проверяем дублирование по label во всём хранилище
    const duplicate = Array.from(this.itemsMap.values()).find(
      (x) => x.label === item.label
    )
    if (duplicate) {
      alert(`Дубликация по label! Элемент с наименованием "${item.label}" уже существует.`)
      return
    }

    // 2. Добавляем айтем в itemsMap
    this.itemsMap.set(item.id, item)
    if (!this.childrenMap.has(item.id)) {
      this.childrenMap.set(item.id, new Set())
    }

    // 3. Привязываем к родителю
    if (item.parent !== null) {
      if (!this.childrenMap.has(item.parent)) {
        this.childrenMap.set(item.parent, new Set())
      }
      this.childrenMap.get(item.parent)?.add(item.id)
    }
  }

  /**
   * Удаляет элемент и всех его потомков
   */
  public removeItem(id: string | number): void {
    const allChildren = this.getAllChildren(id)
    for (const child of allChildren) {
      this.itemsMap.delete(child.id)
      this.childrenMap.delete(child.id)
    }

    // Удаляем сам элемент
    const item = this.itemsMap.get(id)
    if (item) {
      if (item.parent !== null) {
        this.childrenMap.get(item.parent)?.delete(id)
      }
    }
    this.itemsMap.delete(id)
    this.childrenMap.delete(id)
  }


  public updateItem(newItem: ITreeItem): void {
    const oldItem = this.itemsMap.get(newItem.id)
    if (!oldItem) return

    if (oldItem.parent !== newItem.parent) {
      if (oldItem.parent !== null) {
        this.childrenMap.get(oldItem.parent)?.delete(oldItem.id)
      }
      if (newItem.parent !== null) {
        if (!this.childrenMap.has(newItem.parent)) {
          this.childrenMap.set(newItem.parent, new Set())
        }
        this.childrenMap.get(newItem.parent)?.add(newItem.id)
      }
    }

    this.itemsMap.set(newItem.id, newItem)
  }

  /**
   * Очищает все данные в хранилище (например, для undo/redo)
   */
  public clear(): void {
    this.itemsMap.clear()
    this.childrenMap.clear()
  }
}
