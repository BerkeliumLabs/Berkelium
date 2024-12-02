export class DataFrame {
    private data: Array<object>;

    /**
   * Creates a DataFrame object.
   * @param {Array<Object>} data - Array of objects where keys are column names.
   */
    constructor(data: Array<object>) {
        this.data = data;
    }

    /**
   * Displays the first n rows of the DataFrame.
   * @param {number} n - Number of rows to display (default: 5).
   * @returns {Array<Object>} - The first n rows.
   */
    head(n = 5): Array<object> {
        return this.data.slice(0, n);
    }

    /**
     * Prints the entire DataFrame to the console in a tabular format.
     */
    print(): void {
        console.table(this.data);
    }
}