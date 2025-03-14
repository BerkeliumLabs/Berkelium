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
});