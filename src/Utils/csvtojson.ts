const csvToJson = (csvString: string): Record<string, string>[] => {
  const rows = csvString.split('\n').filter(r => r.trim() !== '');

  if (rows.length === 0) return [];

  // Safe header extraction
  const firstRow = rows[0];
  if (!firstRow) return [];

  const headers = firstRow.split(',').map(h => h.trim());

  const jsonData: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const values = row.split(',').map(v => v.trim());

    if (values.length !== headers.length) {
      console.warn(
        `Skipping row ${i + 1} ('${row}') due to inconsistent number of values (${values.length} vs ${headers.length}).`
      );
      continue;
    }

    const obj: Record<string, string> = {};

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      if (!header) continue;

      obj[header] = values[j] ?? '';
    }

    jsonData.push(obj);
  }

  return jsonData;
};

export default csvToJson