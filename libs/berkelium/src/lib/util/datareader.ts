export class DataReader {
  /**
   * Parses a CSV formatted string into an array of objects.
   * Each object represents a row in the CSV data, with keys derived from the header row.
   *
   * @param {string} csvData - The CSV data as a string.
   * @param {string} [delimiter=','] - The delimiter used to separate values in the CSV data.
   * @returns {Array<object>} An array of objects where each object corresponds to a row in the CSV data.
   */
  readCSV(csvData: string, delimiter = ','): Array<object> {
    // Split the data into rows
    const rows = csvData.trim().split('\n');

    // Extract the header row
    const headers = rows[0].split(delimiter).map((header) => header.trim());

    // Convert the remaining rows to objects
    const data = rows.slice(1).map((row) => {
      const values = row.split(delimiter).map((value) => value.trim());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return headers.reduce((obj: any, header: string, index: number) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });

    const transformedData = this.transformDataTypes(data);

    return transformedData;
  }

  /**
   * Converts string values in the data to their appropriate data types.
   * Detects and transforms strings to number, boolean, null, undefined, Date, object, or other types.
   * @param {Array<Object>} data - Array of objects representing the data.
   * @returns {Array<Object>} - Transformed data with inferred types.
   */
  private transformDataTypes(data: string[]): Array<object> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((row: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedRow: { [key: string]: any } = {};
      Object.keys(row).forEach((key: string) => {
        transformedRow[key] = this.inferType(row[key]);
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
    if (value === null || value === undefined || value === '') return value; // Keep null, undefined, or empty strings

    if (value.toLowerCase() === 'null') return null;
    if (value.toLowerCase() === 'undefined') return undefined;
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Try to parse as number
    if (!isNaN(Number(value))) return Number(value);

    // Try to parse as BigInt
    if (/^\d+n$/.test(value)) return BigInt(value.slice(0, -1));

    // Try to parse as Date
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;

    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') return parsed;
    } catch {
      // Not a valid JSON string
    }

    return value;
  }
}
