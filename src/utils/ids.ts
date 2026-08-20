let nextId = Date.now();

export function generateId(): number {
    return nextId++;
}