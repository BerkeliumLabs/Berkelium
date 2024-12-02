import * as fs from 'fs';
import { DataFrame } from './dataframe';
import { DataReader } from '../util/datareader';

describe('DataFrame', () => {
    let result: Array<object>;
    let df: DataFrame;

    beforeEach(() => {
        const dataReader = new DataReader();
        const csvData = fs.readFileSync('./data/sample_data.csv', 'utf-8');
        result = dataReader.readCSV(csvData);
        df = new DataFrame(result);
    });

    it('Should create a DataFrame object', () => {
        expect(df).toBeTruthy();
    });
    it('Should display the first 5 rows of the DataFrame', () => {
        console.table(df.head());
        expect(df.head()).toEqual(result.slice(0, 5));
    });
    it('Should display the last 5 rows of the DataFrame', () => {
        console.table(df.tail());
        expect(df.tail()).toEqual(result.slice(-5));
    });
    it('Should display the shape of the DataFrame', () => {
        expect(df.shape()).toEqual([30, 5]);
    });
});