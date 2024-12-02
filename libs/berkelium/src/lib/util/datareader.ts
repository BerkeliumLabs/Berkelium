export class DataReader {
    /**
     * Parses a CSV formatted string into an array of objects.
     * Each object represents a row in the CSV data, with keys derived from the header row.
     * 
     * @param {string} csvData - The CSV data as a string.
     * @param {string} [delimiter=','] - The delimiter used to separate values in the CSV data.
     * @returns {Array<object>} An array of objects where each object corresponds to a row in the CSV data.
     */
    readCSV(csvData: string, delimiter = ',') {
        // Split the data into rows
        const rows = csvData.trim().split("\n");

        // Extract the header row
        const headers = rows[0].split(delimiter).map(header => header.trim());

        // Convert the remaining rows to objects
        const data = rows.slice(1).map(row => {
            const values = row.split(delimiter).map(value => value.trim());
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return headers.reduce((obj: any, header: string, index: number) => {
                obj[header] = values[index];
                return obj;
            }, {});
        });

        return data;
    }
}