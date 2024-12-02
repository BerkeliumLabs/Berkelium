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
        expect(df.head()).toEqual(result.slice(0, 5));
    })
});