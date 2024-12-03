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
    it('Should display the column headers of the DataFrame', () => {
        expect(df.columns()).toEqual(['Name', 'City', 'Age', 'Monthly Income', 'Date of Birth']);
    });
    it('Should display the info of the DataFrame', () => {
        df.info();
    });
    it('Should display the count of non-null values in a column', () => {
        expect(df.count('Monthly Income')).toEqual(25);
    });
    it('Should calculate the mean of a numeric column', () => {
        expect(df.mean('Monthly Income')).toEqual(63480);
    });
    it('Should calculate the standard deviation of a numeric column', () => {
        expect(df.std('Monthly Income')).toEqual(15006.985040);
    });
});