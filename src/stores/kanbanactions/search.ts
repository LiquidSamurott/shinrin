import type { KanbanStoreContext } from "../context";

export function setSearch(
    this: KanbanStoreContext,
    value: string
) {
    this.search = value;
}

export function toggleFavoritesOnly(
    this: KanbanStoreContext
) {
    this.favoritesOnly =
        !this.favoritesOnly;
}