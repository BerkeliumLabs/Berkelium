/* eslint-disable @typescript-eslint/no-explicit-any */
export class DataReader {
  /**
   * Parses a CSV formatted string into a column-oriented object.
   *
   * @param {string} csvData - The CSV data as a string.
   * @param {string} [delimiter=','] - The delimiter used to separate values in the CSV data.
   * @returns {{ [column: string]: any[] }} A column-oriented object representing the CSV data.
   */
  readCSV(csvData: string, delimiter = ','): { [column: string]: any[] } {
    const rows = csvData.trim().split('\n');
    const headers = rows[0].split(delimiter).map((header) => header.trim());

    const data: { [column: string]: any[] } = {};
    headers.forEach((header) => {
      data[header] = [];
    });

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(delimiter).map((value) => value.trim());
      headers.forEach((header, index) => {
        data[header].push(values[index]);
      });
    }

    return this.transformDataTypes(data);
  }

  /**
   * Converts string values in the data to their appropriate data types.
   * Detects and transforms strings to number, boolean, null, undefined, Date, object, or other types.
   *
   * @param {{ [column: string]: any[] }} data - Column-oriented object representing the data.
   * @returns {{ [column: string]: any[] }} - Transformed data with inferred types.
   */
  private transformDataTypes(data: { [column: string]: any[] }): {
    [column: string]: any[];
  } {
    const transformedData: { [column: string]: any[] } = {};
    for (const column in data) {
      transformedData[column] = data[column].map((value) =>
        this.inferType(value)
      );
    }
    return transformedData;
  }

  /**
   * Infers and converts a value to its appropriate type.
   *
   * @param {string} value - The value to transform.
   * @returns {*} - The value converted to its appropriate type.
   */
  private inferType(value: string): any {
    if (value === null || value === undefined || value === '') return undefined;

    const lowerValue = value.toLowerCase();
    if (
      lowerValue === 'null' ||
      lowerValue === 'undefined' ||
      lowerValue === 'nan' ||
      lowerValue === 'na'
    )
      return undefined;
    if (lowerValue === 'true') return true;
    if (lowerValue === 'false') return false;

    if (!isNaN(Number(value))) return Number(value);

    if (/^\d+n$/.test(value)) return BigInt(value.slice(0, -1));

    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') return parsed;
    } catch {
      // Not a valid JSON string
    }

    return value;
  }
}
