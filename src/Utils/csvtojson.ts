const csvToJson = (csvString: string): Record<string, string>[] => {
  const rows = csvString.split('\n');
  if (rows.length === 0) {
    return []; // Handle empty string case
  }
  
  // The first row is the header
  const headers: string[] = rows[0].split(',').map(header => header.trim());

  const jsonData: Record<string, string>[] = [];

  // Iterate over rows starting from the second one (index 1)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].trim();
    if (row === '') {
      continue; // Skip empty rows that might occur due to trailing newlines
    }
    
    const values: string[] = row.split(',').map(value => value.trim());

    // Check for data consistency
    if (values.length !== headers.length) {
      console.warn(`Skipping row ${i + 1} ('${row}') due to inconsistent number of values (${values.length} vs ${headers.length}).`);
      continue;
    }

    const obj: Record<string, string> = {};
    // Map values to headers
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j];
    }
    jsonData.push(obj);
  }

  return jsonData;
};


export default csvToJson