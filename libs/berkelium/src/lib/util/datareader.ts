export class DataReader {
  /**
   * Parses a CSV formatted string into an array of objects.
   * Each object represents a row in the CSV data, with keys derived from the header row.
   *
   * @param {string} csvData - The CSV data as a string.
   * @param {string} [delimiter=','] - The delimiter used to separate values in the CSV data.
   * @returns {Map<string, any>[]} An array of objects where each object corresponds to a row in the CSV data.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readCSV(csvData: string, delimiter = ','): Map<string, any>[] {
    // Split the data into rows
    const rows = csvData.trim().split('\n');

    // Extract the header row
    const headers = rows[0].split(delimiter).map((header) => header.trim());

    // Convert the remaining rows to objects
    const data = rows.slice(1).map((row) => {
      const values = row.split(delimiter).map((value) => value.trim());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return headers.reduce((obj: Map<string, any>, header: string, index: number) => {
        obj.set(header, values[index]);
        return obj;
      }, new Map());
    });

    const transformedData = this.transformDataTypes(data);

    return transformedData;
  }

  /**
   * Converts string values in the data to their appropriate data types.
   * Detects and transforms strings to number, boolean, null, undefined, Date, object, or other types.
   * @param {Map<string, any>[]} data - Array of objects representing the data.
   * @returns {Map<string, any>[]} - Transformed data with inferred types.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformDataTypes(data: Map<string, any>[]): Map<string, any>[] {
    return data.map((row) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedRow: Map<string, any> = new Map();
      row.forEach((value: any, key: string) => {
        transformedRow.set(key, this.inferType(value));
      });
      return transformedRow;
    });
  }

  /**
   * Infers and converts a value to its appropriate type.
   * @param {string} value - The value to transform.
   * @returns {*} - The value converted to its appropriate type.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private inferType(value: string): any {
    if (value === null || value === undefined || value === '') return undefined; // Keep null, undefined, or empty strings

    const lowerValue = value.toLowerCase();
    if (lowerValue === 'null' || lowerValue === 'undefined' || lowerValue === 'nan' || lowerValue === 'na') return undefined;
    if (lowerValue === 'true') return true;
    if (lowerValue === 'false') return false;

    // Try to parse as number
    if (!isNaN(Number(value))) return Number(value);

    // Try to parse as BigInt
    if (/^\d+n$/.test(value)) return BigInt(value.slice(0, -1));

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') return parsed;
    } catch {
      // Not a valid JSON string
    }

    return value;
  }
}
