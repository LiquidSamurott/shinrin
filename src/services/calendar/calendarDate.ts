export function toLocalDateTime(date: Date): string {
  const year = date.getFullYear();

  const month =
    String(date.getMonth() + 1).padStart(2, "0");

  const day =
    String(date.getDate()).padStart(2, "0");

  const hour =
    String(date.getHours()).padStart(2, "0");

  const minute =
    String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function fromLocalDateTime(
  value: string
): Date {

  const [date, time] = value.split("T");

  const [y, m, d] =
    date.split("-").map(Number);

  const [h, min] =
    time.split(":").map(Number);

  return new Date(
    y,
    m - 1,
    d,
    h,
    min,
    0,
    0
  );
}