import { DataFrame } from './dataframe'; // Adjust path as needed

describe('DataFrame', () => {
  const data = [
    { name: 'Alice', age: 25, city: 'New York' },
    { name: 'Bob', age: 30, city: 'London' },
    { name: 'Charlie', age: 35, city: 'Paris' },
    { name: 'David', age: 28, city: 'Tokyo' },
    { name: 'Eve', age: 32, city: 'Sydney' },
  ];

  const columns = ['name', 'age', 'city'];

  let df: DataFrame;

  beforeEach(() => {
    df = DataFrame.fromArrayOfObjects(data);
  });

  it('should initialize with an array of objects', () => {
    expect(df.rows()).toBe(5);
    expect(df.columns()).toEqual(columns);
  });

  it('should initialize with column-oriented object', () => {
    const columnData = {
      name: ['Alice', 'Bob'],
      age: [25, 30],
      city: ['New York', 'London'],
    };
    const newDf = new DataFrame(columnData);
    expect(newDf.rows()).toBe(2);
    expect(newDf.columns()).toEqual(['name', 'age', 'city']);
  });

  it('should handle empty data', () => {
    const emptyDf = new DataFrame({});
    expect(emptyDf.rows()).toBe(0);
    expect(emptyDf.columns()).toEqual([]);
  });

  it('should clone the DataFrame', () => {
    const clonedDf = df.clone();
    expect(clonedDf).toEqual(df);
    expect(clonedDf).not.toBe(df); // Ensure it's a deep copy
  });

  it('should get the head of the DataFrame', () => {
    const headDf = df.head(2);
    expect(headDf.rows()).toBe(2);
    expect(headDf.get('name')).toEqual(['Alice', 'Bob']);
  });

  it('should get the tail of the DataFrame', () => {
    const tailDf = df.tail(2);
    expect(tailDf.rows()).toBe(2);
    expect(tailDf.get('name')).toEqual(['David', 'Eve']);
  });

  it('should get a column', () => {
    const names = df.get('name');
    expect(names).toEqual(['Alice', 'Bob', 'Charlie', 'David', 'Eve']);
  });

  it('should set a column', () => {
    df.set('age', [26, 31, 36, 29, 33]);
    expect(df.get('age')).toEqual([26, 31, 36, 29, 33]);
  });

  it('should select columns', () => {
    const selectedDf = df.select(['name', 'city']);
    expect(selectedDf.columns()).toEqual(['name', 'city']);
    expect(selectedDf.rows()).toBe(5);
  });

  it('should filter rows', () => {
    const filteredDf = df.filter((row) => row.age > 30);
    expect(filteredDf.rows()).toBe(2);
    expect(filteredDf.get('name')).toEqual(['Charlie', 'Eve']);
  });

  it('should return correct shape', () => {
    expect(df.shape()).toEqual([5, 3]);
  });

  it('should add a column', () => {
    df.addColumn('country', ['USA', 'UK', 'France', 'Japan', 'Australia']);
    expect(df.columns()).toEqual(['name', 'age', 'city', 'country']);
    expect(df.get('country')).toEqual([
      'USA',
      'UK',
      'France',
      'Japan',
      'Australia',
    ]);
  });

  it('should drop a column', () => {
    df.dropColumn('age');
    expect(df.columns()).toEqual(['name', 'city']);
    expect(() => df.get('age')).toThrowError('Column age not found.');
  });

  it('should drop a row', () => {
    df.dropRow(1);
    expect(df.rows()).toBe(4);
    expect(df.get('name')).toEqual(['Alice', 'Charlie', 'David', 'Eve']);
  });

  it('should rename a column', () => {
    df.renameColumn('age', 'years');
    expect(df.columns()).toEqual(['name', 'years', 'city']);
    expect(df.get('years')).toEqual([25, 30, 35, 28, 32]);
    expect(() => df.get('age')).toThrowError('Column age not found.');
  });

  it('should sort values', () => {
    const sortedDf = df.sortValues('age');
    expect(sortedDf.get('name')).toEqual([
      'Alice',
      'David',
      'Bob',
      'Eve',
      'Charlie',
    ]);
    const descendingDf = df.sortValues('age', false);
    expect(descendingDf.get('name')).toEqual([
      'Charlie',
      'Eve',
      'Bob',
      'David',
      'Alice',
    ]);
  });

  it('should apply a function to a column', () => {
    df.apply('age', (value) => value + 1);
    expect(df.get('age')).toEqual([26, 31, 36, 29, 33]);
  });

  it('should map a function to rows', () => {
    const mapped = df.map((row) => row.name.toUpperCase());
    expect(mapped).toEqual(['ALICE', 'BOB', 'CHARLIE', 'DAVID', 'EVE']);
  });

  it('should concat DataFrames by rows', () => {
    const df2 = DataFrame.fromArrayOfObjects([
      { name: 'Frank', age: 40, city: 'Berlin' },
    ]);
    const concatenatedDf = df.concat(df2);
    expect(concatenatedDf.rows()).toBe(6);
    expect(concatenatedDf.get('name')).toEqual([
      'Alice',
      'Bob',
      'Charlie',
      'David',
      'Eve',
      'Frank',
    ]);
  });

  it('should concat DataFrames by columns', () => {
    const df2 = DataFrame.fromArrayOfObjects([
      { country: 'USA', population: 1000000 },
      { country: 'UK', population: 500000 },
      { country: 'France', population: 750000 },
      { country: 'Japan', population: 1000000 },
      { country: 'Australia', population: 800000 },
    ]);
    const concatenatedDf = df.concat(df2, 1);
    expect(concatenatedDf.columns()).toEqual([
      'name',
      'age',
      'city',
      'country',
      'population',
    ]);
    expect(concatenatedDf.get('country')).toEqual([
      'USA',
      'UK',
      'France',
      'Japan',
      'Australia',
    ]);
  });

  it('should fill NaN values', () => {
    const dfWithNaN = DataFrame.fromArrayOfObjects([
      { name: 'Alice', age: 25, city: null },
      { name: 'Bob', age: null, city: 'London' },
      { name: 'Charlie', age: 35, city: 'Paris' },
      { name: 'David', age: 28, city: 'Tokyo' },
      { name: 'Eve', age: 32, city: 'Sydney' },
    ]);
    const filledDf = dfWithNaN.fillNa('Unknown');
    expect(filledDf.get('city')).toEqual([
      'Unknown',
      'London',
      'Paris',
      'Tokyo',
      'Sydney',
    ]);
    expect(filledDf.get('age')).toEqual([25, 'Unknown', 35, 28, 32]);
  });

  it('should get unique values from a column', () => {
    const uniqueCities = df.unique('city');
    expect(uniqueCities).toEqual([
      'New York',
      'London',
      'Paris',
      'Tokyo',
      'Sydney',
    ]);
  });

  it('should describe the DataFrame', () => {
    const description = df.describe();
    expect(description).toEqual({
      age: {
        count: 5,
        mean: 30,
        median: 30,
        min: 25,
        max: 35,
        sum: 150,
      },
      name: {
        count: 5,
        unique: 5,
      },
      city: {
        count: 5,
        unique: 5,
      },
    });
  });

  it('should calculate the mean of a column', () => {
    expect(df.mean('age')).toBe(30);
  });

  it('should calculate the median of a column', () => {
    expect(df.median('age')).toBe(30);
  });

  it('should calculate the sum of a column', () => {
    expect(df.sum('age')).toBe(150);
  });

  it('should calculate the minimum of a column', () => {
    expect(df.min('age')).toBe(25);
  });

  it('should calculate the maximum of a column', () => {
    expect(df.max('age')).toBe(35);
  });

  it('should count the non-null values in a column', () => {
    expect(df.count('age')).toBe(5);
  });

  it('should calculate the value counts of a column', () => {
    expect(df.valueCounts('city')).toEqual({
      'New York': 1,
      London: 1,
      Paris: 1,
      Tokyo: 1,
      Sydney: 1,
    });
  });

  it('should return a string representation of the DataFrame', () => {
    const expectedString = `name\tage\tcity\nAlice\t25\tNew York\nBob\t30\tLondon\nCharlie\t35\tParis\nDavid\t28\tTokyo\nEve\t32\tSydney\n`;
    expect(df.toString()).toBe(expectedString);
  });

  it('should return the data as a 2D array', () => {
    const expectedArray = [
      ['Alice', 25, 'New York'],
      ['Bob', 30, 'London'],
      ['Charlie', 35, 'Paris'],
      ['David', 28, 'Tokyo'],
      ['Eve', 32, 'Sydney'],
    ];
    expect(df.toArray()).toEqual(expectedArray);
  });

  it('should return the data as an array of objects', () => {
    const expectedObjects = [
      { name: 'Alice', age: 25, city: 'New York' },
      { name: 'Bob', age: 30, city: 'London' },
      { name: 'Charlie', age: 35, city: 'Paris' },
      { name: 'David', age: 28, city: 'Tokyo' },
      { name: 'Eve', age: 32, city: 'Sydney' },
    ];
    expect(df.toObjects()).toEqual(expectedObjects);
  });

  it('should print the DataFrame to the console', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    df.print();
    expect(consoleSpy).toHaveBeenCalledWith(df.toString());
    consoleSpy.mockRestore(); // Restore the original console.log
  });
});
