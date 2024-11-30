export class DataReader {
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